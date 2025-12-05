import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function MarqueeText({ text, style }) {
  const translateX = useSharedValue(SCREEN_WIDTH);
  
  useEffect(() => {
    // Reset animasi jika teks berubah
    cancelAnimation(translateX);
    translateX.value = SCREEN_WIDTH;

    // PERBAIKAN 1: Kecepatan diperlambat (Durasi diperbesar)
    // Rumus: (Panjang Huruf * 400ms) + Buffer 6 detik
    // Ini akan jauh lebih pelan dari sebelumnya (150ms)
    const duration = text.length * 400 + 6000; 

    translateX.value = withRepeat(
      withTiming(-SCREEN_WIDTH * 1.5, {
        duration: duration,
        easing: Easing.linear,
      }),
      -1, // Loop selamanya
      false // Tidak mundur (selalu dari kanan ke kiri)
    );
  }, [text]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.container}>
      {/* PERBAIKAN 2: width '500%' memaksa wadah teks sangat panjang 
          sehingga teks tidak akan kena potong (ellipsis) */}
      <Animated.Text 
        style={[style, animatedStyle, { width: '500%' }]} 
        numberOfLines={1}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%', 
  },
});