// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// ✅ Your working Web config (appId includes :web:)
const firebaseConfig = {
  apiKey: "AIzaSyBKCvjWgU9Pb8Mga4B-zS_Js5OeDFZisSc",
  authDomain: "trackwise-d6c20.firebaseapp.com",
  projectId: "trackwise-d6c20",
  storageBucket: "trackwise-d6c20.appspot.com", // <- appspot.com is correct
  messagingSenderId: "365357403514",
  appId: "1:365357403514:web:14d2d9b22d6a56e139dac3",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 👉 IMPORTANT for React Native: initializeAuth with AsyncStorage.
//    If hot-reload already created an Auth instance, fall back to getAuth.
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // If "already-initialized", reuse the existing one.
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };

// Debug log so we can verify it booted:
console.log("✅ Firebase ready:", app.options.projectId, app.options.appId);
