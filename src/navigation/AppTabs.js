import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // <-- Import Ikon

// Panggil semua 3 layar kita
import DasborScreen from '../screens/app/DasborScreen';
import KontrolScreen from '../screens/app/KontrolScreen';
import RiwayatScreen from '../screens/app/RiwayatScreen';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      // screenOptions untuk mengatur semua tab
      screenOptions={({ route }) => ({
        // Fungsi ini akan memilih ikon berdasarkan nama 'route'
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dasbor') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Kontrol') {
            iconName = focused ? 'game-controller' : 'game-controller-outline';
          } else if (route.name === 'Riwayat') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          }

          // Kembalikan komponen Ikon
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue', // Warna ikon saat aktif
        tabBarInactiveTintColor: 'gray', // Warna ikon saat tidak aktif
      })}
    >
      {/* Ini adalah 3 Tab kita */}
      <Tab.Screen 
        name="Dasbor" 
        component={DasborScreen} 
      />
      <Tab.Screen 
        name="Kontrol" 
        component={KontrolScreen} 
      />
      <Tab.Screen 
        name="Riwayat" 
        component={RiwayatScreen} 
      />
    </Tab.Navigator>
  );
}