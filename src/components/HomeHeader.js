import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../services/ThemeContext';
import { supabase } from '../services/supabase';

export default function HomeHeader({ onSettingsPress, onNotificationPress }) {
  const { colors, isDark } = useTheme();
  const [userName, setUserName] = useState('Pemilik Walet');
  const [hasUnread, setHasUnread] = useState(false); // Untuk dot merah

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Ambil Nama dari tabel profiles
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data?.full_name) setUserName(data.full_name);

        // Cek Notifikasi Belum Dibaca
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        
        setHasUnread(count > 0);
      }
    };

    fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      {/* KIRI: Sapaan */}
      <View>
        <Text style={[styles.greeting, { color: '#fff' }]}>Halo,</Text>
        <Text style={[styles.name, { color: '#fff' }]}>{userName}!</Text>
      </View>

      {/* KANAN: Aksi */}
      <View style={styles.actionRow}>
        {/* Tombol Notifikasi */}
        <TouchableOpacity onPress={onNotificationPress} style={styles.iconBtn}>
          <Icon name="notifications-outline" size={26} color="#fff" />
          {hasUnread && <View style={styles.redDot} />}
        </TouchableOpacity>

        {/* Tombol Settings */}
        <TouchableOpacity onPress={onSettingsPress} style={styles.iconBtn}>
          <Icon name="settings-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // Untuk Status Bar
    paddingBottom: 20,
  },
  greeting: { fontSize: 16, opacity: 0.9 },
  name: { fontSize: 22, fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', gap: 15 },
  iconBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)', // Glassmorphism dikit
    borderRadius: 12,
  },
  redDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
    borderWidth: 1,
    borderColor: '#fff'
  }
});