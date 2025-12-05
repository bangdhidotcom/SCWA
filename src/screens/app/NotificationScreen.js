import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../services/ThemeContext';

export default function NotificationScreen({ navigation }) {
  const { colors } = useTheme();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setNotifs(data || []);
        
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
      }
      setLoading(false);
    };
    fetchNotifs();
  }, []);

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconBox, { backgroundColor: item.title.includes('PERINGATAN') ? '#fdedec' : '#e8f8f5' }]}>
        <Icon 
          name={item.title.includes('PERINGATAN') ? "warning" : "information-circle"} 
          size={24} 
          color={item.title.includes('PERINGATAN') ? "#e74c3c" : "#2ecc71"} 
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.body, { color: colors.subText }]}>{item.body}</Text>
        <Text style={[styles.time, { color: colors.subText }]}>
          {format(new Date(item.created_at), 'dd MMM yyyy, HH:mm')}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.header, { color: colors.text }]}>Riwayat Notifikasi</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', color: colors.subText, marginTop: 20 }}>Belum ada notifikasi.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 20 },
  backBtn: { marginRight: 15, padding: 5 },
  header: { fontSize: 24, fontWeight: 'bold' },
  card: { flexDirection: 'row', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  body: { fontSize: 14, marginBottom: 8 },
  time: { fontSize: 12, fontStyle: 'italic' },
});