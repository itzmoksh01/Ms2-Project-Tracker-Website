/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// ============================================================================
// FIREBASE CONFIGURATION REFERENCE
// ============================================================================
// To connect to your custom live Firebase project:
// 1. Visit the Firebase Console (https://console.firebase.google.com/)
// 2. Create a new Web App in your project settings.
// 3. Paste your exact credentials block below.
// ============================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB5XYMfvO09PQzj51LtZ8ngl79gV730Pus",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "geometric-binder-djhcx.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "geometric-binder-djhcx",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "geometric-binder-djhcx.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "27563247128",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:27563247128:web:14280d80241aaa9338e56d",
  databaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-36fba751-89ed-4de4-8cdc-a2efd0a521aa" // Custom Firestore Database Id
};

// Initialize Firebase Core App Context
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication Service
export const auth = getAuth(app);

// Initialize Firebase Cloud Firestore with custom databaseId
export const db = initializeFirestore(app, {}, firebaseConfig.databaseId);

// Enable Firestore Offline Data Persistence (Local Cache Synchronization)
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore Persistence is unsupported by browser host');
    }
  });
} catch (e) {
  console.info('Persistence setup bypassed:', e);
}

export default app;
