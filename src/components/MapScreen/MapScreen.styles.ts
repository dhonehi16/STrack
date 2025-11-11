import { StyleSheet } from 'react-native';

export const MapScreenStyles = (_isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    backButton: {
      position: 'absolute',
      top: 50,
      left: 20,
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#666',
    },
  });

