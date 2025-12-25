/**
 * REAL WEBSOCKET MANAGER - LiveGo
 */
export class WebSocketManager {
  private socket: WebSocket | null = null;
  private callbacks: Map<string, ((data: any) => void)[]> = new Map();
  private baseUrl: string = (import.meta as any).env?.VITE_WS_URL || 'wss://livego.store';
  private userId: string | null = null;
  private reconnectTimeout: number = 5000;

  connect(userId: string) {
    this.userId = userId;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.socket = new WebSocket(this.baseUrl);

    this.socket.onopen = () => {
      console.log("[WS] Conectado ao LiveGo Real-Time");
      // Notifica o status online ao conectar
      this.emit('user:status', { userId, online: true });
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // O servidor envia { event: "nome_do_evento", data: { ... } }
        const eventName = payload.event;
        const data = payload.data;

        if (eventName) {
          const handlers = this.callbacks.get(eventName);
          if (handlers) {
            handlers.forEach(handler => handler(data));
          }
        }
      } catch (e) {
        console.error("[WS] Erro ao processar mensagem:", e);
      }
    };

    this.socket.onclose = () => {
      console.log("[WS] Conexão encerrada. Tentando reconectar...");
      this.socket = null;
      if (this.userId) {
        setTimeout(() => this.connect(this.userId!), this.reconnectTimeout);
      }
    };

    this.socket.onerror = (err) => {
      console.error("[WS] Erro na conexão WebSocket:", err);
    };
  }

  disconnect() {
    if (this.socket) {
      if (this.userId) {
        this.emit('user:status', { userId: this.userId, online: false });
      }
      this.socket.close();
      this.socket = null;
    }
    this.userId = null;
  }

  emit(eventName: string, data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ event: eventName, data }));
    } else {
      console.warn(`[WS] Não foi possível emitir ${eventName}: Socket não está aberto.`);
    }
  }

  // Helpers específicos
  joinStream(streamId: string, userId: string) {
    this.emit('join:stream', { streamId, userId });
  }

  leaveStream(streamId: string, userId: string) {
    this.emit('leave:stream', { streamId, userId });
  }

  on(event: string, callback: (data: any) => void) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    const handlers = this.callbacks.get(event);
    if (handlers) {
      this.callbacks.set(event, handlers.filter(h => h !== callback));
    }
  }
}

export const webSocketManager = new WebSocketManager();
