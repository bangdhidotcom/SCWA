import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import DasborScreen from '../screens/app/DasborScreen';
import KontrolScreen from '../screens/app/KontrolScreen';
import NotificationScreen from '../screens/app/NotificationScreen';
import RiwayatScreen from '../screens/app/RiwayatScreen';
import SettingsScreen from '../screens/app/SettingsScreen';

import { useTheme } from '../services/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { colors, isDark } = useTheme();

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
        tabBarIcon: ({ focused }) => {
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

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ animation: 'slide_from_right', headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
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
    backgroundColor: '#004e92',
    shadowColor: '#004e92',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  }
});