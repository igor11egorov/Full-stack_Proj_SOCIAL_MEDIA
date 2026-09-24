// Определяет API-маршруты для профиля, поиска и данных пользователей.
// Основные части: сопоставление URL и HTTP-методов с контроллерами и middleware.
import { Router } from 'express'
import {
  getMyProfile,
  getUserProfile,
  searchUsers,
  updateUserProfile,
} from '../controllers/userController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'
import { upload } from '../middlewares/uploadUserImage.js'

const router = Router()

router.get('/me', authMiddleware, getMyProfile)
router.patch('/me', authMiddleware, upload.single('avatar'), updateUserProfile)
router.get('/search', searchUsers)
router.get('/:id', getUserProfile)

export default router
