// Определяет API-маршруты для получения, создания и удаления комментариев.
import { Router } from 'express'
import {
  addComment,
  deleteComment,
  getPostComments,
} from '../controllers/commentController.js'
import {
  getCommentLikes,
  toggleCommentLike,
} from '../controllers/commentLikeController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/likes/:commentId', getCommentLikes)
router.post('/likes/:commentId', authMiddleware, toggleCommentLike)

router.post('/:postId', authMiddleware, addComment)
router.get('/:postId', getPostComments)
router.delete('/:commentId', authMiddleware, deleteComment)

export default router
