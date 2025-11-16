import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  RefreshControl,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ContactsScreenStyles } from './ContactsScreen.styles';
import api from '@/api';
import type { Contact } from '@/types';
import type { ContactsScreenProps } from '@/types/navigation';
import LocationService from '@/utils/LocationService';
import LocationModule from '@/native-modules/LocationModule';
import { getWebSocketBaseUrl } from '@/utils/api';
import {
  ShareLocationButton,
  ContactItem,
  LoadingView,
  ErrorView,
  SearchIcon,
} from './components';

function ContactsScreen({ navigation }: ContactsScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransmissionModal, setShowTransmissionModal] = useState(false);
  const [showTransmissionEndedModal, setShowTransmissionEndedModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadContacts();
      checkIsSendingLocation();
    }, [])
  );

  const loadContacts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      const data = await api.contacts.getContacts();
      setContacts(data);
    } catch (err: any) {
      console.error('Ошибка при загрузке контактов:', err);
      setError(err.message || 'Не удалось загрузить контакты');
      if (showLoading) {
        Alert.alert('Ошибка', err.message || 'Не удалось загрузить контакты');
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  const checkIsSendingLocation = async () => {
    try {
      const isSendingLocation = await LocationModule.checkIsStarted();
      setIsSharingLocation(isSendingLocation);
    } catch (err) {
      console.error('Error checking is sending location:', err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts(false);
    setRefreshing(false);
  };

  const startLocationSharing = async () => {
    const isAccessGranted = await LocationService.checkLocationPermission();
    if (!isAccessGranted) {
      await LocationService.requestLocationPermission();
    }

    try {
      const { getToken } = await import('@/utils/storage');
      const token = await getToken();
      const wsUrl = getWebSocketBaseUrl();
      await LocationModule.startSendingLocation(token, wsUrl);
      await checkIsSendingLocation();
      setShowTransmissionModal(true);
    } catch (err) {
      console.error('Error starting location sharing:', err);
      Alert.alert('Ошибка', 'Не удалось запустить отслеживание геолокации');
      throw err;
    }
  };

  const stopLocationSharing = async () => {
    try {
      await LocationModule.stopSendingLocation();
      await checkIsSendingLocation();
      setShowTransmissionEndedModal(true);
    } catch (err) {
      console.error('Error stopping location sharing:', err);
      Alert.alert('Ошибка', 'Не удалось остановить отслеживание геолокации');
      throw err;
    }
  };

  const handleShareLocation = async () => {
    if (isSharingLocation) {
      await stopLocationSharing();
    } else {
      await startLocationSharing();
    }
  };

  const handleOpenMap = (contact: Contact) => {
    if (contact.is_sharing_location) {
      navigation.navigate('Map', {contactName: contact.contact_name});
    }
  }

  const handleLogout = async () => {
    try {
      await api.auth.logout();
      if (isSharingLocation) {
        await stopLocationSharing()
      }
      navigation.replace('Login');
    } catch (logoutError) {
      console.error('Ошибка при выходе:', logoutError);
      navigation.replace('Login');
    }
  };

  const styles = ContactsScreenStyles(isDarkMode);

  const renderContact = ({ item }: { item: Contact }) => (
    <ContactItem
      contact={item}
      onPress={() =>handleOpenMap(item)}
      isDarkMode={isDarkMode}
      itemStyle={styles.contactItem}
      nameContainerStyle={styles.contactNameContainer}
      usernameStyle={styles.contactUsername}
      locationIconStyle={styles.locationIcon}
    />
  );

  if (isLoading) {
    return (
      <LoadingView
        containerStyle={styles.container}
        loadingContainerStyle={styles.loadingContainer}
        loadingTextStyle={styles.loadingText}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={() => loadContacts(true)}
        containerStyle={styles.container}
        errorContainerStyle={styles.errorContainer}
        errorTextStyle={styles.errorText}
        retryButtonStyle={styles.retryButton}
        retryButtonTextStyle={styles.retryButtonText}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Контакты1</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => navigation.navigate('SearchContacts')}>
            <SearchIcon
              size={24}
              color={isDarkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Выйти</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? '#fff' : '#007AFF'}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Нет контактов</Text>
          </View>
        }
      />
      <ShareLocationButton
        isSharingLocation={isSharingLocation}
        onPress={handleShareLocation}
        buttonStyle={styles.shareLocationButton}
        activeButtonStyle={styles.shareLocationButtonActive}
      />
      <Modal
        visible={showTransmissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTransmissionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>
              Трансляция начата
            </Text>
            <Text style={[styles.modalText, isDarkMode && styles.modalTextDark]}>
              Ваше местоположение теперь транслируется другим пользователям
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, isDarkMode && styles.modalButtonDark]}
              onPress={() => setShowTransmissionModal(false)}>
              <Text style={styles.modalButtonText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showTransmissionEndedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTransmissionEndedModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>
              Трансляция завершена
            </Text>
            <Text style={[styles.modalText, isDarkMode && styles.modalTextDark]}>
              Вы прекратили трансляцию своего местоположения
            </Text>
            <TouchableOpacity
              style={[styles.modalButton, isDarkMode && styles.modalButtonDark]}
              onPress={() => setShowTransmissionEndedModal(false)}>
              <Text style={styles.modalButtonText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default ContactsScreen;

