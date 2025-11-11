import { authorizedFetch } from "@/utils/api";

export default {
    setShareLocationStatus: async (sharing: boolean): Promise<void> => {
        try {
          const response = await authorizedFetch('/contacts/share-location', {
            method: 'PATCH',
            body: JSON.stringify({ sharing }),
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
      },
}