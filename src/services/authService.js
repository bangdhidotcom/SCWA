import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "./firebase"; // Kita panggil "koneksi" auth dari firebase.js

// Fungsi untuk LOGIN
const login = (email, password) => {
  // signInWith... adalah fungsi bawaan Firebase
  return signInWithEmailAndPassword(auth, email, password);
};

// Fungsi untuk DAFTAR AKUN BARU
const signUp = (email, password) => {
  // createUserWith... adalah fungsi bawaan Firebase
  return createUserWithEmailAndPassword(auth, email, password);
};

// Fungsi untuk LOGOUT
const logout = () => {
  return signOut(auth);
};

// Fungsi untuk MENGECEK status login (penting!)
// 'callback' adalah fungsi yang akan dijalankan saat status berubah
const monitorAuthState = (callback) => {
  // onAuthStateChanged adalah "pendengar" bawaan Firebase
  // Dia akan otomatis jalan saat user login atau logout
  return onAuthStateChanged(auth, callback);
};

// Ekspor semua fungsi ini agar bisa dipakai di layar lain
export const authService = {
  login,
  signUp,
  logout,
  monitorAuthState,
};