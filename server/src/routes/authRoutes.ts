// Определяет API-маршруты для регистрации, входа и восстановления пароля.
// Основные части: сопоставление URL и HTTP-методов с контроллерами и middleware.
import { Router } from 'express'
import { login, register } from '../controllers/authController.js'

// Хранит значение «router», необходимое для текущего логического блока.
const router = Router()

router.post('/register', register)
router.post('/login', login)

export default router
