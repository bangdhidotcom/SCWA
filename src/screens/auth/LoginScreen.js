import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

// 1. IMPORT "Mesin" authService kita
import { authService } from '../../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State baru untuk loading
  const [isLoading, setIsLoading] = useState(false); 

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan Password tidak boleh kosong.");
      return;
    }
    
    setIsLoading(true); // Mulai loading
    
    try {
      // 2. GANTI Alert dengan fungsi login sungguhan
      await authService.login(email, password);
      // Jika berhasil, 'onAuthStateChanged' di RootNavigator akan
      // otomatis mendeteksi dan memindahkan layar.
      // Kita tidak perlu 'navigation.navigate' di sini.
    } catch (error) {
      // 3. Tampilkan error dari Firebase jika login gagal
      Alert.alert("Login Gagal", error.message);
    } finally {
      setIsLoading(false); // Berhenti loading (baik sukses atau gagal)
    }
  };

  // Kita tambahkan tombol DAFTAR juga
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan Password tidak boleh kosong.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.signUp(email, password);
      Alert.alert("Sukses", "Akun berhasil dibuat! Silakan login.");
    } catch (error) {
      Alert.alert("Daftar Gagal", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SCWA Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading} // Input tidak bisa diketik saat loading
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />
      
      {/* Tampilkan loading indicator jika isLoading == true */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <View style={styles.buttonContainer}>
            <Button 
              title="Login" 
              onPress={handleLogin}
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button 
              title="Daftar Akun Baru" 
              onPress={handleSignUp}
              color="#841584" // Warna beda untuk daftar
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5' // Ganti background biar lebih segar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333'
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff' // Input field warna putih
  },
  // Tambahan style untuk spasi antar tombol
  buttonContainer: {
    width: '100%',
    marginVertical: 5, // Beri jarak vertikal antar tombol
  }
});