import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 1. Import fungsi Auth yang baru
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
// 2. Import "Penyimpanan" yang baru kita instal
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Ini adalah "Kunci Rahasia" Anda
const firebaseConfig = {
  apiKey: "AIzaSyATkxOtabId254G7KjQBoRcV9A2AwofpP8",
  authDomain: "scwa-project.firebaseapp.com",
  projectId: "scwa-project",
  storageBucket: "scwa-project.firebasestorage.app",
  messagingSenderId: "608328851383",
  appId: "1:608328851383:web:ef69ff7abfa949d1ab9232"
};

// Inisialisasi aplikasi Firebase
const app = initializeApp(firebaseConfig);

// 3. Inisialisasi Auth DENGAN PENYIMPANAN (Persistence)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Inisialisasi Firestore (tetap sama)
const db = getFirestore(app);

// Ekspor layanan ini
export { auth, db };
