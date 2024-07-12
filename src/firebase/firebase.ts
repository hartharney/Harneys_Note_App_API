import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import dotenv from 'dotenv';


dotenv.config();


const {
  API_KEY,
  AUTH_DOMAIN,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID,
  MEASUREMENT_ID,
  DATABASE_URL
} = process.env;

if (!API_KEY || !AUTH_DOMAIN || !PROJECT_ID || !STORAGE_BUCKET || !MESSAGING_SENDER_ID || !APP_ID || !DATABASE_URL) {
  throw new Error('Some Firebase environment variables are missing');
}

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID,
  databaseURL: DATABASE_URL
};



const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const firestore = getFirestore(app);
let analytics = null;

if (process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
}

export { app, database, firestore, analytics };








