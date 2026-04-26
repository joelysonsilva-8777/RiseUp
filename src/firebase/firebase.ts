import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBrywdX8dYgCwhYKmY4LwB_cGsF1cazHmc",
  authDomain: "riseup-36cb4.firebaseapp.com",
  databaseURL: "https://riseup-36cb4-default-rtdb.firebaseio.com",
  projectId: "riseup-36cb4",
  storageBucket: "riseup-36cb4.firebasestorage.app",
  messagingSenderId: "667012962091",
  appId: "1:667012962091:web:35711ec3359bae201cd76e",
  measurementId: "G-3EQWBQJTJV",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export default app;