import { // Ini sudah ada
    collection, doc, getDocs, onSnapshot, orderBy // <-- TAMBAHKAN INI
    , query, updateDoc
} from "firebase/firestore";
import { db } from "./firebase"; // Panggil koneksi database kita

// Fungsi untuk "mendengarkan" data RBW secara real-time
const listenToRbwData = (callback) => {
  // Tunjuk dokumen yang mau kita "intip"
  const docRef = doc(db, "rbw", "rbw_utama");

  // onSnapshot adalah "pendengar" real-time dari Firebase
  // Dia akan otomatis jalan SETIAP KALI data di 'rbw_utama' berubah
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      // Jika dokumennya ada, kirim datanya ke 'callback'
      callback(doc.data());
    } else {
      // Jika dokumen tidak ditemukan
      console.log("Tidak ada dokumen data RBW!");
      callback(null);
    }
  }, (error) => {
    // Jika ada error koneksi
    console.error("Error mendengarkan data RBW: ", error);
    callback(null, error);
  });

  // Kembalikan fungsi 'unsubscribe' agar kita bisa berhenti "mendengar"
  return unsubscribe;
};

const updatePerintahKipas = (mode) => {
  const docRef = doc(db, "rbw", "perintah");
  // updateDoc adalah fungsi bawaan Firebase untuk mengubah data
  return updateDoc(docRef, {
    modeKipas: mode // Update field 'modeKipas' dengan nilai baru
  });
};

const updatePerintahAudio = (status) => {
  const docRef = doc(db, "rbw", "perintah");
  return updateDoc(docRef, {
    panggilAudioManual: status // Update field 'panggilAudioManual'
  });
};

const getRiwayatData = async () => {
  // Tunjuk ke koleksi 'riwayat'
  const riwayatCollection = collection(db, "riwayat");
  
  // Buat query: Ambil data, urutkan berdasarkan 'timestamp' (terbaru dulu)
  const q = query(riwayatCollection, orderBy("timestamp", "desc"));

  // getDocs adalah fungsi untuk "Ambil data sekali"
  const querySnapshot = await getDocs(q);
  
  // Ubah datanya jadi array yang gampang dibaca
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });
  
  return data; // Kembalikan array berisi data
};

// Ekspor mesin baru kita
export const firestoreService = {
  listenToRbwData,
  updatePerintahKipas,
  updatePerintahAudio,
  getRiwayatData, // <-- TAMBAHKAN INI
};