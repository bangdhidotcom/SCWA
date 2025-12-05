import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import DasborScreen from '../screens/app/DasborScreen';
import KontrolScreen from '../screens/app/KontrolScreen';
import RiwayatScreen from '../screens/app/RiwayatScreen';

import { useTheme } from '../services/ThemeContext';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { colors, isDark } = useTheme(); // Ambil warna

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          height: 65,
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 20,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dasbor') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Kontrol') iconName = focused ? 'game-controller' : 'game-controller-outline';
          else if (route.name === 'Riwayat') iconName = focused ? 'stats-chart' : 'stats-chart-outline';

          return (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Icon name={iconName} size={24} color={focused ? '#fff' : (isDark ? '#64748b' : '#bdc3c7')} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dasbor" component={DasborScreen} />
      <Tab.Screen name="Kontrol" component={KontrolScreen} />
      <Tab.Screen name="Riwayat" component={RiwayatScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIcon: {
    backgroundColor: '#004e92', // Warna biru tema utama
    shadowColor: '#004e92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});