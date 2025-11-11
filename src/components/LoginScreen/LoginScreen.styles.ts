/**
 * LoginScreen Styles
 * Стили для компонента формы входа
 *
 * @format
 */

import { StyleSheet } from 'react-native';

export const getLoginScreenStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDarkMode ? '#ccc' : '#666',
      marginBottom: 32,
    },
    input: {
      width: '100%',
      height: 50,
      backgroundColor: isDarkMode ? '#2a2a2a' : '#fff',
      borderRadius: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      borderWidth: 1,
      borderColor: isDarkMode ? '#444' : '#ddd',
      marginBottom: 20,
    },
    button: {
      width: '100%',
      height: 50,
      backgroundColor: '#007AFF',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 8,
    },
    buttonDisabled: {
      backgroundColor: isDarkMode ? '#444' : '#ccc',
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
      marginBottom: 16,
    },
    nicknameText: {
      fontSize: 18,
      color: isDarkMode ? '#ccc' : '#666',
      marginBottom: 32,
    },
    logoutButton: {
      width: '100%',
      height: 50,
      backgroundColor: '#FF3B30',
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logoutButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
      marginTop: -10,
      marginBottom: 12,
      textAlign: 'center',
      width: '100%',
    },
  });

