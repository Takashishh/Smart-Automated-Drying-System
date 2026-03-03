import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCkPtysjodxh356vyuQSaAhg59xjeHjMVU",
  authDomain: "smart-drying-iot.firebaseapp.com",
  databaseURL: "https://smart-drying-iot-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-drying-iot",
  storageBucket: "smart-drying-iot.firebasestorage.app",
  messagingSenderId: "346631879936",
  appId: "1:346631879936:web:8bbd6c286ca6a3d9ec47e5",
  measurementId: "G-PNJNCYJWC2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
