import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHA2RKK6oMJouYzl7i00-hoXsr2s_A_Bk",
  authDomain: "refundboy-f2d7b.firebaseapp.com",
  projectId: "refundboy-f2d7b",
  storageBucket: "refundboy-f2d7b.firebasestorage.app",
  messagingSenderId: "588143473235",
  appId: "1:588143473235:web:252716776b2c480387cca6",
  measurementId: "G-2GCYL8H5ST"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
