import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, enableNetwork, disableNetwork } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
}, firebaseConfig.firestoreDatabaseId);

// Handle online/offline mode explicitly for PWA
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => enableNetwork(db).catch(console.error));
  window.addEventListener('offline', () => disableNetwork(db).catch(console.error));
}

export const googleProvider = new GoogleAuthProvider();
