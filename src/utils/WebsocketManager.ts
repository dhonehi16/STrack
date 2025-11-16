import { getToken } from './storage';
import { getWebSocketBaseUrl } from './api';

export type ConnectionPayload = {
    onSuccessConnection: () => void;
    onErrorConnection: (error: WebSocketErrorEvent) => void;
    onCloseConnection: (event: WebSocketCloseEvent) => void;
    onMessage: (message: string) => void;
}

export default class WebsocketManager {
    private ws: WebSocket | null = null;
    private username: string;
    private connectionPayload: ConnectionPayload | null = null;
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectDelay: number = 3000;
    private shouldReconnect: boolean = true;

    constructor(username: string) {
        this.username = username;
    }

    async connectToReceiveLocation({onSuccessConnection, onErrorConnection, onCloseConnection, onMessage}: ConnectionPayload) {
        this.connectionPayload = { onSuccessConnection, onErrorConnection, onCloseConnection, onMessage };
        await this.connect();
    }

    private async connect() {
        const token = await getToken();
        const wsBaseUrl = getWebSocketBaseUrl();
        this.ws = new WebSocket(`${wsBaseUrl}/receive/${this.username}?jwt=${token}`);

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            if (this.connectionPayload) {
                this.connectionPayload.onSuccessConnection();
            }
        }

        this.ws.onclose = (event) => {
            if (this.connectionPayload) {
                this.connectionPayload.onCloseConnection(event);
            }

            if (this.shouldReconnect && event.code !== undefined && ![4000, 1008].includes(event.code)) {
                this.attemptReconnect();
            }
        }

        this.ws.onerror = (error) => {
            if (this.connectionPayload) {
                this.connectionPayload.onErrorConnection(error);
            }
            
            if (this.shouldReconnect) {
                this.attemptReconnect();
            }
        }

        this.ws.onmessage = (event) => {
            if (this.connectionPayload) {
                this.connectionPayload.onMessage(event.data);
            }
        }
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts += 1;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, this.reconnectDelay);
    }

    async disconnectFromReceiveLocation() {
        this.shouldReconnect = false;
        
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}