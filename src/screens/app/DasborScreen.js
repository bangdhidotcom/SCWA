import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAlert } from '../../services/AlertContext';
import { authService } from '../../services/authService';
import { deviceService } from '../../services/deviceService';
import { notificationService } from '../../services/notificationService';
import { useTheme } from '../../services/ThemeContext';

export default function DasborScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  const [data, setData] = useState({ suhu: 0, kelembapan: 0, status_ldr: '...' });
  const [isLoading, setIsLoading] = useState(true);
  const prevStatusLdr = useRef(null);

  useEffect(() => {
    const unsubscribe = deviceService.listenToDevice('SCWA_001', (newData) => {
      setIsLoading(false);
      if (newData) {
        setData((prevData) => ({ ...prevData, ...newData }));

        const statusBaru = newData.status_ldr; 
        if (prevStatusLdr.current !== null && prevStatusLdr.current === "GELAP" && statusBaru === "TERANG") {
          notificationService.sendLocalLightWarning();
        }
        prevStatusLdr.current = statusBaru;
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    showAlert(
      "Konfirmasi", 
      "Apakah Anda yakin ingin keluar dari aplikasi?", 
      "confirm", 
      () => authService.logout()
    );
  };

  const getStatusColor = (status) => status === 'GELAP' ? '#2ecc71' : '#e74c3c';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient 
        colors={isDark ? ['#0f2027', '#203a43'] : ['#004e92', '#2b5876']} 
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>Halo, Pemilik Walet!</Text>
            <Text style={styles.subGreetingText}>Pantau RBW Anda secara realtime</Text>
          </View>
          
          <View style={{flexDirection: 'row', gap: 10}}>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              <Icon name={isDark ? "white-balance-sunny" : "moon-waning-crescent"} size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
              <Icon name="logout" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.contentContainer} 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} tintColor={colors.primary} />}
      >
        {/* Status Connection */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Sistem Terhubung ke Server</Text>
        </View>

        <View style={styles.gridContainer}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#334155' : '#fef5e7' }]}>
              <Icon name="thermometer" size={30} color="#e67e22" />
            </View>
            <Text style={[styles.cardLabel, { color: colors.subText }]}>Suhu Ruangan</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{data.suhu ? parseFloat(data.suhu).toFixed(1) : '--'}°C</Text>
            <Text style={styles.cardFooter}>Target: 26°C - 29°C</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#334155' : '#ebf5fb' }]}>
              <Icon name="water-percent" size={30} color="#3498db" />
            </View>
            <Text style={[styles.cardLabel, { color: colors.subText }]}>Kelembapan</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{data.kelembapan ? parseFloat(data.kelembapan).toFixed(0) : '--'}%</Text>
            <Text style={styles.cardFooter}>Target: 80% - 90%</Text>
          </View>
        </View>

        <View style={[styles.wideCard, { backgroundColor: colors.card }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconCircle, { backgroundColor: getStatusColor(data.status_ldr) }]}>
                <Icon name={data.status_ldr === 'GELAP' ? "weather-night" : "white-balance-sunny"} size={28} color="#fff" />
              </View>
              <View style={{ marginLeft: 15 }}>
                <Text style={[styles.wideCardLabel, { color: colors.subText }]}>Sensor Cahaya</Text>
                <Text style={[styles.wideCardValue, { color: getStatusColor(data.status_ldr) }]}>
                  {data.status_ldr || 'Memuat...'}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.wideCardDesc}>
            {data.status_ldr === 'GELAP' 
              ? "Kondisi aman. Burung walet nyaman beristirahat." 
              : "PERINGATAN: Cahaya terdeteksi di dalam ruang inap!"}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  subGreetingText: { fontSize: 14, color: '#dbeafe' },
  iconButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12, marginLeft: 8 },
  
  contentContainer: { flex: 1, marginTop: -20, paddingHorizontal: 20 },
  
  statusCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 20, marginBottom: 15, alignSelf: 'center', shadowColor: "#000", shadowOpacity: 0.05, elevation: 2, paddingHorizontal: 20 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71', marginRight: 8 },
  statusText: { fontSize: 12, color: '#2ecc71', fontWeight: '600' },

  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  card: { width: '48%', borderRadius: 20, padding: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 4, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardLabel: { fontSize: 14, marginBottom: 5 },
  cardValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  cardFooter: { fontSize: 10, color: '#95a5a6' },

  wideCard: { borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 4 },
  wideCardLabel: { fontSize: 14 },
  wideCardValue: { fontSize: 20, fontWeight: 'bold' },
  wideCardDesc: { marginTop: 15, fontSize: 13, color: '#7f8c8d', fontStyle: 'italic', lineHeight: 20 },
});