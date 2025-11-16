import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SearchContactsScreenStyles } from '@/components/SearchContactsScreen/SearchContactsScreen.styles';
import api from '@/api';
import type { User } from '@/types';
import type { SearchContactsScreenProps } from '@/types/navigation';
import { ContactItem } from '@/components/ContactsScreen/components';
import { BackButton } from '@/components/BackButton';
import { debounce } from '@/utils/debounce';

const DEBOUNCE_DELAY = 500; // миллисекунды

function SearchContactsScreen({ navigation }: SearchContactsScreenProps) {
  const isDarkMode = useColorScheme() === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);

  const performSearchRef = useRef(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const results = await api.contacts.findContactsByName(query.trim());
      setSearchResults(results);
    } catch (error: any) {
      console.error('Ошибка при поиске контактов:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  });

  const debouncedSearch = useRef(
    debounce((query: string) => {
      performSearchRef.current(query);
    }, DEBOUNCE_DELAY)
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const styles = SearchContactsScreenStyles(isDarkMode);

  const handleContactPress = (user: User) => {
    setSelectedUser(user);
    setShowAddContactModal(true);
  };

  const handleAddContact = async () => {
    if (!selectedUser) return;

    setIsAddingContact(true);
    try {
      await api.contacts.addContact(selectedUser.username);
      setSearchResults(searchResults.filter((user) => user.id !== selectedUser.id));
      setShowAddContactModal(false);
      setSelectedUser(null);
      Alert.alert('Успешно', `Контакт ${selectedUser.username} добавлен в ваши контакты`);
    } catch (error: any) {
      console.error('Ошибка при добавлении контакта:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось добавить контакт');
    } finally {
      setIsAddingContact(false);
    }
  };

  const handleCancelAddContact = () => {
    setShowAddContactModal(false);
    setSelectedUser(null);
  };

  const renderContact = ({ item }: { item: User }) => (
    <ContactItem
      contact={item}
      onPress={() => handleContactPress(item)}
      isDarkMode={isDarkMode}
      itemStyle={styles.contactItem}
      nameContainerStyle={styles.contactNameContainer}
      usernameStyle={styles.contactUsername}
      locationIconStyle={styles.locationIcon}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton
          onPress={() => navigation.goBack()}
          buttonStyle={styles.backButton}
        />
        <Text style={styles.title}>Поиск контактов</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Введите имя пользователя..."
          placeholderTextColor={isDarkMode ? '#999' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={isDarkMode ? '#fff' : '#007AFF'}
          />
          <Text style={styles.loadingText}>Поиск...</Text>
        </View>
      ) : hasSearched ? (
        <FlatList
          data={searchResults}
          renderItem={renderContact}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim()
                  ? 'Контакты не найдены'
                  : 'Введите имя пользователя для поиска'}
              </Text>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Введите имя пользователя для поиска
          </Text>
        </View>
      )}
      <Modal
        visible={showAddContactModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelAddContact}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && styles.modalContentDark]}>
            <Text style={[styles.modalTitle, isDarkMode && styles.modalTitleDark]}>
              Добавить контакт?
            </Text>
            <Text style={[styles.modalText, isDarkMode && styles.modalTextDark]}>
              Добавить {selectedUser?.username} в ваши контакты?
            </Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity
                style={[styles.modalButtonCancel, isDarkMode && styles.modalButtonCancelDark]}
                onPress={handleCancelAddContact}
                disabled={isAddingContact}>
                <Text style={[styles.modalButtonTextCancel, isDarkMode && styles.modalButtonTextCancelDark]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, isDarkMode && styles.modalButtonDark]}
                onPress={handleAddContact}
                disabled={isAddingContact}>
                {isAddingContact ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Добавить</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default SearchContactsScreen;

