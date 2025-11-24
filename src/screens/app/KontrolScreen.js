import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
import SegmentedControlTab from 'react-native-segmented-control-tab'; // <-- Import Suku Cadang
import { firestoreService } from '../../services/firestoreService'; // <-- Import "Mesin" Tulis

export default function KontrolScreen() {
  // State untuk menyimpan pilihan SegmentedControl
  // 0 = OTOMATIS, 1 = MANUAL ON, 2 = MANUAL OFF
  const [indexKipas, setIndexKipas] = useState(0); 

  const handleModeKipasChange = (index) => {
    setIndexKipas(index);
    let mode = "OTOMATIS";
    if (index === 1) {
      mode = "MANUAL_ON";
    } else if (index === 2) {
      mode = "MANUAL_OFF";
    }
    
    // Kirim perintah ke Firebase!
    firestoreService.updatePerintahKipas(mode)
      .then(() => {
        Alert.alert("Sukses", `Mode Kipas diatur ke: ${mode}`);
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  const handlePanggilAudio = () => {
    // Kirim perintah ke Firebase!
    firestoreService.updatePerintahAudio(true)
      .then(() => {
        Alert.alert("Sukses", "Perintah Panggil Audio Terkirim!");
        // (Nanti ESP32 akan set nilainya kembali ke 'false' setelah audio selesai)
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kontrol Manual Perangkat</Text>

      {/* Kontrol Kipas */}
      <View style={styles.controlBox}>
        <Text style={styles.label}>Mode Kipas Ventilasi</Text>
        <SegmentedControlTab
          values={['OTOMATIS', 'MANUAL ON', 'MANUAL OFF']}
          selectedIndex={indexKipas}
          onTabPress={handleModeKipasChange} // Panggil fungsi saat tab ditekan
          tabsContainerStyle={{ padding: 10 }}
          activeTabStyle={{ backgroundColor: 'blue' }}
        />
      </View>

      {/* Kontrol Audio */}
      <View style={styles.controlBox}>
        <Text style={styles.label}>Panggil Walet (Manual)</Text>
        <Button
          title="Putar Audio Panggil Sekarang"
          onPress={handlePanggilAudio}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  controlBox: {
    width: '100%',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
    textAlign: 'center',
  },
});