// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKCvjWgU9Pb8Mga4B-zS_Js5OeDFZisSc",
  authDomain: "trackwise-d6c20.firebaseapp.com",
  projectId: "trackwise-d6c20",
  storageBucket: "trackwise-d6c20.firebasestorage.app",
  messagingSenderId: "365357403514",
  appId: "1:365357403514:web:14d2d9b22d6a56e139dac3"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 👇 RN/Expo requires initializeAuth + AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch { // hot reload already created it
  auth = getAuth(app);
}

const db = getFirestore(app);
console.log("✅ Firebase ready:", app.options.projectId, app.options.appId);

export { app, auth, db };
