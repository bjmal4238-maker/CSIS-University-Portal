// استيراد الدوال من Firebase
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// تجهيز الإعدادات من ملف الـ .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// تهيئة التطبيق بطريقة تمنع حدوث أخطاء في Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// تجهيز خدمات الـ Auth وقاعدة البيانات
const auth = getAuth(app);
const db = getFirestore(app);

// تصديرهم عشان نستخدمهم في باقي المشروع
export { app, auth, db };