import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { YaMap } from 'react-native-yamap';
import AppNavigator from '@/navigation/AppNavigator';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    try {
      YaMap.init('78a23c04-04a5-430b-b014-fe1bf56fcb80');
    } catch (error) {
      console.error('Ошибка инициализации YaMap:', error);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
