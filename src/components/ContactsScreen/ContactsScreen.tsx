import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  useColorScheme,
  RefreshControl,
} from 'react-native';
// import Geolocation from '@react-native-community/geolocation';
import Svg, { Path } from 'react-native-svg';
import { ContactsScreenStyles } from './ContactsScreen.styles';
import api from '@/api';
import type { Contact } from '@/types';
import type { ContactsScreenProps } from '@/types/navigation';
import LocationService from '@/utils/LocationService';

function ContactsScreen({ navigation }: ContactsScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      const data = await api.contacts.getContacts();
      console.log(data)
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContacts(false);
    setRefreshing(false);
  };

  const handleShareLocation = async () => {
    try {
      const newSharingStatus = !isSharingLocation;
      setIsSharingLocation(newSharingStatus);
      await api.location.setShareLocationStatus(newSharingStatus);
      console.log(newSharingStatus);
      if (newSharingStatus) {
        LocationService.getInstance().startTrackingLocation();
      } else {
        LocationService.getInstance().stopTrackingLocation();
      }
    } catch (err: any) {
      console.error('Ошибка при отправке локации:', err);
      Alert.alert('Ошибка', err.message || 'Не удалось отправить локацию');
    }
  }

  const styles = ContactsScreenStyles(isDarkMode);

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity onPress={() => navigation.navigate('Map')}>
      <View style={styles.contactItem}>
        <View style={styles.contactNameContainer}>
          <Text style={styles.contactUsername}>{item.contact_name}</Text>
          {item.is_sharing_location && (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" style={styles.locationIcon}>
              <Path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"
                fill={isDarkMode ? '#007AFF' : '#007AFF'}
              />
            </Svg>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDarkMode ? '#fff' : '#000'} />
          <Text style={styles.loadingText}>Загрузка контактов...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadContacts(true)}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Контакты</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            try {
              await api.auth.logout();
              navigation.replace('Login');
            } catch (logoutError) {
              console.error('Ошибка при выходе:', logoutError);
              navigation.replace('Login');
            }
          }}>
          <Text style={styles.logoutButtonText}>Выйти</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.user_id.toString()}
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
      <TouchableOpacity
        style={styles.shareLocationButton}
        onPress={handleShareLocation}
        activeOpacity={0.8}>
        <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5 14.5 7.62 14.5 9 13.38 11.5 12 11.5z"
            fill="#fff"
          />
          <Path
            d="M12 6L10 8h4L12 6zM12 8v6"
            stroke="#fff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

export default ContactsScreen;

