import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

export const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

let isAuthInitiated = false;

// Ensure anonymous authentication so that any client has access to Firestore rules
export async function ensureAuth() {
  if (auth.currentUser) return auth.currentUser;
  if (isAuthInitiated) return null;
  isAuthInitiated = true;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Firebase anonymous auth warning (falling back to public rules):', err);
    return null;
  }
}

// Startup connection verification
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'portfolio_state', 'connection_test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection: offline or database initializing.');
    }
  }
}

if (typeof window !== 'undefined') {
  ensureAuth();
  testConnection();
}
