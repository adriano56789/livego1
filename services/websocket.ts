/**
 * WEBSOCKET MANAGER - DESATIVADO
 */

export class WebSocketManager {
  connect(userId: string) { /* No-op */ }
  disconnect() { /* No-op */ }
  joinStreamRoom(roomId: string) { /* No-op */ }
  leaveStreamRoom(roomId: string) { /* No-op */ }
  sendPrivateMessage(toUserId: string, message: string) { /* No-op */ }
  broadcast(event: string, data: any) { /* No-op */ }
  on(event: string, callback: (data: any) => void) { /* No-op */ }
  off(event: string, callback: (data: any) => void) { /* No-op */ }
  emit(event: string, data: any) { /* No-op */ }
}

export const webSocketManager = new WebSocketManager();