import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';
import { authService } from '../../services/authService';
import { firestoreService } from '../../services/firestoreService';
import { notificationService } from '../../services/notificationService';

export default function DasborScreen() {
  // 2. Buat state untuk simpan data sensor
  const [data, setData] = useState(null); // Awalnya null
  const [isLoading, setIsLoading] = useState(true); // Loading saat data diambil

  const prevStatusLdr = useRef(null);

  useEffect(() => {
    const unsubscribe = firestoreService.listenToRbwData((rbwData, error) => {
      if (error) {
        Alert.alert("Error", "Gagal mengambil data sensor.");
        setIsLoading(false);
      } else if (rbwData) {
        setData(rbwData);
        setIsLoading(false);

        // 3. LOGIKA "PENJAGA" DIMULAI DI SINI

        // Pertama, cek apakah "ingatan" kita sudah ada isinya
        if (prevStatusLdr.current !== null) {

          // Bandingkan "ingatan" (sebelumnya) dengan data "baru"
          const statusLama = prevStatusLdr.current;
          const statusBaru = rbwData.statusLdr;

          // Ini adalah kondisi pemicu kita!
          if (statusLama === "GELAP" && statusBaru === "TERANG") {
            // "Ingatan" bilang GELAP, tapi data "baru" bilang TERANG
            // "BERTERIAK!" (Kirim Notifikasi Lokal)
            console.log("TERDETEKSI KEBOCORAN CAHAYA! Mengirim notifikasi LOKAL...");
            notificationService.sendLocalLightWarning();
          }
        }

        // 4. SELALU UPDATE "INGATAN" dengan data terbaru
        prevStatusLdr.current = rbwData.statusLdr;

      } else {
        // Dokumen tidak ada
        Alert.alert("Error", "Data RBW tidak ditemukan di database.");
        setIsLoading(false);
      }
    });

    // 4. Berhenti "mendengar" saat layar ditutup
    return () => unsubscribe();
  }, []); // [] = Jalankan satu kali saat layar dibuka

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  // 5. Tampilkan UI Dasbor
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dasbor Real-time SCWA</Text>

      {/* Tampilkan loading jika data belum siap */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : data ? (
        // Jika data sudah siap, tampilkan:
        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>Suhu:</Text>
          <Text style={styles.dataValue}>{data.suhu.toFixed(1)} °C</Text>
          
          <Text style={styles.dataLabel}>Kelembapan:</Text>
          <Text style={styles.dataValue}>{data.kelembapan.toFixed(0)} %</Text>
          
          <Text style={styles.dataLabel}>Status Cahaya:</Text>
          <Text style={styles.dataValue}>{data.statusLdr}</Text>
        </View>
      ) : (
        // Jika data tidak ada
        <Text style={styles.errorText}>Data tidak dapat dimuat.</Text>
      )}

      <View style={styles.logoutButton}>
        <Button 
          title="Logout" 
          onPress={handleLogout} 
          color="#ff0000"
        />
      </View>
    </View>
  );
}

// Style baru untuk Dasbor kita
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'flex-start', // Mulai dari atas
    paddingTop: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  dataContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 18,
    color: 'gray',
    marginTop: 15,
  },
  dataValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  logoutButton: {
    width: '60%',
    marginTop: 'auto', // Dorong tombol ke bagian paling bawah
    marginBottom: 40,
  }
});