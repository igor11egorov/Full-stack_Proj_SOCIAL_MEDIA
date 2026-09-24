// Определяет API-маршруты для лайков публикаций и комментариев.
import { Router } from 'express'
import { getPostLikes, toggleLike } from '../controllers/likeController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/:postId', authMiddleware, toggleLike)
router.get('/:postId', getPostLikes)

export default router
