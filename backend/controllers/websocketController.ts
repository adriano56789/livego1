
import { Server, Socket } from 'socket.io';

export const setupWebSocket = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        const userId = socket.handshake.query.userId;
        const username = socket.handshake.query.username;

        socket.on('stream:join', ({ streamId }) => {
            socket.join(`stream_${streamId}`);
            console.log(`[WS] ${username} entrou na sala ${streamId}`);
            
            // Notifica outros usuários na sala
            socket.to(`stream_${streamId}`).emit('stream:user_joined', { 
                userId, 
                username,
                timestamp: Date.now() 
            });
        });

        socket.on('stream:message', (payload) => {
            const { streamId, text } = payload;
            // Broadcast para todos na sala (incluindo o remetente para sincronização)
            io.to(`stream_${streamId}`).emit('newStreamMessage', {
                ...payload,
                id: Date.now()
            });
        });

        socket.on('stream:gift', (payload) => {
            const { streamId } = payload;
            // Efeito visual de presente para todos na sala
            io.to(`stream_${streamId}`).emit('newStreamGift', payload);
        });

        socket.on('pk:start', ({ streamId, opponentId }) => {
            io.to(`stream_${streamId}`).emit('pk:status_update', { active: true, opponentId });
        });

        socket.on('disconnect', () => {
            console.log(`[WS] Usuário ${userId} desconectado`);
        });
    });
};
