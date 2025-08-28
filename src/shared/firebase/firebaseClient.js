// Firebase client initialization for Web Push (FCM) and optional Analytics
import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyAQvuZj_nOWZ-LZUjHVW-As8l6IdV__5s4',
  authDomain: 'matchumoney-31193.firebaseapp.com',
  projectId: 'matchumoney-31193',
  messagingSenderId: '504778922081',
  appId: '1:504778922081:web:ef1eb4659f968969f23220',
  measurementId: 'G-EZHN3FWLNT',
};

// Initialize Firebase app once
export const app = initializeApp(firebaseConfig);

// Get Messaging only if the environment supports it (Safari/HTTP may not)
export async function getMessagingIfSupported() {
  try {
    const supported = await isMessagingSupported().catch(() => false);
    return supported ? getMessaging(app) : null;
  } catch {
    return null;
  }
}

// Lazy-load Analytics only in the browser (optional)
export async function getAnalyticsIfSupported() {
  if (typeof window === 'undefined') return null;
  try {
    const { getAnalytics } = await import('firebase/analytics');
    return getAnalytics(app);
  } catch {
    return null;
  }
}
