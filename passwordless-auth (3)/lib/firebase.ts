// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHDpy1nPmeMpX2qHBZHY_bGnFe_2sqSpk",
  authDomain: "passwordless-project-d1475.firebaseapp.com",
  projectId: "passwordless-project-d1475",
  storageBucket: "passwordless-project-d1475.firebasestorage.app",
  messagingSenderId: "636220832655",
  appId: "1:636220832655:web:0b8bf23c97a4eacb7ba9fa",
  measurementId: "G-DQCG5B2GV3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only on client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
