import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyA07bBALfG4FAQbr3CEVQkm6x8Qq3AB5uk",
    authDomain: "preptrack-eddec.firebaseapp.com",
    projectId: "preptrack-eddec",
    storageBucket: "preptrack-eddec.firebasestorage.app",
    messagingSenderId: "220784023631",
    appId: "1:220784023631:web:ba81e969548e85f9f9b23a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
