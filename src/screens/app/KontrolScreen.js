import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAlert } from '../../services/AlertContext';
import { deviceService } from '../../services/deviceService';
import { useTheme } from '../../services/ThemeContext';

export default function KontrolScreen() {
  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [activeFanMode, setActiveFanMode] = useState('OTOMATIS'); 
  const [loading, setLoading] = useState(false);

  const updateFanMode = async (mode) => {
    setActiveFanMode(mode);
    setLoading(true);
    try {
      await deviceService.updateControl('SCWA_001', { mode_kipas: mode });
    } catch (error) {
      showAlert("Gagal", "Gagal mengirim perintah ke alat.", "error");
    } finally {
      setLoading(false);
    }
  };

  const triggerAudio = async () => {
    setLoading(true);
    try {
      await deviceService.updateControl('SCWA_001', { panggil_audio: true });
      showAlert("Berhasil", "Audio Panggil sedang diputar di RBW.", "success");
    } catch (error) {
      showAlert("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const renderFanButton = (label, mode, icon) => {
    const isActive = activeFanMode === mode;
    return (
      <TouchableOpacity 
        style={[
          styles.fanButton, 
          { backgroundColor: isActive ? colors.primary : (isDark ? '#334155' : '#f5f6fa'), borderColor: isActive ? colors.primary : colors.border }
        ]} 
        onPress={() => updateFanMode(mode)}
        disabled={loading}
      >
        <Icon name={icon} size={24} color={isActive ? '#fff' : colors.subText} />
        <Text style={[styles.fanButtonText, { color: isActive ? '#fff' : colors.subText }]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.pageTitle, { color: colors.text }]}>Pusat Kontrol</Text>
      
      {loading && <ActivityIndicator size="small" color={colors.primary} style={styles.loadingIndicator} />}

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? '#334155' : '#ebf5fb' }]}>
            <Icon name="fan" size={24} color="#3498db" />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Kipas Ventilasi</Text>
            <Text style={[styles.cardSubtitle, { color: colors.subText }]}>Atur mode sirkulasi udara</Text>
          </View>
        </View>
        
        <View style={styles.fanControls}>
          {renderFanButton('Otomatis', 'OTOMATIS', 'robot')}
          {renderFanButton('Nyala Terus', 'MANUAL_ON', 'power-on')}
          {renderFanButton('Mati', 'MANUAL_OFF', 'power-off')}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? '#334155' : '#fef5e7' }]}>
            <Icon name="speaker-wireless" size={24} color="#e67e22" />
          </View>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Panggil Walet</Text>
            <Text style={[styles.cardSubtitle, { color: colors.subText }]}>Putar suara panggil manual (10 menit)</Text>
          </View>
        </View>

        <TouchableOpacity onPress={triggerAudio} disabled={loading} activeOpacity={0.8}>
          <LinearGradient
            colors={['#e67e22', '#f39c12']}
            style={styles.audioButton}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          >
            <Icon name="play-circle-outline" size={32} color="#fff" />
            <Text style={styles.audioButtonText}>PUTAR AUDIO SEKARANG</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 30 },
  loadingIndicator: { position: 'absolute', top: 40, right: 0 },
  
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 45, height: 45, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 13 },

  fanControls: { flexDirection: 'row', justifyContent: 'space-between' },
  fanButton: {
    width: '31%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  fanButtonText: { marginTop: 8, fontSize: 12, fontWeight: '600', textAlign: 'center' },

  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#e67e22',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
  },
  audioButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
});