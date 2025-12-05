import 'react-native-gesture-handler';
import RootNavigator from './src/navigation';
import { AlertProvider } from './src/services/AlertContext'; // Import AlertProvider
import { ThemeProvider } from './src/services/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AlertProvider> 
        <RootNavigator />
      </AlertProvider>
    </ThemeProvider>
  );
}