import { supabase } from './supabase';

// ID Alat (Nanti bisa dibuat dinamis, sekarang hardcode dulu sesuai DB)
const DEFAULT_DEVICE_ID = 'SCWA_001'; 

export const deviceService = {
  // Mendengarkan Data Sensor Real-time (Pengganti listenToRbwData)
  listenToDevice: (deviceId = DEFAULT_DEVICE_ID, callback) => {
    // 1. Ambil data awal dulu
    supabase
      .from('devices')
      .select('*, sensor_logs(*)') // Ambil device + log terakhir
      .eq('device_id', deviceId)
      .limit(1, { foreignTable: 'sensor_logs' })
      .order('created_at', { foreignTable: 'sensor_logs', ascending: false })
      .single()
      .then(({ data, error }) => {
        if (data && data.sensor_logs && data.sensor_logs.length > 0) {
          // Gabungkan data device info & sensor log terakhir
          const combinedData = {
            ...data,
            ...data.sensor_logs[0] // Ambil log sensor terbaru
          };
          callback(combinedData);
        }
      });

    // 2. Subscribe ke perubahan Realtime (Websocket)
    const channel = supabase
      .channel('public:sensor_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sensor_logs',
          filter: `device_id=eq.${deviceId}`,
        },
        (payload) => {
          // Ada data sensor baru masuk!
          callback(payload.new);
        }
      )
      .subscribe();

    // Fungsi cleanup untuk stop listening
    return () => supabase.removeChannel(channel);
  },

  // Update Kontrol Kipas/Audio (Pengganti updatePerintah)
  updateControl: async (deviceId = DEFAULT_DEVICE_ID, settings) => {
    // settings contoh: { min_temp_limit: 28, max_temp_limit: 31 }
    // atau kolom lain yang kamu set di tabel devices
    const { error } = await supabase
      .from('devices')
      .update(settings)
      .eq('device_id', deviceId);
    
    if (error) throw error;
  },

  // Ambil Riwayat
  getHistory: async (deviceId = DEFAULT_DEVICE_ID) => {
    const { data, error } = await supabase
      .from('sensor_logs')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(50); // Ambil 50 data terakhir

    if (error) throw error;
    return data;
  }
};