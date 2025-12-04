import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { deviceService } from '../../services/deviceService'; // <-- PENGGANTI firestoreService

export default function KontrolScreen() {
  const [indexKipas, setIndexKipas] = useState(0); 
  const [loading, setLoading] = useState(false); // Tambah loading state biar UX bagus

  const handleModeKipasChange = async (index) => {
    setIndexKipas(index);
    let mode = "OTOMATIS";
    if (index === 1) mode = "MANUAL_ON";
    else if (index === 2) mode = "MANUAL_OFF";
    
    setLoading(true);
    try {
      // Update ke Supabase (nama kolom: mode_kipas)
      await deviceService.updateControl('SCWA_001', { mode_kipas: mode });
      Alert.alert("Sukses", `Mode Kipas diatur ke: ${mode}`);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePanggilAudio = async () => {
    setLoading(true);
    try {
      // Update ke Supabase (nama kolom: panggil_audio)
      await deviceService.updateControl('SCWA_001', { panggil_audio: true });
      Alert.alert("Sukses", "Audio dipanggil! (Akan mati otomatis via alat)");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kontrol Manual Perangkat</Text>

      <View style={styles.controlBox}>
        <Text style={styles.label}>Mode Kipas Ventilasi</Text>
        <SegmentedControlTab
          values={['OTOMATIS', 'MANUAL ON', 'MANUAL OFF']}
          selectedIndex={indexKipas}
          onTabPress={handleModeKipasChange}
          tabsContainerStyle={{ padding: 10 }}
          activeTabStyle={{ backgroundColor: 'blue' }}
          enabled={!loading} // Matikan tombol saat loading
        />
      </View>

      <View style={styles.controlBox}>
        <Text style={styles.label}>Panggil Walet (Manual)</Text>
        <Button
          title={loading ? "Mengirim..." : "Putar Audio Panggil Sekarang"}
          onPress={handlePanggilAudio}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 40, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 30 },
  controlBox: { width: '100%', marginBottom: 30, padding: 15, backgroundColor: '#f5f5f5', borderRadius: 10 },
  label: { fontSize: 18, fontWeight: '500', marginBottom: 15, textAlign: 'center' },
});