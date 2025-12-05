import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import logoImg from '../../../assets/images/logo-scwa.png';
import { useAlert } from '../../services/AlertContext';
import { authService } from '../../services/authService';
import { useTheme } from '../../services/ThemeContext';

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [showPassword, setShowPassword] = useState(false); 
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      showAlert("Perhatian", "Email dan Password wajib diisi.", "error"); 
      return;
    }
    setLoading(true);
    try {
      if (isRegistering) {
        if (!fullName) {
          showAlert("Perhatian", "Nama Lengkap wajib diisi.", "error");
          setLoading(false);
          return;
        }
        await authService.signUp(email, password, fullName);
        
        showAlert("Sukses", "Akun berhasil dibuat! Silakan login.", "success", () => {
            setIsRegistering(false); 
        });
        
      } else {
        await authService.login(email, password);
      }
    } catch (error) {
      showAlert("Gagal", error.message, "error"); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <LinearGradient colors={isDark ? ['#0f2027', '#203a43'] : ['#004e92', '#2b5876']} style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.logoContainer}>
            <Image source={logoImg} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>SCWA APP</Text>
            <Text style={styles.tagline}>Smart Control Walet Automation</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {isRegistering ? "Buat Akun Baru" : "Selamat Datang"}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
              {isRegistering ? "Isi data diri Anda di bawah ini" : "Silakan masuk untuk melanjutkan"}
            </Text>

            {isRegistering && (
              <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: isDark ? '#334155' : '#f5f7fa' }]}>
                <Icon name="person-outline" size={20} color={colors.subText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Nama Lengkap"
                  value={fullName}
                  onChangeText={setFullName}
                  placeholderTextColor={colors.subText}
                />
              </View>
            )}

            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: isDark ? '#334155' : '#f5f7fa' }]}>
              <Icon name="mail-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor={colors.subText}
              />
            </View>

            <View style={[styles.inputContainer, { borderColor: colors.border, backgroundColor: isDark ? '#334155' : '#f5f7fa' }]}>
              <Icon name="lock-closed-outline" size={20} color={colors.subText} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={colors.subText}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 5 }}>
                <Icon 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color={colors.subText} 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.primaryButtonText}>{isRegistering ? "DAFTAR SEKARANG" : "MASUK"}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)} style={styles.switchButton}>
              <Text style={[styles.switchText, { color: colors.subText }]}>
                {isRegistering ? "Sudah punya akun? " : "Belum punya akun? "}
                <Text style={{ fontWeight: 'bold', color: colors.primary }}>
                  {isRegistering ? "Login" : "Daftar"}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30, marginTop: 40 },
  logo: { width: 120, height: 120, marginBottom: 10 },
  appName: { fontSize: 28, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  tagline: { fontSize: 14, color: '#e0e0e0', marginTop: 5 },
  card: { borderRadius: 20, padding: 25, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  headerSubtitle: { fontSize: 14, marginBottom: 25, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16 },
  primaryButton: { backgroundColor: '#004e92', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 10, elevation: 5 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { fontSize: 14 },
});