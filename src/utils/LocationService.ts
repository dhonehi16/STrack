import { Alert, Platform } from "react-native";
import { check, request, PERMISSIONS, RESULTS, Permission } from "react-native-permissions";

class LocationService {
    private static instance: LocationService | null = null;

    static getInstance() {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    /**
     * Получает тип разрешения для текущей платформы
     */
    private getLocationPermission(): Permission {
        return Platform.OS === 'ios'
            ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
            : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
    }

    /**
     * Проверяет, есть ли разрешение на геолокацию
     * @returns true если разрешение предоставлено, false в противном случае
     */
    async checkLocationPermission(): Promise<boolean> {
        try {
            const locationPermission = this.getLocationPermission();
            const result = await check(locationPermission);
            return result === RESULTS.GRANTED;
        } catch (error) {
            console.error('Ошибка проверки разрешения на геолокацию:', error);
            return false;
        }
    }

    /**
     * Запрашивает разрешение на геолокацию
     * @returns true если разрешение предоставлено, false в противном случае
     */
    async requestLocationPermission(): Promise<boolean> {
        try {
            const locationPermission = this.getLocationPermission();

            // Сначала проверяем текущий статус
            const checkResult = await check(locationPermission);

            console.log(checkResult)

            if (checkResult === RESULTS.GRANTED) {
                console.log('Разрешение на геолокацию уже предоставлено');
                return true;
            }

            if (checkResult === RESULTS.BLOCKED || checkResult === RESULTS.UNAVAILABLE) {
                Alert.alert(
                    'Разрешение недоступно',
                    'Разрешение на геолокацию заблокировано или недоступно. Пожалуйста, разрешите доступ в настройках приложения.'
                );
                return false;
            }

            // Запрашиваем разрешение
            const requestResult = await request(locationPermission);

            if (requestResult === RESULTS.GRANTED) {
                console.log('Разрешение на геолокацию предоставлено');
                return true;
            } else {
                Alert.alert(
                    'Разрешение отклонено',
                    'Для работы приложения необходимо разрешение на использование геолокации. Пожалуйста, предоставьте разрешение в настройках приложения.'
                );
                return false;
            }
        } catch (error) {
            console.error('Ошибка запроса разрешения на геолокацию:', error);
            Alert.alert('Ошибка', 'Не удалось получить разрешение на использование геолокации');
            return false;
        }
    }
}

export default LocationService.getInstance()