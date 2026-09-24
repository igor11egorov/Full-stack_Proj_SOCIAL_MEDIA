// Определяет API-маршруты для подписок и списков пользователей.
// Основные части: сопоставление URL и HTTP-методов с контроллерами и middleware.
import { Router } from 'express'
import {
  getUserFollowers,
  getUserFollowing,
  subscribeToUser,
  unsubscribeFromUser,
} from '../controllers/subscribeController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/:userId', authMiddleware, subscribeToUser)
router.delete('/:userId', authMiddleware, unsubscribeFromUser)
router.get('/:userId/followers', authMiddleware, getUserFollowers)
router.get('/:userId/following', authMiddleware, getUserFollowing)

export default router
