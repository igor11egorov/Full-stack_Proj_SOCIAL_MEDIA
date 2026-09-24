// Определяет API-маршруты для операций с публикациями.
// Основные части: сопоставление URL и HTTP-методов с контроллерами и middleware.
import { Router } from 'express'
import {
  createPost,
  deletePost,
  getAllPosts,
  getExplorePosts,
  getPostById,
  getUserPosts,
  updatePost,
} from '../controllers/postController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { upload } from '../middlewares/uploadUserImage.js'

const router = Router()

router.post(
  '/',
  authMiddleware,
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 10 },
  ]),
  createPost,
)
router.get('/', getAllPosts)
router.get('/explore', getExplorePosts)
router.get('/user/:userId', getUserPosts)
router.get('/:id', getPostById)
router.patch(
  '/:id',
  authMiddleware,
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 10 },
  ]),
  updatePost,
)
router.delete('/:id', authMiddleware, deletePost)

export default router
