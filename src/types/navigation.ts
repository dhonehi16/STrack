import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Contacts: undefined;
  SearchContacts: undefined;
  Map: {
    contactName: string;
  };
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type ContactsScreenProps = NativeStackScreenProps<RootStackParamList, 'Contacts'>;
export type SearchContactsScreenProps = NativeStackScreenProps<RootStackParamList, 'SearchContacts'>;
export type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'Map'>;

