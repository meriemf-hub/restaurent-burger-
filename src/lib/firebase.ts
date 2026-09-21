import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import localConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || localConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || localConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || localConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || localConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || localConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || localConfig.appId,
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use the designated database ID if provided, otherwise default
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID || localConfig.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);
export const storage = getStorage(app);

export { firebaseConfig, databaseId };
