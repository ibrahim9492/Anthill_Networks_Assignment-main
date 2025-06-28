import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3gyqxYh2JVIMTSZqRBKDS3kcI6G755Ik",
  authDomain: "second-hand-car-app.firebaseapp.com",
  projectId: "second-hand-car-app",
  storageBucket: "second-hand-car-app.firebasestorage.app",
  messagingSenderId: "459207889826",
  appId: "1:459207889826:web:657f153916b5159cd6d8fb",
  measurementId: "G-SZ8J1X5D5M"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


export const db = getFirestore(app);