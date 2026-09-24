// Расширяет типы Express данными авторизованного пользователя в объекте запроса.
// Основные части: экспортируемая логика и зависимости модуля.
import type { IUser } from '../models/User.js'

declare global {
  namespace Express {
    interface Request {
      user?: IUser // теперь req.user = user
    }
  }
}

export {}
