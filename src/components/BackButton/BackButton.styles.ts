import { StyleSheet } from 'react-native';

export const BackButtonStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    backButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: '#fff',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    backButtonDark: {
      backgroundColor: '#333',
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000',
    },
    backButtonTextDark: {
      color: '#fff',
    },
  });

