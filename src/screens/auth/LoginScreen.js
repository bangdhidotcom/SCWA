import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { authService } from '../../services/authService';

export default function LoginScreen() {
  const [isRegistering, setIsRegistering] = useState(false); // Mode Login/Daftar
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Nama Lengkap
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan Password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        // --- LOGIKA DAFTAR ---
        if (!fullName) {
          Alert.alert("Error", "Nama Lengkap wajib diisi untuk pendaftaran.");
          setLoading(false);
          return;
        }
        
        await authService.signUp(email, password, fullName);
        Alert.alert(
          "Sukses", 
          "Akun berhasil dibuat! Silakan cek email jika diminta verifikasi, atau langsung login."
        );
        setIsRegistering(false); // Kembali ke mode login
      } else {
        // --- LOGIKA LOGIN ---
        await authService.login(email, password);
        // Jika sukses, App.js akan otomatis ganti layar karena kita pakai listener
      }
    } catch (error) {
      Alert.alert("Gagal", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SCWA App</Text>
      <Text style={styles.subtitle}>
        {isRegistering ? "Buat Akun Baru" : "Silakan Masuk"}
      </Text>

      {/* Input Nama (Cuma muncul pas Daftar) */}
      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          value={fullName}
          onChangeText={setFullName}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 20 }} />
      ) : (
        <View style={styles.buttonContainer}>
          <Button 
            title={isRegistering ? "Daftar Sekarang" : "Masuk"} 
            onPress={handleSubmit} 
          />
        </View>
      )}

      <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
        <Text style={styles.switchText}>
          {isRegistering 
            ? "Sudah punya akun? Login di sini" 
            : "Belum punya akun? Daftar di sini"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  switchText: {
    textAlign: 'center',
    color: '#007AFF',
    marginTop: 20,
    fontSize: 16,
  },
});