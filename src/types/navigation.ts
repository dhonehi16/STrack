import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Contacts: undefined;
  Map: undefined
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type ContactsScreenProps = NativeStackScreenProps<RootStackParamList, 'Contacts'>;
export type MapScreenProps = NativeStackScreenProps<RootStackParamList, 'Map'>;

