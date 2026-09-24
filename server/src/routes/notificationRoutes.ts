// Определяет API-маршруты для получения и обновления уведомлений.
// Основные части: сопоставление URL и HTTP-методов с контроллерами и middleware.
import { Router } from 'express'
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../controllers/notificationController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

// Хранит значение «router», необходимое для текущего логического блока.
const router = Router()

router.get('/', authMiddleware, getMyNotifications)
router.patch('/read-all', authMiddleware, markAllNotificationsAsRead)
router.patch('/:notificationId/read', authMiddleware, markNotificationAsRead)

export default router
