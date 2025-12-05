import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../services/ThemeContext';

const { width } = Dimensions.get('window');

export default function CustomAlert({ visible, title, message, type = 'success', onConfirm, onCancel, confirmText = 'OK', cancelText = 'Batal' }) {
  const { colors, isDark } = useTheme();
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animasi Muncul (Boing Effect)
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset animasi saat tutup
      scaleValue.setValue(0);
      opacityValue.setValue(0);
    }
  }, [visible]);

  // Konfigurasi Ikon & Warna berdasarkan Tipe
  let iconName = 'checkmark-circle';
  let iconColor = '#2ecc71'; // Hijau Sukses
  let gradientColors = ['#2ecc71', '#27ae60'];

  if (type === 'error') {
    iconName = 'alert-circle';
    iconColor = '#e74c3c'; // Merah Error
    gradientColors = ['#e74c3c', '#c0392b'];
  } else if (type === 'warning' || type === 'confirm') {
    iconName = 'help-circle';
    iconColor = '#f39c12'; // Kuning Warning
    gradientColors = ['#f39c12', '#d35400'];
  }

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        {/* Background Dimmer */}
        <Animated.View style={[styles.dimmer, { opacity: opacityValue }]} />

        {/* Kartu Alert */}
        <Animated.View style={[styles.alertBox, { backgroundColor: colors.card, transform: [{ scale: scaleValue }] }]}>
          
          <View style={styles.iconContainer}>
            <Icon name={iconName} size={60} color={iconColor} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.subText }]}>{message}</Text>

          <View style={styles.buttonContainer}>
            {/* Tombol Cancel (Hanya muncul jika tipe 'confirm') */}
            {type === 'confirm' && (
              <TouchableOpacity onPress={onCancel} style={[styles.btn, styles.btnCancel, { borderColor: colors.border }]}>
                <Text style={{ color: colors.subText, fontWeight: 'bold' }}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            {/* Tombol Confirm (Gradient) */}
            <TouchableOpacity onPress={onConfirm} style={[styles.btn, { flex: 1 }]}>
              <LinearGradient
                colors={gradientColors}
                style={styles.gradientBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              >
                <Text style={styles.btnText}>{confirmText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dimmer: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)' },
  alertBox: { width: width * 0.8, padding: 20, borderRadius: 20, alignItems: 'center', elevation: 10 },
  iconContainer: { marginBottom: 15 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  message: { fontSize: 14, textAlign: 'center', marginBottom: 25, lineHeight: 22 },
  buttonContainer: { flexDirection: 'row', width: '100%', gap: 10 },
  btn: { borderRadius: 12, height: 45, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { flex: 1, borderWidth: 1, backgroundColor: 'transparent' },
  gradientBtn: { width: '100%', height: '100%', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});