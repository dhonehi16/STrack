import { appFetch } from "@/utils/api";
import type { IAuthResponse, ILoginCredentials } from "@/types";
import { saveToken, saveUser, getToken, clearAuthData } from "@/utils/storage";

export default {
    login: async (credentials: ILoginCredentials): Promise<IAuthResponse> => {
        try {
            const response = await appFetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                let errorMessage = 'Неверный логин или пароль';
                
                try {
                    const errorData = await response.json();
                    // Если бэкенд возвращает JSON с сообщением об ошибке
                    if (errorData.message || errorData.detail) {
                        errorMessage = errorData.message || errorData.detail;
                    }
                } catch {
                    // Если ответ не JSON, пытаемся прочитать как текст
                    try {
                        const errorText = await response.text();
                        if (errorText) {
                            errorMessage = errorText;
                        }
                    } catch {
                        // Если не удалось прочитать, используем сообщение по умолчанию
                    }
                }
                
                // Для статусов 401 и 403 показываем сообщение о неверных данных
                if (response.status === 401 || response.status === 403) {
                    errorMessage = 'Неверный логин или пароль';
                }
                
                throw new Error(errorMessage);
            }

            const data = await response.json() as IAuthResponse;
            
            const token = data.access_token;
            
            await saveToken(token);
            await saveUser({username: credentials.username});
            
            return data;
        } catch (error) {
            if (error instanceof TypeError && error.message === 'Network request failed') {
                throw new Error('Не удалось подключиться к серверу. Проверьте, что сервер запущен и доступен.');
            }
            throw error;
        }
    },

    /**
     * Получает сохраненный токен
     */
    getStoredToken: async (): Promise<string | null> => {
        return await getToken();
    },

    /**
     * Выход из системы - удаляет сохраненные данные
     */
    logout: async (): Promise<void> => {
        await clearAuthData();
    },
}