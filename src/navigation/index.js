import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import AnimatedSplash from '../components/AnimatedSplash'; // <-- Import Splash Baru
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import AppTabs from './AppTabs';
import AuthStack from './AuthStack';

export default function RootNavigator() {
  const [user, setUser] = useState(null);
  
  // State Loading Data
  const [isAppReady, setIsAppReady] = useState(false);
  
  // State Tampilan Splash (Masih tampil atau tidak)
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      // 1. Cek Auth
      const unsubscribe = authService.monitorAuthState(async (userCredentials) => {
        if (userCredentials) {
          setUser(userCredentials);
          // Cek notifikasi (opsional, biar tidak blocking bisa di background)
          try {
            await notificationService.registerForPushNotificationsAsync();
          } catch (e) {
            console.error("Gagal notif:", e);
          }
        } else {
          setUser(null);
        }
        
        // 2. Beri sinyal bahwa Data sudah siap -> Animasi boleh mulai
        setTimeout(() => {
           setIsAppReady(true);
        }, 2000); // Tambah delay minimal 2 detik biar logo sempat terlihat
      });

      return () => unsubscribe();
    };

    initApp();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* 1. LAYER APLIKASI UTAMA (Di Bawah) */}
      {/* Kita render ini duluan tapi tertutup splash, supaya pas splash hilang, app sudah ada */}
      {isAppReady && (
        <NavigationContainer>
          {user ? <AppTabs /> : <AuthStack />}
        </NavigationContainer>
      )}

      {/* 2. LAYER SPLASH SCREEN (Di Atas/Overlay) */}
      {showSplash && (
        <AnimatedSplash 
          isAppReady={isAppReady} 
          onFinish={() => setShowSplash(false)} // Hapus splash setelah animasi selesai
        />
      )}
    </View>
  );
}