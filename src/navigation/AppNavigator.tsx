/**
 * App Navigator
 * Навигационная структура приложения
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import LoginScreen from '@/components/LoginScreen';
import ContactsScreen from '@/components/ContactsScreen';
import SearchContactsScreen from '@/components/SearchContactsScreen';
import MapScreen from '@/components/MapScreen';
import { getToken, getUser } from '@/utils/storage';
import { navigationRef } from './navigationRef';
import type { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await getToken();
      const user = await getUser();
      setIsAuthenticated(!!(token && user));
    } catch {
      setIsAuthenticated(false);
    }
  };

  // Показываем загрузку, пока проверяем статус аутентификации
  if (isAuthenticated === null) {
    return null; // Можно добавить SplashScreen
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDarkMode ? '#000' : '#fff',
          },
        }}
        initialRouteName={isAuthenticated ? 'Contacts' : 'Login'}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Contacts" component={ContactsScreen} />
        <Stack.Screen name="SearchContacts" component={SearchContactsScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;

