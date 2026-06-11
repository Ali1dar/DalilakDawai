// App.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, StatusBar, Platform, Text, TouchableOpacity, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';
import { firebaseAuth, db } from './src/utils/firebase';
import AuthScreen from './src/screens/AuthScreen';
import PatientScreen from './src/screens/PatientScreen';
import PharmacyScreen from './src/screens/PharmacyScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NearbyScreen from './src/screens/NearbyScreen';
import InboxScreen from './src/screens/InboxScreen';
import SubscriptionOverlay from './src/components/SubscriptionOverlay';
import Toast from './src/components/Toast';

function AppContent() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // UI state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatPharmacyId, setChatPharmacyId] = useState(null);
  const [chatName, setChatName] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [subBlock, setSubBlock] = useState({ show: false, message: '' });
  const [province, setProvince] = useState('بغداد');
  const [requests, setRequests] = useState([]);
  const [globalUnread, setGlobalUnread] = useState(false);

  const userDataRef = useRef(null);
  const loaderAnim = useRef(new Animated.Value(1)).current;

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged(u => {
      if (u) {
        setUser(u);
        db.ref(`users/${u.uid}`).on('value', snap => {
          const data = snap.val();
          setUserData(data);
          userDataRef.current = data;
          const prov = data?.province || 'بغداد';
          setProvince(prov);

          if (data?.role === 'pharmacy') {
            checkSubscription(data.subscriptionExpiry);
          } else {
            setSubBlock({ show: false, message: '' });
          }

          setLoading(false);
          Animated.timing(loaderAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start();
        });
      } else {
        setUser(null);
        setUserData(null);
        setSubBlock({ show: false, message: '' });
        setLoading(false);
        Animated.timing(loaderAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start();
      }
    });
    return unsubscribe;
  }, []);

  // Listen for unread inbox (pharmacy)
  useEffect(() => {
    if (!user || userData?.role !== 'pharmacy') return;
    const uid = user.uid;
    const ref = db.ref('chats');
    const listener = ref.on('value', snap => {
      let hasUnread = false;
      if (snap.exists()) {
        snap.forEach(child => {
          if (child.key.includes(uid)) {
            const data = child.val()[uid] || {};
            if ((data.unreadPharmacy || 0) > 0) hasUnread = true;
          }
        });
      }
      setGlobalUnread(hasUnread);
    });
    return () => ref.off('value', listener);
  }, [user, userData?.role]);

  function checkSubscription(expiry) {
    if (expiry === undefined || expiry === null || expiry === '') {
      setSubBlock({ show: true, message: 'عذراً، لم يتم العثور على صلاحية اشتراك مسجلة لهذا الحساب.' });
      return;
    }
    const n = Number(expiry);
    if (n === -1) { setSubBlock({ show: false, message: '' }); return; }
    if (isNaN(n) || n <= 0 || (n - Date.now()) <= 0) {
      setSubBlock({ show: true, message: 'لقد انتهت فترة صلاحية الاشتراك الحالية المخصصة لصيدليتكم.' });
    } else {
      setSubBlock({ show: false, message: '' });
    }
  }

  const handleOpenChat = (id, name, pharmacyIdOverride = null) => {
    setChatId(id);
    setChatName(name);
    setChatPharmacyId(pharmacyIdOverride || (userData?.role === 'pharmacy' ? user?.uid : null));
    setChatOpen(true);
  };

  const handleOpenDirectChat = (pharmacyId, pharmName) => {
    const directId = `p_${user.uid}_${pharmacyId}`;
    setChatId(directId);
    setChatName('محادثة: ' + pharmName);
    setChatPharmacyId(pharmacyId);
    setChatOpen(true);
  };

  const handleProvinceChange = async (newProv) => {
    setProvince(newProv);
    if (user) {
      await db.ref(`users/${user.uid}`).update({ province: newProv });
      showToast(`تم تغيير المحافظة بنجاح إلى: ${newProv} 📍`);
    }
  };

  const handleLogout = async () => {
    if (user) {
      await db.ref(`users/${user.uid}/presence/online`).set(false);
    }
    await firebaseAuth.signOut();
    showToast('تم تسجيل الخروج');
  };

  const s = makeStyles(theme);

  // Loader screen
  if (loading) {
    return (
      <View style={[s.loaderScreen, { backgroundColor: theme.bg }]}>
        <Text style={[s.loaderTitle, { color: theme.primary }]}>دليلك الدوائي...</Text>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="#00796b"
      />

      {/* Auth Screen */}
      {!user && <AuthScreen onToast={showToast} />}

      {/* Main App */}
      {user && (
        <View style={{ flex: 1 }}>
          {/* Top Header */}
          <LinearGradient colors={['#00796b', '#004d40']} style={s.header}>
            <Text style={s.headerTitle}>دليلك الدوائي</Text>
            <View style={s.headerBtns}>
              <TouchableOpacity style={s.hBtn} onPress={toggleTheme}>
                <Text style={s.hBtnText}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
              {userData?.role === 'pharmacy' && (
                <TouchableOpacity
                  style={[s.hBtn, { backgroundColor: '#0288d1' }]}
                  onPress={() => setInboxOpen(true)}>
                  <Text style={s.hBtnText}>
                    💬 الرسائل {globalUnread ? '🔴' : ''}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[s.hBtn, { backgroundColor: '#ff9800' }]} onPress={() => setSettingsOpen(true)}>
                <Text style={s.hBtnText}>⚙️ الحساب</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.hBtn, { backgroundColor: '#e53935' }]} onPress={handleLogout}>
                <Text style={s.hBtnText}>خروج</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Patient View */}
          {userData?.role !== 'pharmacy' && (
            <PatientScreen
              onOpenChat={handleOpenChat}
              onOpenNearby={() => setNearbyOpen(true)}
              onToast={showToast}
              province={province}
              onProvinceChange={handleProvinceChange}
            />
          )}

          {/* Pharmacy View */}
          {userData?.role === 'pharmacy' && (
            <PharmacyScreen
              onOpenChat={handleOpenChat}
              onToast={showToast}
              province={province}
              pharmacyName={userData?.pharmacyName || 'الصيدلية'}
              userId={user.uid}
            />
          )}
        </View>
      )}

      {/* Chat Overlay */}
      <ChatScreen
        visible={chatOpen}
        onClose={() => setChatOpen(false)}
        chatId={chatId}
        pharmacyId={chatPharmacyId}
        role={userData?.role || 'patient'}
        requestName={chatName}
        localRequests={requests}
        onToast={showToast}
      />

      {/* Settings Overlay */}
      <SettingsScreen
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onToast={showToast}
        role={userData?.role}
        userData={userData}
      />

      {/* Nearby Pharmacies Modal */}
      <NearbyScreen
        visible={nearbyOpen}
        onClose={() => setNearbyOpen(false)}
        province={province}
        onDirectChat={handleOpenDirectChat}
      />

      {/* Inbox (pharmacy) */}
      <InboxScreen
        visible={inboxOpen}
        onClose={() => setInboxOpen(false)}
        onOpenChat={(chatId) => {
          setInboxOpen(false);
          setChatId(chatId);
          setChatName('محادثة واردة');
          setChatPharmacyId(user.uid);
          setChatOpen(true);
        }}
      />

      {/* Subscription Block Overlay */}
      <SubscriptionOverlay visible={subBlock.show} message={subBlock.message} />

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} type={toast.type} />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const makeStyles = (theme) => StyleSheet.create({
  root: { flex: 1 },
  loaderScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loaderTitle: { fontSize: 22, fontWeight: 'bold' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, paddingTop: Platform.OS === 'android' ? 40 : 55,
  },
  headerTitle: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  headerBtns: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', alignItems: 'center' },
  hBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20,
  },
  hBtnText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
});
