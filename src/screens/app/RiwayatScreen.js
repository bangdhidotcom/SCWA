import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { deviceService } from '../../services/deviceService'; // <-- PENGGANTI firestoreService

const screenWidth = Dimensions.get('window').width;

export default function RiwayatScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null); 

  useEffect(() => {
    const loadData = async () => {
      try {
        // Panggil fungsi getHistory dari service baru
        const data = await deviceService.getHistory('SCWA_001'); // Pastikan ID sesuai
        
        if (!data || data.length === 0) {
          Alert.alert("Info", "Data riwayat masih kosong.");
          setIsLoading(false);
          return;
        }

        // Supabase mengembalikan data urut dari TERBARU -> TERLAMA.
        // Untuk grafik, kita butuh TERLAMA -> TERBARU (kiri ke kanan).
        const reversedData = [...data].reverse(); 

        const labels = reversedData.map(item => 
          // Format tanggal dari string ISO Supabase
          format(new Date(item.created_at), 'HH:mm') 
        );
        const suhuData = reversedData.map(item => item.suhu);
        const kelembapanData = reversedData.map(item => item.kelembapan);

        setChartData({
          labels: labels,
          datasets: [
            {
              data: suhuData,
              color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // Merah
              strokeWidth: 2,
            },
            {
              data: kelembapanData,
              color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // Biru
              strokeWidth: 2,
            },
          ],
          legend: ["Suhu (°C)", "Kelembapan (%)"]
        });

      } catch (error) {
        Alert.alert("Error", "Gagal memuat data riwayat.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Riwayat Sensor</Text>

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : chartData ? (
        <LineChart
          data={chartData}
          width={screenWidth * 0.95}
          height={400}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          // Tambahkan properti ini agar grafik tidak error jika data sedikit
          fromZero={true} 
          yAxisSuffix=""
        />
      ) : (
        <Text>Tidak ada data untuk ditampilkan.</Text>
      )}
    </ScrollView>
  );
}

const chartConfig = {
  backgroundColor: '#e26a00',
  backgroundGradientFrom: '#f5f5f5',
  backgroundGradientTo: '#f5f5f5',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: { r: '6', strokeWidth: '2' },
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  chart: { marginVertical: 8, borderRadius: 16 },
});