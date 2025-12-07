import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeHeader from '../../components/HomeHeader';
import MarqueeText from '../../components/ui/MarqueeText';
import { useAlert } from '../../services/AlertContext';
import { useTheme } from '../../services/ThemeContext';
import { deviceService } from '../../services/deviceService';
import { notificationService } from '../../services/notificationService';
import { supabase } from '../../services/supabase';
import { weatherService } from '../../services/weatherService';

export default function DasborScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  
  const [data, setData] = useState({ suhu: 0, kelembapan: 0, status_ldr: '...' });
  const [weather, setWeather] = useState(null); 
  const [deviceId, setDeviceId] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const weatherData = await weatherService.getWeather();
        setWeather(weatherData);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const myDevice = await deviceService.getUserDevice(user.id);
          if (myDevice) {
            setDeviceId(myDevice.device_id);
            const token = await notificationService.registerForPushNotificationsAsync();
            if (token) await deviceService.updatePushToken(myDevice.device_id, token);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    initDashboard();
  }, []);

  useEffect(() => {
    if (!deviceId) return;

    const unsubscribe = deviceService.listenToDevice(deviceId, (newData) => {
      if (newData) setData((prev) => ({ ...prev, ...newData }));
    });

    return () => unsubscribe();
  }, [deviceId]);

  const handleSettings = () => navigation.navigate('Settings');
  const handleNotif = () => navigation.navigate('Notifications');

  const getStatusColor = (status) => status === 'GELAP' ? '#2ecc71' : '#e74c3c';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient 
        colors={isDark ? ['#0f2027', '#203a43'] : ['#004e92', '#2b5876']} 
        style={styles.headerBg}
      >
        <HomeHeader 
          onSettingsPress={handleSettings} 
          onNotificationPress={handleNotif} 
        />
        
        <View style={[styles.weatherCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          {weather ? (
            <View style={styles.weatherRow}>
              <View style={[styles.weatherIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,168,255,0.1)' }]}>
                <Image 
                  source={{ uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png` }} 
                  style={{ width: 50, height: 50 }} 
                />
              </View>
              <View style={{ flex: 1, overflow: 'hidden' }}>
                <Text style={[styles.weatherTemp, { color: colors.text }]}>{weather.temp}°C</Text>
                
                <MarqueeText 
                  text={`${weather.city} • ${weather.desc.charAt(0).toUpperCase() + weather.desc.slice(1)}`} 
                  style={[styles.weatherCity, { color: colors.subText }]} 
                />
              
              </View>
            </View>
          ) : (
            <View style={styles.weatherRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={{ marginLeft: 10, color: colors.subText }}>Memuat cuaca...</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.contentContainer} 
        contentContainerStyle={{ paddingTop: 50, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoading} tintColor={colors.primary} />}
      >
        {!deviceId && !isLoading ? (
          <Text style={{ textAlign: 'center', color: colors.subText }}>Belum ada alat terhubung.</Text>
        ) : (
          <>
            <View style={styles.gridContainer}>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#334155' : '#fef5e7' }]}>
                  <Icon name="thermometer" size={30} color="#e67e22" />
                </View>
                <Text style={[styles.cardLabel, { color: colors.subText }]}>Suhu</Text>
                <Text style={[styles.cardValue, { color: colors.text }]}>
                  {data.suhu ? parseFloat(data.suhu).toFixed(1) : '--'}°C
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#334155' : '#ebf5fb' }]}>
                  <Icon name="water-percent" size={30} color="#3498db" />
                </View>
                <Text style={[styles.cardLabel, { color: colors.subText }]}>Lembap</Text>
                <Text style={[styles.cardValue, { color: colors.text }]}>
                  {data.kelembapan ? parseFloat(data.kelembapan).toFixed(0) : '--'}%
                </Text>
              </View>
            </View>

            <View style={[styles.wideCard, { backgroundColor: colors.card }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconCircle, { backgroundColor: getStatusColor(data.status_ldr) }]}>
                  <Icon name={data.status_ldr === 'GELAP' ? "weather-night" : "white-balance-sunny"} size={28} color="#fff" />
                </View>
                <View style={{ marginLeft: 15 }}>
                  <Text style={[styles.wideCardLabel, { color: colors.subText }]}>Sensor Cahaya</Text>
                  <Text style={[styles.wideCardValue, { color: getStatusColor(data.status_ldr) }]}>
                    {data.status_ldr || '...'}
                  </Text>
                </View>
              </View>
              <Text style={styles.wideCardDesc}>
                {data.status_ldr === 'GELAP' 
                  ? "Kondisi aman. Burung walet nyaman." 
                  : "PERINGATAN: Ada cahaya masuk!"}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { 
    paddingBottom: 50, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30,
    zIndex: 10 
  },
  weatherCard: {
    position: 'absolute',
    bottom: -35,
    left: 20,
    right: 20,
    borderRadius: 20,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  weatherRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  weatherIconBg: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  weatherTemp: { fontSize: 24, fontWeight: 'bold' },
  weatherCity: { fontSize: 14, textTransform: 'capitalize', width: '100%' }, 

  contentContainer: { flex: 1, paddingHorizontal: 20 },
  
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, marginTop: 10 },
  card: { width: '48%', borderRadius: 20, padding: 15, shadowColor: "#000", elevation: 3, alignItems: 'center' },
  iconCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  cardLabel: { fontSize: 14, marginBottom: 5 },
  cardValue: { fontSize: 28, fontWeight: 'bold' },

  wideCard: { borderRadius: 20, padding: 20, shadowColor: "#000", elevation: 3 },
  wideCardLabel: { fontSize: 14 },
  wideCardValue: { fontSize: 20, fontWeight: 'bold' },
  wideCardDesc: { marginTop: 15, fontSize: 13, color: '#7f8c8d', fontStyle: 'italic' },
});