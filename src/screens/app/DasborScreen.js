import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';
import { authService } from '../../services/authService';
import { deviceService } from '../../services/deviceService'; // Pakai service baru
import { notificationService } from '../../services/notificationService';

export default function DasborScreen() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const prevStatusLdr = useRef(null);

  useEffect(() => {
    // Panggil fungsi listen dari Supabase
    const unsubscribe = deviceService.listenToDevice('SCWA_001', (newData) => {
      setIsLoading(false);
      
      if (newData) {
        setData((prevData) => ({
          ...prevData,
          ...newData // Gabungkan data lama dengan update baru
        }));

        // --- Logika Notifikasi Lokal (Tetap sama) ---
        // Catatan: status_ldr di Supabase pake snake_case (kecil semua + underscore)
        const statusBaru = newData.status_ldr; 

        if (prevStatusLdr.current !== null) {
          if (prevStatusLdr.current === "GELAP" && statusBaru === "TERANG") {
            console.log("BAHAYA: CAHAYA TERDETEKSI!");
            notificationService.sendLocalLightWarning();
          }
        }
        prevStatusLdr.current = statusBaru;
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dasbor SCWA (Supabase)</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : data ? (
        <View style={styles.dataContainer}>
          <Text style={styles.dataLabel}>Suhu:</Text>
          {/* Pastikan field sesuai dengan nama kolom di Tabel Supabase (suhu) */}
          <Text style={styles.dataValue}>{data.suhu ? data.suhu.toFixed(1) : '--'} °C</Text>
          
          <Text style={styles.dataLabel}>Kelembapan:</Text>
          <Text style={styles.dataValue}>{data.kelembapan ? data.kelembapan.toFixed(0) : '--'} %</Text>
          
          <Text style={styles.dataLabel}>Status Cahaya:</Text>
          {/* Sesuaikan nama kolom: status_ldr */}
          <Text style={styles.dataValue}>{data.status_ldr || '--'}</Text>
        </View>
      ) : (
        <Text style={styles.errorText}>Menunggu data sensor...</Text>
      )}

      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color="#ff0000" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', paddingTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30 },
  dataContainer: { width: '80%', padding: 20, backgroundColor: '#f5f5f5', borderRadius: 10, alignItems: 'center' },
  dataLabel: { fontSize: 18, color: 'gray', marginTop: 15 },
  dataValue: { fontSize: 32, fontWeight: 'bold', color: '#000' },
  errorText: { fontSize: 18, color: 'red', marginTop: 20 },
  logoutButton: { width: '60%', marginTop: 'auto', marginBottom: 40 }
});