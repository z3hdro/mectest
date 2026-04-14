import {WsEvent} from "./types";

const WS_URL = 'wss://k8s.mectest.ru/test-app/ws';

export class WebSocketService {
    private ws: WebSocket | null = null;
    private onEvent: ((event: WsEvent) => void) | null = null;

    connect(token: string, onEvent: (event: WsEvent) => void): void {
        this.disconnect();
        this.onEvent = onEvent;

        this.ws = new WebSocket(`${WS_URL}?token=${token}`);

        this.ws.onmessage = (event: MessageEvent) => {
            try {
                const parsed = JSON.parse(event.data as string) as WsEvent;
                this.onEvent?.(parsed);
            } catch {
                // ignore malformed messages
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    disconnect(): void {
        if (this.ws) {
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }
        this.onEvent = null;
    }
}

export const webSocketService = new WebSocketService();
