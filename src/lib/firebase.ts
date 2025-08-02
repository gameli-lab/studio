// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "astrobook-hf09d",
  appId: "1:977553383092:web:b0ec28feb116c7d69a41e1",
  storageBucket: "astrobook-hf09d.firebasestorage.app",
  apiKey: "AIzaSyBwLbCW-ATjOqRVZsxW_JSy1ct_Ppow_oU",
  authDomain: "astrobook-hf09d.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "977553383092"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
