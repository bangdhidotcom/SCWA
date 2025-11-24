import * as expoDevice from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Konfigurasi tampilan notifikasi saat aplikasi JALAN (di foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Fungsi untuk meminta izin notifikasi
const registerForPushNotificationsAsync = async () => {
  let token;
  
  // Hanya jalan di HP sungguhan, bukan emulator
  if (expoDevice.isDevice) {
    // Cek izin yang sudah ada
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Jika belum ada izin, kita MINTA
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Jika user TIDAK KASIH IZIN, kita berhenti
    if (finalStatus !== 'granted') {
      alert('Gagal mendapatkan izin untuk notifikasi!');
      return;
    }
    
    // Jika diizinkan, AMBIL "Alamat" (Push Token) HP ini
    try {
      const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
        // Kita butuh projectId dari app.json
        // Ganti 'YOUR_PROJECT_ID' dengan ID dari app.json jika ada
        // atau biarkan Expo yang urus
      });
      token = pushToken;
      console.log("Expo Push Token:", token); // <-- KITA BUTUH INI NANTI
    } catch (e) {
      console.error("Error getting push token", e);
      alert('Error saat mengambil Push Token. ' + e.message);
    }

  } else {
    alert('Harus menggunakan HP fisik untuk Push Notifications');
  }

  // Atur setelan notifikasi untuk Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token; // Kembalikan "Alamat" token-nya
};

const sendLocalLightWarning = () => {
  // scheduleNotificationAsync adalah fungsi bawaan Expo
  Notifications.scheduleNotificationAsync({
    content: {
      title: "PERINGATAN SCWA!",
      body: "Terdeteksi kebocoran cahaya di dalam RBW!",
      sound: "default", // Mainkan suara notif standar
    },
    trigger: {
      seconds: 1, // Kirim notifikasinya 1 detik dari sekarang
    },
  });
};

export const notificationService = {
  registerForPushNotificationsAsync,
  sendLocalLightWarning, // <-- TAMBAHKAN FUNGSI BARU INI
};