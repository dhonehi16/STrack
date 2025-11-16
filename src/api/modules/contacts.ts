import { authorizedFetch } from '@/utils/api';
import type { Contact, User } from '@/types';

export default {
  getContacts: async (): Promise<Contact[]> => {
    try {
      const response = await authorizedFetch('/contacts', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data as Contact[];
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Не удалось подключиться к серверу. Проверьте, что сервер запущен и доступен.');
      }
      throw error;
    }
  },

  findContactsByName: async(username: string): Promise<User[]> => {
    try {
      const response = await authorizedFetch(`/contacts/search?username=${username}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data as User[];
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Не удалось подключиться к серверу. Проверьте, что сервер запущен и доступен.');
      }
      throw error;
    }
  },

  addContact: async (username: string): Promise<void> => {
    try {
      const response = await authorizedFetch('/contacts', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Не удалось подключиться к серверу. Проверьте, что сервер запущен и доступен.');
      }
      throw error;
    }
  }
};