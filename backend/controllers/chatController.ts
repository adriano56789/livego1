
import { sendSuccess } from '../utils/response';
import { ConversationModel } from '../models/Conversation';
import { UserModel } from '../models/User';

export const chatController = {
    getConversations: async (req: any, res: any) => {
        try {
            const userId = req.userId;
            
            // Busca conversas reais no banco (ou retorna uma de boas-vindas se estiver vazio)
            let conversations = await ConversationModel.find({ 
                participants: userId 
            }).lean();

            if (conversations.length === 0) {
                // Mock de suporte para não vir vazio na primeira vez
                conversations = [{
                    id: 'conv-support',
                    friend: {
                        id: 'support-livercore',
                        name: 'Suporte LiveGo',
                        avatarUrl: 'https://picsum.photos/seed/support/200',
                        isOnline: true,
                        level: 99
                    },
                    lastMessage: 'Bem-vindo ao LiveGo! Como podemos ajudar?',
                    unreadCount: 1,
                    updatedAt: new Date().toISOString()
                }] as any;
            }

            return sendSuccess(res, conversations);
        } catch (err) {
            return sendSuccess(res, []); // Retorna vazio em vez de erro para não quebrar o app
        }
    },

    getFriends: async (req: any, res: any) => {
        try {
            // Retorna usuários aleatórios como sugestão de amigos por enquanto
            const friends = await UserModel.find({ id: { $ne: req.userId } }).limit(10);
            return sendSuccess(res, friends);
        } catch (err) {
            return sendSuccess(res, []);
        }
    },

    getRanking: async (req: any, res: any) => {
        try {
            const topUsers = await UserModel.find().sort({ diamonds: -1 }).limit(20);
            const formattedRanking = topUsers.map((u: any, index) => ({
                ...u.toJSON(),
                rank: index + 1,
                value: u.diamonds * 10 // Simulação de contribuição
            }));
            return sendSuccess(res, formattedRanking);
        } catch (err) {
            return sendSuccess(res, []);
        }
    }
};
