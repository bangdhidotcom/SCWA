import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // 1. Load tema saat aplikasi dibuka
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('appTheme');
        if (storedTheme === 'dark') setIsDark(true);
      } catch (e) {
        console.error("Gagal memuat tema:", e);
      }
    };
    loadTheme();
  }, []);

  // 2. Fungsi ganti tema + simpan
  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    try {
      await AsyncStorage.setItem('appTheme', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error("Gagal menyimpan tema:", e);
    }
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      background: '#0f172a',
      card: '#1e293b',
      text: '#f1f5f9',
      subText: '#94a3b8',
      primary: '#38bdf8',
      iconBg: '#334155',
      border: '#334155',
      headerText: '#fff'
    } : {
      background: '#f8f9fa',
      card: '#ffffff',
      text: '#2c3e50',
      subText: '#7f8c8d',
      primary: '#004e92',
      iconBg: '#fef5e7',
      border: '#e1e1e1',
      headerText: '#fff'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);