// Проверяет JWT-токен запроса и добавляет данные авторизованного пользователя в request.
// Основные части: обработка запроса до контроллера или единый формат ошибки.
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { AppError } from '../utils/appError.js'
import { env } from './../config/env.js'

// Хранит значение «authMiddleware», необходимое для текущего логического блока.
export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    // Хранит значение «authHeader», необходимое для текущего логического блока.
    const authHeader = req.headers.authorization

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!authHeader) {
      throw new AppError('Token was not provided', 401)
    }

    const [bearer, token] = authHeader.split(' ')

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (bearer !== 'Bearer' || !token) {
      throw new AppError('Invalid token format', 401)
    }

    // Хранит значение «decoded», необходимое для текущего логического блока.
    const decoded = jwt.verify(token, env.jwtSecret) as { id: string }

    // Хранит значение «user», необходимое для текущего логического блока.
    const user = await User.findById(decoded.id).select('-password')

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!user) {
      throw new AppError('User not found', 401)
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}
