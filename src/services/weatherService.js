import * as Location from 'expo-location';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const weatherService = {
  getWeather: async () => {
    try {
      // 1. Minta Izin Lokasi
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Izin lokasi ditolak');
      }

      // 2. Ambil Koordinat GPS
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // 3. Panggil API OpenWeatherMap (Bahasa Indonesia & Celcius)
      const response = await fetch(
        `${BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=id`
      );

      const data = await response.json();

      if (response.ok) {
        return {
          temp: Math.round(data.main.temp),
          city: data.name, // Nama kota (misal: Kepanjen)
          desc: data.weather[0].description, // Hujan ringan, cerah, dll
          icon: data.weather[0].icon // Kode ikon (01d, 10n, dsb)
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Weather Error:", error);
      return null; // Kembalikan null jika gagal biar UI tidak crash
    }
  }
};