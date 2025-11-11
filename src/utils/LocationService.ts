import { Alert, AppState, AppStateStatus } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import WebsocketManager from "./WebsocketManager";

const LOCATION_OPTIONS = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
    distanceFilter: 1, // Минимальное расстояние в метрах для обновления
    showLocationDialog: true,
    forceRequestLocation: true,
};

export default class LocationService {
    private static instance: LocationService | null = null;
    private watchId: number | null = null;
    private appStateSubscription: any = null;
    private websocketManager: WebsocketManager | null = null;

    static getInstance() {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    async startTrackingLocation() {
        try {
            await Geolocation.requestAuthorization();
        } catch (error) {
            console.error('Ошибка запроса разрешения на геолокацию:', error);
            Alert.alert('Ошибка', 'Не удалось получить разрешение на использование геолокации');
            return;
        }

        this.websocketManager = WebsocketManager.getInstance();

        const onSuccessConnection = () => {
            Alert.alert('Успешно', 'Трансляция геопозиции начата');

            this.startWatchingLocation();
            
            this.setupAppStateListener();
        };

        const onErrorConnection = (error: WebSocketErrorEvent) => {
            Alert.alert('Ошибка', `Не удалсь начать трансляцию геопозиции. Ошибка: ${error.message}`);
        };

        await this.websocketManager.connectToSendLocation({onSuccessConnection, onErrorConnection});
    }

    private startWatchingLocation() {
        // Останавливаем предыдущее отслеживание, если оно было
        if (this.watchId !== null) {
            Geolocation.clearWatch(this.watchId);
        }

        // Используем watchPosition для непрерывного отслеживания
        // Это работает лучше в фоновом режиме, чем setInterval + getCurrentPosition
        this.watchId = Geolocation.watchPosition(
            (position) => {
                if (this.websocketManager) {
                    this.websocketManager.sendLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: position.timestamp
                    });
                }
            },
            (error) => {
                console.error('Ошибка получения геолокации:', error);
            },
            LOCATION_OPTIONS
        );
    }

    private setupAppStateListener() {
        this.appStateSubscription = AppState.addEventListener(
            'change',
            (nextAppState: AppStateStatus) => {
                if (nextAppState === 'active') {
                    // Приложение вернулось в активное состояние
                    console.log('Приложение активно - отслеживание продолжается');
                } else if (nextAppState === 'background') {
                    // Приложение ушло в фон - отслеживание продолжается
                    console.log('Приложение в фоне - отслеживание продолжается');
                }
            }
        );
    }

    stopTrackingLocation() {
        // Останавливаем отслеживание геолокации
        if (this.watchId !== null) {
            Geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }

        // Отписываемся от событий состояния приложения
        if (this.appStateSubscription) {
            this.appStateSubscription.remove();
            this.appStateSubscription = null;
        }

        // Отключаем WebSocket
        if (this.websocketManager) {
            this.websocketManager.disconnectFromSendLocation();
            this.websocketManager = null;
        }
    }
}