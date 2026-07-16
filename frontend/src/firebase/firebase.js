import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCLNbG7iwrhwnDbUtkpL9CyGRfbgYEl9M4",
  authDomain: "siddheswari-ayurveda-8bd5c.firebaseapp.com",
  projectId: "siddheswari-ayurveda-8bd5c",
  storageBucket: "siddheswari-ayurveda-8bd5c.firebasestorage.app",
  messagingSenderId: "978533557470",
  appId: "1:978533557470:web:cf3265dd4159acd9630e4f",
  measurementId: "G-SZPT1S8WGG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Analytics (optional)
export const analytics = getAnalytics(app);

export default app;