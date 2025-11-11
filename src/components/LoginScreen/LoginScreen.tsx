/**
 * LoginScreen Component
 * Форма входа с вводом никнейма
 *
 * @format
 */

import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { getLoginScreenStyles } from './LoginScreen.styles';
import api from '@/api';
import type { LoginScreenProps } from '@/types/navigation';

function LoginScreen({ navigation }: LoginScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      Alert.alert('Ошибка', 'Пожалуйста, введите ваш никнейм');
      return;
    }

    if (trimmedUsername.length < 2) {
      Alert.alert('Ошибка', 'Никнейм должен содержать минимум 2 символа');
      return;
    }

    if (!password) {
      Alert.alert('Ошибка', 'Пожалуйста, введите пароль');
      return;
    }

    try {
      await api.auth.login({
        username: trimmedUsername,
        password: password,
      });
      
      navigation.replace('Contacts');
    } catch {
      // Определяем сообщение об ошибке
      let message = 'Не удалось войти в систему';
      
      Alert.alert('Ошибка входа', message);
    }
  };

  const styles = getLoginScreenStyles(isDarkMode);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>STrack</Text>
        <Text style={styles.subtitle}>Введите ваш никнейм</Text>

        <TextInput
          style={styles.input}
          placeholder="Никнейм"
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <TouchableOpacity
          style={[styles.button, !username.trim() && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={!username.trim()}>
          <Text style={styles.buttonText}>Войти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default LoginScreen;

