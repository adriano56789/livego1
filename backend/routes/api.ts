import { Router } from 'express';
import { authController } from '../controllers/authController';
import { userController } from '../controllers/userController';
import { giftController } from '../controllers/giftController';
import { streamController } from '../controllers/streamController';
import { walletController } from '../controllers/walletController';
import { chatController } from '../controllers/chatController';
import { assetController } from '../controllers/assetController';
import { authMiddleware } from '../middleware/auth';
import { sendSuccess } from '../utils/response';
import { dbController } from '../controllers/dbController';

const router = Router();

// Status
router.get('/status', (req, res) => sendSuccess(res, { online: true }, "API Real LiveGo Ativa!"));
router.get('/db/collections', authMiddleware as any, dbController.listCollections);
router.post('/db/setup', authMiddleware as any, dbController.setupDatabase);

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);

// Usuário
router.get('/users/me', authMiddleware as any, userController.getMe);
router.get('/users/online', authMiddleware as any, userController.getOnlineUsers);
router.get('/users/:id', authMiddleware as any, userController.getUser);
router.post('/users/:id/follow', authMiddleware as any, userController.follow);
router.post('/users/me/billing-address', authMiddleware as any, userController.updateBillingAddress);
router.post('/users/me/credit-card', authMiddleware as any, userController.updateCreditCard);
router.post('/users/:userId/frame', authMiddleware as any, userController.follow); // Stub para equipar

// Chat (Resolve 404 de /api/chats/conversations)
router.get('/chats/conversations', authMiddleware as any, chatController.getConversations);
router.get('/ranking/fans', authMiddleware as any, chatController.getRanking);

// Carteira e Transações
router.get('/wallet/balance', authMiddleware as any, walletController.getBalance);
router.post('/wallet/confirm-purchase', authMiddleware as any, walletController.confirmPurchase);
router.post('/wallet/cancel-purchase', authMiddleware as any, walletController.cancelPurchase);

// Assets (Resolve 404 de /api/assets/frames)
router.get('/assets/frames', authMiddleware as any, assetController.getFrames);
router.get('/assets/music', authMiddleware as any, assetController.getMusic);

// Presentes
router.get('/gifts', authMiddleware as any, giftController.getAll);
router.post('/streams/:streamId/gift', authMiddleware as any, giftController.sendGift);

// Streams
router.get('/live/:category', authMiddleware as any, streamController.listByCategory);
router.post('/streams', authMiddleware as any, streamController.create);

export default router;