import { format } from 'date-fns'; // Library untuk format tanggal (terinstal otomatis)
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit'; // <-- Import Grafik
import { firestoreService } from '../../services/firestoreService'; // <-- Import "Mesin"

// Ambil lebar layar HP
const screenWidth = Dimensions.get('window').width;

export default function RiwayatScreen() {
  const [isLoading, setIsLoading] = useState(true);
  // State untuk data grafik
  const [chartData, setChartData] = useState(null); 

  // useEffect untuk ambil data saat layar dibuka
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await firestoreService.getRiwayatData();
        
        if (data.length === 0) {
          Alert.alert("Info", "Data riwayat masih kosong.");
          setIsLoading(false);
          return;
        }

        // Data dari Firebase perlu di-format untuk 'react-native-chart-kit'
        // Kita balik urutannya (terlama ke terbaru)
        const reversedData = data.reverse(); 

        const labels = reversedData.map(item => 
          // Format timestamp jadi "Jam:Menit" atau "Tgl/Bln"
          format(item.timestamp.toDate(), 'HH:mm') 
        );
        const suhuData = reversedData.map(item => item.suhu);
        const kelembapanData = reversedData.map(item => item.kelembapan);

        // Siapkan data untuk grafik
        setChartData({
          labels: labels,
          datasets: [
            {
              data: suhuData,
              color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Merah untuk Suhu
              strokeWidth: 2,
            },
            {
              data: kelembapanData,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Biru untuk Kelembapan
              strokeWidth: 2,
            },
          ],
          legend: ["Suhu (°C)", "Kelembapan (%)"] // Label
        });

      } catch (error) {
        Alert.alert("Error", "Gagal memuat data riwayat.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // [] = Jalankan satu kali

  return (
    // Kita pakai ScrollView agar grafiknya bisa di-scroll jika datanya banyak
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Riwayat Sensor</Text>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : chartData ? (
        // Tampilkan Grafik
        <LineChart
          data={chartData}
          width={screenWidth * 0.95} // Lebar grafik
          height={400} // Tinggi grafik
          chartConfig={chartConfig}
          bezier // Bikin grafiknya melengkung (smooth)
          style={styles.chart}
        />
      ) : (
        <Text>Tidak ada data untuk ditampilkan.</Text>
      )}
    </ScrollView>
  );
}

// Konfigurasi tampilan grafik (warna, dll)
const chartConfig = {
  backgroundColor: '#e26a00',
  backgroundGradientFrom: '#f5f5f5',
  backgroundGradientTo: '#f5f5f5',
  decimalPlaces: 1, // 1 angka di belakang koma
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
  },
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Agar bisa di-scroll
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});