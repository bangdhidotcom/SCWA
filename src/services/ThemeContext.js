import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false); // Default Terang

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? {
      // PALET MODE GELAP (Dark Navy & Slate)
      background: '#0f172a',    // Background utama gelap banget
      card: '#1e293b',          // Background kartu agak terang
      text: '#f1f5f9',          // Teks utama putih
      subText: '#94a3b8',       // Teks deskripsi abu-abu
      primary: '#38bdf8',       // Biru muda neon
      iconBg: '#334155',        // Background ikon bulat
      border: '#334155',        // Garis batas
      headerText: '#fff'
    } : {
      // PALET MODE TERANG (Clean White & Blue)
      background: '#f8f9fa',
      card: '#ffffff',
      text: '#2c3e50',
      subText: '#7f8c8d',
      primary: '#004e92',
      iconBg: '#fef5e7',        // Background ikon (variatif nanti di screen)
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