import * as expoDevice from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const registerForPushNotificationsAsync = async () => {
  let token;
  
  if (expoDevice.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return;
    }
    
    try {
      const { data: pushToken } = await Notifications.getExpoPushTokenAsync({
        projectId: '2e1ad895-d2ff-4add-bdb6-3f29708a7fcb'
      });
      token = pushToken;
    } catch (e) {
      console.error(e);
    }

  } else {
    alert('Harus menggunakan HP fisik untuk Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};

export const notificationService = {
  registerForPushNotificationsAsync,
};