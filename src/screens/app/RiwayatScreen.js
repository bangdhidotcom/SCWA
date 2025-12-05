import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAlert } from '../../services/AlertContext';
import { deviceService } from '../../services/deviceService';
import { useTheme } from '../../services/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function RiwayatScreen() {
  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [reversedData, setReversedData] = useState([]);
  
  const [activeMetric, setActiveMetric] = useState('suhu'); 
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: 0, index: 0 });

  const loadData = async () => {
    setIsLoading(true);
    setTooltip({ visible: false, x: 0, y: 0, value: 0, index: 0 }); 
    try {
      const data = await deviceService.getHistory('SCWA_001');
      if (data && data.length > 0) {
        setHistoryData(data);
        setReversedData([...data].reverse());
      }
    } catch (error) {
      showAlert("Gagal", "Gagal memuat data riwayat.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getChartColor = (opacity = 1) => {
    if (activeMetric === 'suhu') return `rgba(231, 76, 60, ${opacity})`;
    return `rgba(52, 152, 219, ${opacity})`;
  };

  const getChartData = () => {
    if (!reversedData.length) return null;

    const dataPoints = reversedData.map(item => item[activeMetric]);
    const labels = reversedData.map((item, index) => {
      if (index === 0 || index === Math.floor(reversedData.length / 2) || index === reversedData.length - 1) {
        return format(new Date(item.created_at), 'HH:mm');
      }
      return '';
    });

    return {
      labels,
      datasets: [{ data: dataPoints, color: getChartColor, strokeWidth: 3 }],
    };
  };

  const chartData = getChartData();

  const handleDataPointClick = (data) => {
    const { x, y, value, index } = data;
    setTooltip({
      visible: true,
      x,
      y,
      value,
      index
    });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadData} tintColor={colors.primary} />}
    >
      <Text style={[styles.pageTitle, { color: colors.text }]}>Analisis Riwayat</Text>

      <View style={[styles.chartCard, { backgroundColor: colors.card }]}>
        
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              activeMetric === 'suhu' && { backgroundColor: 'rgba(231, 76, 60, 0.15)', borderColor: '#e74c3c' }
            ]}
            onPress={() => { setActiveMetric('suhu'); setTooltip({ ...tooltip, visible: false }); }}
          >
            <Icon name="thermometer" size={18} color={activeMetric === 'suhu' ? '#e74c3c' : colors.subText} />
            <Text style={[styles.toggleText, { color: activeMetric === 'suhu' ? '#e74c3c' : colors.subText }]}>Suhu</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.toggleButton, 
              activeMetric === 'kelembapan' && { backgroundColor: 'rgba(52, 152, 219, 0.15)', borderColor: '#3498db' }
            ]}
            onPress={() => { setActiveMetric('kelembapan'); setTooltip({ ...tooltip, visible: false }); }}
          >
            <Icon name="water-percent" size={18} color={activeMetric === 'kelembapan' ? '#3498db' : colors.subText} />
            <Text style={[styles.toggleText, { color: activeMetric === 'kelembapan' ? '#3498db' : colors.subText }]}>Kelembapan</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : chartData ? (
          <View>
            <LineChart
              data={chartData}
              width={screenWidth - 40}
              height={280}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 1,
                color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => colors.subText,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", strokeWidth: "2", stroke: colors.card },
                propsForBackgroundLines: { strokeDasharray: "", stroke: isDark ? '#334155' : '#f0f0f0' }
              }}
              bezier
              withDots={true}
              withInnerLines={true}
              withOuterLines={false}
              withVerticalLines={false}
              fromZero={false}
              onDataPointClick={handleDataPointClick}
              style={{ marginVertical: 8, borderRadius: 16, paddingRight: 20 }}
            />

            {tooltip.visible && (
              <View style={[
                styles.tooltip, 
                { 
                  left: tooltip.x - 35, 
                  top: tooltip.y - 45,
                  backgroundColor: isDark ? '#334155' : '#fff',
                  borderColor: activeMetric === 'suhu' ? '#e74c3c' : '#3498db'
                }
              ]}>
                <Text style={[styles.tooltipValue, { color: colors.text }]}>
                  {tooltip.value}{activeMetric === 'suhu' ? '°C' : '%'}
                </Text>
                <Text style={[styles.tooltipTime, { color: colors.subText }]}>
                  {format(new Date(reversedData[tooltip.index].created_at), 'HH:mm')}
                </Text>
                <View style={[
                  styles.tooltipArrow, 
                  { 
                    borderTopColor: activeMetric === 'suhu' ? '#e74c3c' : '#3498db' 
                  }
                ]} />
              </View>
            )}
          </View>
        ) : (
          <Text style={{ textAlign: 'center', color: colors.subText, marginVertical: 20 }}>Tidak ada data.</Text>
        )}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Log Data Terkini</Text>
      <View style={styles.logList}>
        {historyData.map((item, index) => (
          <View key={index} style={[styles.logItem, { backgroundColor: colors.card }]}>
            <View style={styles.logTimeBox}>
              <Text style={[styles.logTime, { color: colors.text }]}>{format(new Date(item.created_at), 'HH:mm')}</Text>
              <Text style={[styles.logDate, { color: colors.subText }]}>{format(new Date(item.created_at), 'dd/MM')}</Text>
            </View>
            <View style={[styles.logDivider, { backgroundColor: colors.border }]} />
            <View style={styles.logDetail}>
              <View style={styles.logMetric}>
                <Icon name="thermometer" size={16} color="#e74c3c" />
                <Text style={[styles.logValue, { color: colors.text }]}>{item.suhu.toFixed(1)}°C</Text>
              </View>
              <View style={styles.logMetric}>
                <Icon name="water-percent" size={16} color="#3498db" />
                <Text style={[styles.logValue, { color: colors.text }]}>{item.kelembapan.toFixed(0)}%</Text>
              </View>
            </View>
            <View style={[styles.logStatus, { backgroundColor: item.status_ldr === 'GELAP' ? (isDark ? '#064e3b' : '#e8f8f5') : (isDark ? '#450a0a' : '#fdedec') }]}>
              <Text style={{ fontSize: 10, fontWeight: 'bold', color: item.status_ldr === 'GELAP' ? '#2ecc71' : '#e74c3c' }}>
                {item.status_ldr}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  pageTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, marginTop: 30 },
  
  chartCard: { borderRadius: 24, padding: 10, marginBottom: 25, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 5 },
  
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 15, gap: 15 },
  toggleButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  toggleText: { marginLeft: 6, fontWeight: '600', fontSize: 14 },

  loadingContainer: { height: 250, justifyContent: 'center', alignItems: 'center' },

  tooltip: { position: 'absolute', padding: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center', zIndex: 10, minWidth: 70, shadowColor: "#000", shadowOpacity: 0.1, elevation: 5 },
  tooltipValue: { fontWeight: 'bold', fontSize: 14 },
  tooltipTime: { fontSize: 10, marginTop: 2 },
  tooltipArrow: { position: 'absolute', bottom: -5, left: '45%', width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 5, borderLeftColor: 'transparent', borderRightColor: 'transparent' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  logList: { paddingBottom: 40 },
  logItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 10, elevation: 1, shadowColor: "#000", shadowOpacity: 0.05 },
  logTimeBox: { width: 50, alignItems: 'center' },
  logTime: { fontSize: 16, fontWeight: 'bold' },
  logDate: { fontSize: 10 },
  logDivider: { width: 1, height: '80%', marginHorizontal: 15 },
  logDetail: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  logMetric: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  logValue: { fontSize: 15, fontWeight: '600' },
  logStatus: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
});