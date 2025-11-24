import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native'; // Kita butuh loading

import { authService } from '../services/authService'; // <-- Panggil "Mesin" auth
import { notificationService } from '../services/notificationService';
import AppTabs from './AppTabs'; // Peta jika sudah login
import AuthStack from './AuthStack'; // Peta jika belum login

export default function RootNavigator() {
  // state untuk menyimpan info user
  const [user, setUser] = useState(null); 
  // state untuk loading (saat pertama kali buka aplikasi)
  const [isLoading, setIsLoading] = useState(true);

  // useEffect adalah "kail" React.
  // Kode di dalamnya akan jalan OTOMATIS saat komponen ini dimuat.
  useEffect(() => {
    // 2. TAMBAHKAN 'async' LAGI
    const unsubscribe = authService.monitorAuthState(async (userCredentials) => { 
      if (userCredentials) {
        setUser(userCredentials);
        
        // 3. HIDUPKAN LAGI SEMUA KODE NOTIFIKASI INI
        try {
          // Kita akan panggil fungsi yang error 'projectId' itu
          // Harusnya sekarang tidak error di 'mobil rakitan' ini
          await notificationService.registerForPushNotificationsAsync();
        } catch (e) {
          console.error("Gagal mendaftarkan notifikasi:", e);
        }
        
      } else {
        // Jika TIDAK ADA, set user jadi null
        setUser(null);
      }
      // Selesai mengecek, matikan loading
      setIsLoading(false);
    });

    // Wajib: Berhenti "mendengar" saat komponen ditutup
    return () => unsubscribe(); 
  }, []); // [] artinya "jalankan ini satu kali saja saat start"

  // 1. Tampilkan loading dulu saat kita mengecek ke Firebase
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 2. Setelah selesai loading, baru kita cek:
  //    Jika state 'user' ADA ISINYA, lempar ke AppTabs (Dasbor)
  //    Jika state 'user' KOSONG (null), lempar ke AuthStack (Login)
  return (
    <NavigationContainer>
      {user ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});