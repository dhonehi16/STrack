import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import type { Contact, User } from '@/types';
import { LocationIcon } from './LocationIcon';

interface ContactItemProps {
  contact: Contact | User;
  onPress: () => void;
  isDarkMode: boolean;
  itemStyle?: ViewStyle;
  nameContainerStyle?: ViewStyle;
  usernameStyle?: TextStyle;
  locationIconStyle?: ViewStyle;
}

export const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  onPress,
  isDarkMode,
  itemStyle,
  nameContainerStyle,
  usernameStyle,
  locationIconStyle,
}) => {
  const isContact = 'contact_name' in contact;
  const displayName = isContact ? contact.contact_name : contact.username;
  const isSharingLocation = isContact ? contact.is_sharing_location : false;

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={itemStyle}>
        <View style={nameContainerStyle}>
          <Text style={usernameStyle}>{displayName}</Text>
          {isSharingLocation && (
            <LocationIcon
              size={20}
              color={isDarkMode ? '#007AFF' : '#007AFF'}
              style={locationIconStyle}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

