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
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: '#fff',
      fontWeight: '500',
    },
    loadingTextDark: {
      color: '#fff',
    },
    marker: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markerArrow: {
      width: 0,
      height: 0,
      borderLeftWidth: 8,
      borderRightWidth: 8,
      borderBottomWidth: 20,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderBottomColor: '#FF0000',
    },
    infoPanel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: 32,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    infoPanelDark: {
      backgroundColor: '#333',
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: '#000',
      marginBottom: 4,
    },
    userNameDark: {
      color: '#fff',
    },
    updateTime: {
      fontSize: 14,
      color: '#666',
      fontWeight: '400',
    },
    updateTimeDark: {
      color: '#aaa',
    },
    statusMessage: {
      fontSize: 14,
      color: '#FF6B6B',
      fontWeight: '500',
    },
    statusMessageDark: {
      color: '#FF8E8E',
    },
    locationButton: {
      position: 'absolute',
      bottom: 140,
      right: 20,
      width: 56,
      height: 56,
      backgroundColor: '#fff',
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    locationButtonDark: {
      backgroundColor: '#333',
    },
    locationButtonInactive: {
      backgroundColor: '#f0f0f0',
      opacity: 0.5,
    },
    locationButtonInactiveDark: {
      backgroundColor: '#555',
      opacity: 0.5,
    },
    locationButtonActive: {
      backgroundColor: '#007AFF',
    },
    locationButtonActiveDark: {
      backgroundColor: '#0A84FF',
    },
    gpsIconContainer: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    gpsIconOuter: {
      position: 'absolute',
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#007AFF',
    },
    gpsIconInner: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: '#007AFF',
    },
    gpsIconCenter: {
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#007AFF',
    },
    gpsIconCrossH: {
      position: 'absolute',
      width: 2,
      height: 8,
      backgroundColor: '#007AFF',
      top: -4,
    },
    gpsIconCrossV: {
      position: 'absolute',
      width: 8,
      height: 2,
      backgroundColor: '#007AFF',
      left: -4,
    },
    gpsIconInactive: {
      borderColor: '#999',
      backgroundColor: '#999',
    },
    gpsIconInactiveDark: {
      borderColor: '#666',
      backgroundColor: '#666',
    },
    gpsIconActive: {
      borderColor: '#fff',
      backgroundColor: '#fff',
    },
    gpsIconActiveDark: {
      borderColor: '#fff',
      backgroundColor: '#fff',
    },
  });

