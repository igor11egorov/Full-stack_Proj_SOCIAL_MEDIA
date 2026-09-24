// Создаёт JWT-токены для успешной авторизации пользователей.
// Основные части: экспортируемая логика и зависимости модуля.
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

// Генерирует значение: Token.
function generateToken(userId: string): string {
  const token = jwt.sign(
    {
      id: userId,
    },
    env.jwtSecret,
    {
      expiresIn: '2h',
    },
  )
  return token
}

export default generateToken
