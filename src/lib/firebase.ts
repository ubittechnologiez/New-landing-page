import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import firebaseConfigData from "../../firebase-applet-config.json";

// Environment variable overrides take precedence over the workspace default
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigData.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    (import.meta.env.VITE_FIREBASE_PROJECT_ID
      ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`
      : firebaseConfigData.authDomain),
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigData.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    (import.meta.env.VITE_FIREBASE_PROJECT_ID
      ? `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`
      : firebaseConfigData.storageBucket),
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    firebaseConfigData.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigData.appId,
};

export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);

// Initialize Firestore with specific database ID if configured, or default
const targetDbId =
  import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID ||
  firebaseConfigData.firestoreDatabaseId;

export const db: Firestore =
  targetDbId && targetDbId !== "(default)" && !import.meta.env.VITE_FIREBASE_PROJECT_ID
    ? getFirestore(app, targetDbId)
    : getFirestore(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getRedirectResult,
  fbSignOut,
  onAuthStateChanged,
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
};

export type { FirebaseUser, Unsubscribe };
