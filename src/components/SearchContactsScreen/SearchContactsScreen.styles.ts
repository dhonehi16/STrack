import { StyleSheet } from 'react-native';

export const SearchContactsScreenStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? '#000' : '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    backButton: {
      marginRight: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDarkMode ? '#fff' : '#000',
      flex: 1,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    searchInput: {
      flex: 1,
      height: 44,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#000',
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    loadingIndicator: {
      marginLeft: 12,
    },
    listContainer: {
      padding: 20,
    },
    contactItem: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 12,
      backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? '#333' : '#e0e0e0',
    },
    contactNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    contactUsername: {
      fontSize: 16,
      fontWeight: '500',
      color: isDarkMode ? '#fff' : '#000',
      flex: 1,
    },
    locationIcon: {
      marginLeft: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: isDarkMode ? '#999' : '#666',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: isDarkMode ? '#999' : '#666',
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 24,
      width: '80%',
      maxWidth: 320,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalContentDark: {
      backgroundColor: '#1a1a1a',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#000',
      marginBottom: 12,
      textAlign: 'center',
    },
    modalTitleDark: {
      color: '#fff',
    },
    modalText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    modalTextDark: {
      color: '#aaa',
    },
    modalButtonsContainer: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
    },
    modalButton: {
      flex: 1,
      backgroundColor: '#007AFF',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      marginLeft: 6,
    },
    modalButtonDark: {
      backgroundColor: '#0A84FF',
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    modalButtonCancel: {
      flex: 1,
      backgroundColor: '#f0f0f0',
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
      marginRight: 6,
    },
    modalButtonCancelDark: {
      backgroundColor: '#333',
    },
    modalButtonTextCancel: {
      color: '#000',
      fontSize: 16,
      fontWeight: '600',
    },
    modalButtonTextCancelDark: {
      color: '#fff',
    },
  });

