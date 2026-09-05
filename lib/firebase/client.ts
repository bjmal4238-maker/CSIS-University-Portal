"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-ZH-QHrQXozohbQH5uUsOrVnSrS0vD_s",
  authDomain: "csis-university-portal.firebaseapp.com",
  databaseURL: "https://csis-university-portal-default-rtdb.firebaseio.com",
  projectId: "csis-university-portal",
  storageBucket: "csis-university-portal.firebasestorage.app",
  messagingSenderId: "373051121099",
  appId: "1:373051121099:web:c2c0b111e18bd7a5ecaa4e",
  measurementId: "G-585VG193PF",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  void isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { app, auth, db, storage, analytics };
