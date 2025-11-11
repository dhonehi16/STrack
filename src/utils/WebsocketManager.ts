import { ILocationData } from '@/types';
import { getToken } from './storage';

export type ConnectionPayload = {
    onSuccessConnection: () => void;
    onErrorConnection: (error: WebSocketErrorEvent) => void;
}

export default class WebsocketManager {
    private static instance: WebsocketManager | null = null;
    private static wsURL = 'ws://10.0.2.2:8000/ws';
    private wsSender: WebSocket | null = null;

    async connectToSendLocation({onSuccessConnection, onErrorConnection}: ConnectionPayload) {
        const token = await getToken();
        this.wsSender = new WebSocket(`${WebsocketManager.wsURL}/send?jwt=${token}`);

        this.wsSender.onopen = () => {
            onSuccessConnection();
        }

        this.wsSender.onerror = (error) => {
            onErrorConnection(error);
        }
    }

    async sendLocation(locationData: ILocationData) {
        if (this.wsSender) {
            console.log(this.wsSender)
            this.wsSender.send(JSON.stringify(locationData));
        }
    }

    async disconnectFromSendLocation() {
        if (this.wsSender) {
            this.wsSender.close();
            this.wsSender = null;
        }
    }

    static getInstance() {
        if (!WebsocketManager.instance) {
            WebsocketManager.instance = new WebsocketManager();
        }
        return WebsocketManager.instance as WebsocketManager;
    }
}