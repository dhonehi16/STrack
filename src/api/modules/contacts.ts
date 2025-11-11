import { authorizedFetch } from '@/utils/api';
import type { Contact } from '@/types';

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
};