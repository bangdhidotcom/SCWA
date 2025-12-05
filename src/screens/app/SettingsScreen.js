import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAlert } from '../../services/AlertContext';
import { authService } from '../../services/authService';
import { deviceService } from '../../services/deviceService';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../services/ThemeContext';

export default function SettingsScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { showAlert } = useAlert();
  
  const [profile, setProfile] = useState({ id: '', full_name: '', avatar_url: null });
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) setProfile(profileData);

        const deviceData = await deviceService.getUserDevice(user.id);
        setDeviceInfo(deviceData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profile.full_name })
        .eq('id', profile.id);

      if (error) throw error;
      showAlert("Sukses", "Profil berhasil diperbarui!", "success");
    } catch (error) {
      showAlert("Gagal", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // PERBAIKAN: Fungsi Logout dengan Konfirmasi
  const handleLogout = () => {
    showAlert(
      "Konfirmasi",
      "Apakah Anda yakin ingin keluar dari aplikasi?",
      "confirm",
      () => authService.logout() // Aksi jika tombol 'Ya' ditekan
    );
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      uploadAvatar(result.assets[0]);
    }
  };

  const uploadAvatar = async (image) => {
    setUploading(true);
    try {
      const fileName = `${profile.id}_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(image.base64), {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', profile.id);

      setProfile({ ...profile, avatar_url: urlData.publicUrl });
      showAlert("Sukses", "Foto profil diperbarui!", "success");

    } catch (error) {
      showAlert("Gagal", "Gagal upload foto: " + error.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const decode = (base64) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Pengaturan</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                <Icon name="person" size={40} color={colors.subText} />
              </View>
            )}
            <View style={styles.editIcon}>
              <Icon name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          {uploading && <ActivityIndicator size="small" color={colors.primary} style={{marginTop: 5}}/>}
        </View>

        <Text style={[styles.label, { color: colors.subText }]}>Nama Lengkap</Text>
        <View style={[styles.inputBox, { borderColor: colors.border, backgroundColor: isDark ? '#334155' : '#f8f9fa' }]}>
          <TextInput 
            value={profile.full_name}
            onChangeText={(text) => setProfile({...profile, full_name: text})}
            style={[styles.input, { color: colors.text }]}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: colors.primary }]} 
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Simpan Perubahan</Text>}
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informasi Alat</Text>
        <View style={styles.row}>
          <Text style={{ color: colors.subText }}>ID Perangkat</Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{deviceInfo?.device_id || 'Belum terhubung'}</Text>
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={{ color: colors.subText }}>Nama Perangkat</Text>
          <Text style={{ color: colors.text, fontWeight: 'bold' }}>{deviceInfo?.name || '-'}</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferensi</Text>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={{ color: colors.text }}>Tema Gelap</Text>
          <Switch 
            value={isDark} 
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={isDark ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      {/* Gunakan handleLogout, bukan langsung authService.logout() */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Icon name="log-out-outline" size={20} color="#e74c3c" />
        <Text style={styles.logoutText}>Keluar Aplikasi</Text>
      </TouchableOpacity>

      <View style={{height: 50}}/>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 20 },
  backBtn: { marginRight: 15, padding: 5 },
  header: { fontSize: 24, fontWeight: 'bold' },
  section: { borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: "#000", elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  editIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#004e92', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  
  label: { fontSize: 12, marginBottom: 5, marginLeft: 2 },
  inputBox: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 8, marginBottom: 15 },
  input: { fontSize: 16 },
  saveBtn: { padding: 12, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },

  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, padding: 15 },
  logoutText: { color: '#e74c3c', fontWeight: 'bold', marginLeft: 8 }
});