// Определяет API-маршруты для лайков публикаций и комментариев.
// Основные части: сопоставление URL и HTTP-методов с контроллерами и middleware.
import { Router } from 'express'
import { getPostLikes, toggleLike } from '../controllers/likeController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

// Хранит значение «router», необходимое для текущего логического блока.
const router = Router()

router.post('/:postId', authMiddleware, toggleLike)
router.get('/:postId', getPostLikes)

export default router
