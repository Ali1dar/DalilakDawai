# دليلك الدوائي - React Native Android App
# ==========================================
# تحويل كامل من HTML إلى تطبيق Android نيتف

## هيكل المشروع
```
DalilakDawai/
├── App.js                          ← الملف الرئيسي
├── package.json                    ← المكتبات المطلوبة
├── android/
│   ├── build.gradle               ← إعدادات Gradle الرئيسية
│   └── app/
│       ├── build.gradle           ← إعدادات Gradle للتطبيق
│       ├── google-services.json   ← إعدادات Firebase (موجودة بالفعل!)
│       └── src/main/
│           └── AndroidManifest.xml ← الأذونات والإعدادات
└── src/
    ├── utils/
    │   ├── firebase.js            ← إعدادات Firebase + دوال مساعدة
    │   ├── theme.js               ← ألوان الوضع الفاتح/الداكن
    │   └── ThemeContext.js        ← مزود السمة للتطبيق
    ├── components/
    │   ├── Toast.js               ← إشعارات منبثقة
    │   ├── ProvincePicker.js      ← منتقي المحافظة
    │   └── SubscriptionOverlay.js ← نافذة انتهاء الاشتراك
    └── screens/
        ├── AuthScreen.js          ← تسجيل الدخول / إنشاء حساب
        ├── PatientScreen.js       ← واجهة المريض - البحث والطلبات
        ├── PharmacyScreen.js      ← واجهة الصيدلية - الطلبات الواردة
        ├── ChatScreen.js          ← المحادثة الفورية
        ├── SettingsScreen.js      ← إعدادات الحساب
        ├── NearbyScreen.js        ← الصيدليات القريبة والخافرة
        └── InboxScreen.js         ← صندوق رسائل الصيدلية
```

## خطوات التثبيت والتشغيل

### 1. المتطلبات الأساسية
- Node.js 18+
- Java JDK 17
- Android Studio + Android SDK
- React Native CLI: `npm install -g react-native-cli`

### 2. تثبيت المكتبات
```bash
cd DalilakDawai
npm install
```

### 3. تكوين Firebase
ملف `android/app/google-services.json` موجود بالفعل مع بيانات مشروعك.

### 4. ربط الأذونات Native (Android)
في ملف `android/app/src/main/java/com/dalilakedawai/MainApplication.java`
أضف الـ packages اللازمة لـ:
- react-native-image-picker
- react-native-geolocation-service  
- react-native-audio-recorder-player
- react-native-linear-gradient
- @react-native-firebase/*

### 5. تشغيل التطبيق
```bash
# تشغيل Metro Bundler
npx react-native start

# في terminal جديد - تشغيل على Android
npx react-native run-android
```

### 6. بناء APK للإصدار
```bash
cd android
./gradlew assembleRelease
# الملف: android/app/build/outputs/apk/release/app-release.apk
```

## ميزات التطبيق المحولة

### ✅ المريض
- البحث عن الدواء بالاسم أو صورة الوصفة
- تحديد الموقع الجغرافي تلقائياً
- عرض الطلبات السابقة مع الحالة
- عرض الصيدليات القريبة والخافرة حسب المحافظة
- مراسلة مباشرة مع أي صيدلية
- المحادثة مع عدة صيدليات في نفس الوقت (Tabs)
- تغيير المحافظة في أي وقت

### ✅ الصيدلية
- استقبال الطلبات الواردة من المرضى
- تحديث حالة الدواء (متوفر / غير متوفر)
- المحادثة الفورية مع المرضى
- ردود سريعة جاهزة
- إرسال موقع الصيدلية بالـ GPS
- إرسال صور وتسجيلات صوتية
- صندوق رسائل مباشرة
- إعداد أوقات العمل والخفارة والمنتجات الحصرية
- نظام اشتراك مع overlay عند الانتهاء

### ✅ مشترك
- وضع داكن/فاتح مع حفظ التفضيل
- تسجيل الدخول بالإيميل أو رقم الهاتف (OTP)
- دعم كامل للغة العربية + RTL
- إشعارات Push عبر Firebase Cloud Messaging
- Firebase Realtime Database (نفس قاعدة البيانات الأصلية)

## ملاحظة هامة
التطبيق يستخدم **نفس قاعدة بيانات Firebase الأصلية** 
(`viralboost-web-38eec-default-rtdb.firebaseio.com`)
وهذا يعني التزامن الكامل مع نسخة الويب HTML.
