import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Konfigurasi Partikel Api
const PARTICLE_COUNT = 12; // Jumlah percikan
const PARTICLES = Array.from({ length: PARTICLE_COUNT }).map((_, i) => i);

export default function AnimatedSplash({ onFinish, isAppReady }) {
  // Nilai animasi Utama
  const rotation = useSharedValue(0);       
  const birdOpacity = useSharedValue(1);    
  const birdScale = useSharedValue(1);
  const logoOpacity = useSharedValue(0);    
  const flyX = useSharedValue(0);           

  // Nilai untuk Percikan Api
  const sparkProgress = useSharedValue(0);
  const sparkOpacity = useSharedValue(1);

  // Jejak Bayangan (Ghost)
  const ghost1X = useSharedValue(0);
  const ghost2X = useSharedValue(0);
  const ghostOpacity = useSharedValue(0); 

  useEffect(() => {
    if (isAppReady) {
      // --- SKENARIO ANIMASI ---

      // 1. BURUNG MUMET (Durasi 1500ms - Sedikit diperlama biar puas lihat apinya)
      rotation.value = withTiming(1440, { // 4 Putaran penuh
        duration: 1500, 
        easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
      });

      // 1.5 EFEK PERCIKAN API (Muncrat berulang selama burung muter)
      sparkProgress.value = withRepeat(
        withTiming(1, { duration: 500, easing: Easing.out(Easing.quad) }), 
        3, // Ulangi 3 kali (muncrat-muncrat-muncrat)
        false 
      );
      // Matikan api saat burung selesai muter
      sparkOpacity.value = withDelay(1400, withTiming(0, { duration: 200 }));

      // 2. BURUNG MENGHILANG
      birdOpacity.value = withDelay(1300, withTiming(0, { duration: 400 }));
      birdScale.value = withDelay(1300, withTiming(0.5, { duration: 400 })); 

      // 3. LOGO FULL MUNCUL
      logoOpacity.value = withDelay(1500, withTiming(1, { duration: 400 }));
      ghostOpacity.value = withDelay(1500, withTiming(0.5, { duration: 400 }));

      // 4. TERBANG KE KANAN (LEBIH PELAN & SMOOTH)
      // Delay diperpanjang dikit biar transisi logo full kelihatan dulu
      const flyDelay = 2200; 
      const flyDuration = 1500; // DIUBAH: Jadi 1.5 detik (lebih pelan & bisa dinikmati)
      
      const targetX = width + 300; 
      // DIUBAH: Pakai Easing yang lebih linear/santai, bukan exponential
      const flyEasing = Easing.inOut(Easing.quad); 

      // Logo Utama Terbang
      flyX.value = withDelay(flyDelay, withTiming(targetX, {
        duration: flyDuration,
        easing: flyEasing
      }, () => {
        runOnJS(onFinish)(); 
      }));

      // Bayangan 1 (Tertinggal 80ms - jarak agak jauh biar kelihatan speednya)
      ghost1X.value = withDelay(flyDelay + 80, withTiming(targetX, {
        duration: flyDuration,
        easing: flyEasing
      }));
      
      // Bayangan 2 (Tertinggal 160ms)
      ghost2X.value = withDelay(flyDelay + 160, withTiming(targetX, {
        duration: flyDuration,
        easing: flyEasing
      }));
    }
  }, [isAppReady]);

  // --- STYLE ANIMASI ---

  const birdStyle = useAnimatedStyle(() => ({
    opacity: birdOpacity.value,
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: birdScale.value }
    ],
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateX: flyX.value }]
  }));

  const ghost1Style = useAnimatedStyle(() => ({
    opacity: ghostOpacity.value, 
    transform: [{ translateX: ghost1X.value }]
  }));

  const ghost2Style = useAnimatedStyle(() => ({
    opacity: ghostOpacity.value * 0.6, 
    transform: [{ translateX: ghost2X.value }]
  }));

  // Komponen Kecil untuk 1 Butir Percikan
  const Sparkle = ({ index }) => {
    const style = useAnimatedStyle(() => {
      const angle = (index * (360 / PARTICLE_COUNT)) * (Math.PI / 180); // Hitung sudut
      const radius = interpolate(sparkProgress.value, [0, 1], [30, 120]); // Jarak muncrat (30px ke 120px)
      const opacity = interpolate(sparkProgress.value, [0, 0.8, 1], [1, 1, 0]); // Fade out di akhir
      const scale = interpolate(sparkProgress.value, [0, 1], [1, 0.5]); // Mengecil saat jauh

      return {
        opacity: opacity * sparkOpacity.value,
        transform: [
          { translateX: Math.cos(angle) * radius },
          { translateY: Math.sin(angle) * radius },
          { scale: scale }
        ]
      };
    });

    return <Animated.View style={[styles.sparkle, style]} />;
  };

  return (
    <View style={[styles.container, { pointerEvents: 'none' }]}> 
      <View style={styles.background}>
        
        {/* Layer 0: Percikan Api (Di belakang burung) */}
        <View style={styles.absoluteCenter}>
          {PARTICLES.map((i) => (
            <Sparkle key={i} index={i} />
          ))}
        </View>

        {/* Layer 1: Burung */}
        <Animated.Image 
          source={require('../../assets/images/logo.png')} 
          style={[styles.birdBase, birdStyle]} 
          resizeMode="contain"
        />

        {/* Layer 2: Jejak Bayangan */}
        <Animated.Image 
          source={require('../../assets/images/logo-scwa.png')} 
          style={[styles.logoBase, styles.absoluteCenter, ghost2Style]} 
          resizeMode="contain"
        />
        <Animated.Image 
          source={require('../../assets/images/logo-scwa.png')} 
          style={[styles.logoBase, styles.absoluteCenter, ghost1Style]} 
          resizeMode="contain"
        />

        {/* Layer 3: Logo Utama */}
        <Animated.Image 
          source={require('../../assets/images/logo-scwa.png')} 
          style={[styles.logoBase, styles.absoluteCenter, logoStyle]} 
          resizeMode="contain"
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  background: {
    flex: 1,
    backgroundColor: '#CDE4F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  absoluteCenter: {
    position: 'absolute', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  birdBase: {
    width: 120,  
    height: 120,
  },
  logoBase: {
    width: 200, 
    height: 200, 
  },
  // Style untuk butiran api
  sparkle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff0000ff', // Warna Emas/Kuning Api
    shadowColor: "#e7aa25ff",     // Bayangan Oranye
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  }
});