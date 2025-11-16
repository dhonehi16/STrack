import { Platform } from 'react-native';
import { getToken, clearAuthData } from './storage';
import { navigateToLogin } from '@/navigation/navigationRef';

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://62.183.96.93:8000';
    } else {
      return 'http://62.183.96.93:8000';
    }
  }
  return 'http://62.183.96.93:8000';
};

export const getWebSocketBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'ws://62.183.96.93:8000/ws';
    } else {
      return 'ws://62.183.96.93:8000/ws';
    }
  }
  return 'ws://62.183.96.93:8000/ws';
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Обрабатывает 401 ошибку - очищает токен и перенаправляет на логин
 */
const handleUnauthorized = async () => {
  try {
    await clearAuthData();
    navigateToLogin();
  } catch (error) {
    console.error('Ошибка при обработке 401:', error);
    navigateToLogin();
  }
};

export const appFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  
  return fetch(`${getBaseUrl()}${url}`, {
    ...options,
    headers: {
      ...options.headers,
    },
  });
};

export const authorizedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${getBaseUrl()}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  // Обработка 401 ошибки - неавторизован
  if (response.status === 401) {
    await handleUnauthorized();
    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
  }
  
  return response;
};

