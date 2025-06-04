import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration (FROM FIREBASE CONSOLE)
const firebaseConfig = {
    apiKey: "AIzaSyCsocjadcL5N4b943G-6Ni3e0vLtQPP2O4",
    authDomain: "mathify-e0d0f.firebaseapp.com",
    projectId: "mathify-e0d0f",
    storageBucket: "mathify-e0d0f.firebasestorage.app",
    messagingSenderId: "264702206959",
    appId: "1:264702206959:web:60df01b8b48651abf50c1a",
    measurementId: "G-VNE3HN70Q3"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };