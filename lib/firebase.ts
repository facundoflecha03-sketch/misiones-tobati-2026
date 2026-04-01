import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjQt8owTErR-dod-DtUCYaqWJGjgnHEJA",
  authDomain: "misiones-mfs-3fdab.firebaseapp.com",
  projectId: "misiones-mfs-3fdab",
  storageBucket: "misiones-mfs-3fdab.firebasestorage.app",
  messagingSenderId: "968725055344",
  appId: "1:968725055344:web:55d615eeb1eaf1b9d5f1b5"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export { db };