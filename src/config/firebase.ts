// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAr81rmkNWre1Zz_EthSR63WKVUrZe-Og",
  authDomain: "middly-e3454.firebaseapp.com",
  projectId: "middly-e3454",
  storageBucket: "middly-e3454.firebasestorage.app",
  messagingSenderId: "917368416893",
  appId: "1:917368416893:web:cd07c9a6e1d02e60945f14",
  measurementId: "G-2FP1Y5E0GV"
};

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export { app, analytics };
