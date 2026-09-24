// Определяет API-маршруты для получения и обновления уведомлений.
import { Router } from 'express';
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead, } from '../controllers/notificationController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = Router();
router.get('/', authMiddleware, getMyNotifications);
router.patch('/read-all', authMiddleware, markAllNotificationsAsRead);
router.patch('/:notificationId/read', authMiddleware, markNotificationAsRead);
export default router;
