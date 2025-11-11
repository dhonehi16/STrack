/**
 * Navigation Ref
 * Позволяет использовать навигацию вне React компонентов
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/types/navigation';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Навигация к экрану логина
 */
export const navigateToLogin = () => {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }
};

