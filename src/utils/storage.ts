/**
 * Утилита для работы с локальным хранилищем
 * Используется для сохранения токена аутентификации
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

/**
 * Сохраняет токен доступа
 */
export const saveToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Ошибка при сохранении токена:', error);
    throw error;
  }
};

/**
 * Получает сохраненный токен доступа
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Ошибка при получении токена:', error);
    return null;
  }
};

/**
 * Удаляет токен доступа
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Ошибка при удалении токена:', error);
    throw error;
  }
};

/**
 * Сохраняет данные пользователя
 */
export const saveUser = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Ошибка при сохранении пользователя:', error);
    throw error;
  }
};

/**
 * Получает сохраненные данные пользователя
 */
export const getUser = async (): Promise<any | null> => {
  try {
    const userString = await AsyncStorage.getItem(USER_KEY);
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }
};

/**
 * Удаляет данные пользователя
 */
export const removeUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    throw error;
  }
};

/**
 * Очищает все данные аутентификации
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await Promise.all([removeToken(), removeUser()]);
  } catch (error) {
    console.error('Ошибка при очистке данных аутентификации:', error);
    throw error;
  }
};

