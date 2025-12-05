import { supabase } from './supabase';

export const deviceService = {
  // 1. Ambil Alat milik User yang sedang Login
  getUserDevice: async (userId) => {
    // Asumsi: 1 User hanya punya 1 Alat (sesuai MVP)
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('owner_id', userId)
      .single();

    if (error) {
      console.error("Gagal mengambil data device:", error);
      return null;
    }
    return data;
  },

  // 2. Simpan/Update Token Notifikasi ke Database
  updatePushToken: async (deviceId, token) => {
    const { error } = await supabase
      .from('devices')
      .update({ push_token: token })
      .eq('device_id', deviceId);

    if (error) console.error("Gagal update token:", error);
  },

  // 3. Mendengarkan Data Sensor (Sekarang butuh parameter deviceId wajib)
  listenToDevice: (deviceId, callback) => {
    if (!deviceId) return;

    // Ambil data awal (Snapshot terakhir)
    supabase
      .from('devices')
      .select('*, sensor_logs(*)')
      .eq('device_id', deviceId)
      .limit(1, { foreignTable: 'sensor_logs' })
      .order('created_at', { foreignTable: 'sensor_logs', ascending: false })
      .single()
      .then(({ data, error }) => {
        if (data && data.sensor_logs && data.sensor_logs.length > 0) {
          const combinedData = {
            ...data,
            ...data.sensor_logs[0]
          };
          callback(combinedData);
        }
      });

    // Subscribe ke Realtime (Websocket)
    const channel = supabase
      .channel(`public:sensor_logs:${deviceId}`) // Channel unik per alat
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_logs',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },

  // 4. Update Kontrol (Kipas/Audio)
  updateControl: async (deviceId, settings) => {
    if (!deviceId) throw new Error("Device ID tidak ditemukan.");
    
    const { error } = await supabase
      .from('devices')
      .update(settings)
      .eq('device_id', deviceId);
    
    if (error) throw error;
  },

  // 5. Ambil Riwayat Data
  getHistory: async (deviceId) => {
    if (!deviceId) return [];

    const { data, error } = await supabase
      .from('sensor_logs')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }
};