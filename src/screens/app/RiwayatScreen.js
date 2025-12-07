import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAlert } from '../../services/AlertContext';
import { deviceService } from '../../services/deviceService';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../services/ThemeContext';

const screenWidth = Dimensions.get('window').width;
const FIXED_Y_AXIS_WIDTH = 40;
const CHART_HEIGHT = 280;
const SEGMENTS = 4;

export default function RiwayatScreen() {
  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [reversedData, setReversedData] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  
  const [activeMetric, setActiveMetric] = useState('suhu'); 
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, value: 0, index: 0, position: 'top' });

  const scrollViewRef = useRef();

  useEffect(() => {
    let subscription;

    const init = async () => {
      try {
        let currentId = deviceId;
        if (!currentId) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const device = await deviceService.getUserDevice(user.id);
            if (device) {
              currentId = device.device_id;
              setDeviceId(currentId);
            }
          }
        }

        if (currentId) {
          const data = await deviceService.getHistory(currentId);
          if (data) {
            setHistoryData(data);
            setReversedData([...data].reverse());
          }

          subscription = supabase
            .channel(`public:sensor_logs:history:${currentId}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'sensor_logs',
                filter: `device_id=eq.${currentId}`,
              },
              (payload) => {
                const newData = payload.new;
                setHistoryData(prev => [newData, ...prev]);
                setReversedData(prev => [...prev, newData]);
                
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 500);
              }
            )
            .subscribe();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  const loadData = async () => {
    if (!deviceId) return;
    setIsLoading(true);
    try {
      const data = await deviceService.getHistory(deviceId);
      if (data) {
        setHistoryData(data);
        setReversedData([...data].reverse());
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNiceScale = (minValue, maxValue) => {
    if (minValue === Infinity || maxValue === -Infinity) return { min: 0, max: 100 };

    let min = Math.floor(minValue);
    let max = Math.ceil(maxValue);
    
    const padding = (max - min) * 0.1; 
    min -= padding;
    max += padding;

    const range = max - min;
    const step = Math.ceil(range / SEGMENTS);
    
    const niceMin = Math.floor(min);
    const niceMax = niceMin + (step * SEGMENTS);

    return { min: niceMin, max: niceMax };
  };

  const { min: yAxisMin, max: yAxisMax } = (() => {
    if (!reversedData.length) return { min: 0, max: 100 };
    const values = reversedData.map(d => parseFloat(d[activeMetric]));
    return calculateNiceScale(Math.min(...values), Math.max(...values));
  })();

  const getChartColor = (opacity = 1) => {
    if (activeMetric === 'suhu') return `rgba(231, 76, 60, ${opacity})`;
    return `rgba(52, 152, 219, ${opacity})`;
  };

  const getChartData = () => {
    if (!reversedData.length) return null;

    const dataPoints = reversedData.map(item => item[activeMetric]);

    const labels = reversedData.map((item, index) => {
      const isEverySixth = index % 6 === 0;
      if (isEverySixth) {
        return format(new Date(item.created_at), 'HH:mm');
      }
      return ''; 
    });

    return {
      labels,
      datasets: [{ data: dataPoints, color: getChartColor, strokeWidth: 2 }],
    };
  };

  const chartData = getChartData();

  const handleDataPointClick = (data) => {
    const { x, y, value, index } = data;
    const isTooHigh = y < 60;

    setTooltip({
      visible: true,
      x: x, 
      y: y,
      value,
      index,
      position: isTooHigh ? 'bottom' : 'top'
    });
  };

  const commonChartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => colors.subText,
    style: { borderRadius: 16 },
    propsForDots: { r: "4", strokeWidth: "1", stroke: colors.card },
    propsForBackgroundLines: { strokeDasharray: "5", stroke: isDark ? '#334155' : '#e0e0e0', strokeOpacity: 0.5 },
    fillShadowGradientFrom: activeMetric === 'suhu' ? '#e74c3c' : '#3498db',
    fillShadowGradientTo: activeMetric === 'suhu' ? '#e74c3c' : '#3498db',
    fillShadowGradientOpacity: 0.2,
    propsForLabels: {
       alignmentBaseline: 'middle', 
       fontSize: 10,
       dy: 0 
    }
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
        ) : (!deviceId || reversedData.length === 0) ? (
          <Text style={{ textAlign: 'center', color: colors.subText, marginVertical: 20 }}>
            {!deviceId ? 'Mencari data alat...' : 'Belum ada data riwayat.'}
          </Text>
        ) : chartData ? (
          <View style={{ height: CHART_HEIGHT, flexDirection: 'row' }}>
            
            <View style={{ width: FIXED_Y_AXIS_WIDTH, overflow: 'hidden', zIndex: 10, backgroundColor: colors.card }}>
               <LineChart
                data={{
                  labels: [], 
                  datasets: [{ data: [yAxisMin, yAxisMax] }] 
                }}
                width={screenWidth} 
                height={CHART_HEIGHT}
                yAxisInterval={1}
                fromZero={false}
                min={yAxisMin}
                max={yAxisMax}
                segments={SEGMENTS}
                chartConfig={{
                  ...commonChartConfig,
                  color: () => 'transparent', 
                  labelColor: () => colors.subText, 
                }}
                withVerticalLines={false}
                withHorizontalLines={true}
                withDots={false}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={false}
                style={{ paddingRight: 40, paddingLeft: 0 }}
              />
            </View>

            <ScrollView 
              horizontal 
              ref={scrollViewRef}
              showsHorizontalScrollIndicator={false}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              style={{ marginLeft: -1 }}
            >
              <View style={{ paddingRight: 40, paddingLeft: 0 }}> 
                <LineChart
                  data={chartData}
                  width={Math.max(screenWidth - FIXED_Y_AXIS_WIDTH, reversedData.length * 50)}
                  height={CHART_HEIGHT}
                  yAxisInterval={1}
                  fromZero={false}
                  min={yAxisMin}
                  max={yAxisMax}
                  segments={SEGMENTS}
                  chartConfig={{
                    ...commonChartConfig,
                  }}
                  formatYLabel={() => ''}
                  bezier
                  withDots={true}
                  withInnerLines={true}
                  withOuterLines={false}
                  withVerticalLines={false}
                  withHorizontalLabels={false} 
                  onDataPointClick={handleDataPointClick}
                  style={{
                    borderRadius: 16,
                    paddingRight: 0,
                  }}
                />

                {tooltip.visible && (
                  <View style={[
                    styles.tooltip, 
                    { 
                      left: tooltip.x - 30, 
                      top: tooltip.position === 'top' ? tooltip.y - 50 : tooltip.y + 10, 
                      backgroundColor: isDark ? '#334155' : '#fff',
                      borderColor: activeMetric === 'suhu' ? '#e74c3c' : '#3498db'
                    }
                  ]}>
                    <Text style={[styles.tooltipValue, { color: colors.text }]}>
                      {Number(tooltip.value).toFixed(1)}{activeMetric === 'suhu' ? '°C' : '%'}
                    </Text>
                    <Text style={[styles.tooltipTime, { color: colors.subText }]}>
                      {reversedData[tooltip.index] ? format(new Date(reversedData[tooltip.index].created_at), 'HH:mm') : ''}
                    </Text>
                    
                    <View style={{
                      position: 'absolute',
                      [tooltip.position === 'top' ? 'bottom' : 'top']: -6,
                      borderLeftWidth: 6, borderRightWidth: 6,
                      borderLeftColor: 'transparent', borderRightColor: 'transparent',
                      [tooltip.position === 'top' ? 'borderTopWidth' : 'borderBottomWidth']: 6,
                      [tooltip.position === 'top' ? 'borderTopColor' : 'borderBottomColor']: activeMetric === 'suhu' ? '#e74c3c' : '#3498db',
                    }}/>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        ) : null}
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
                <Text style={[styles.logValue, { color: colors.text }]}>{Number(item.suhu).toFixed(1)}°C</Text>
              </View>
              <View style={styles.logMetric}>
                <Icon name="water-percent" size={16} color="#3498db" />
                <Text style={[styles.logValue, { color: colors.text }]}>{Number(item.kelembapan).toFixed(0)}%</Text>
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
  
  chartCard: { 
    borderRadius: 24, 
    paddingVertical: 15, 
    paddingHorizontal: 0,
    marginBottom: 25, 
    elevation: 4, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 5,
    overflow: 'hidden' 
  },
  
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15, gap: 15 },
  toggleButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: 'transparent' },
  toggleText: { marginLeft: 6, fontWeight: '600', fontSize: 14 },

  loadingContainer: { height: CHART_HEIGHT, justifyContent: 'center', alignItems: 'center' },

  tooltip: { 
    position: 'absolute', 
    padding: 8, 
    borderRadius: 8, 
    borderWidth: 1, 
    alignItems: 'center', 
    zIndex: 100, 
    minWidth: 60, 
    shadowColor: "#000", 
    shadowOpacity: 0.1, 
    elevation: 6 
  },
  tooltipValue: { fontWeight: 'bold', fontSize: 14 },
  tooltipTime: { fontSize: 10, marginTop: 2 },

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