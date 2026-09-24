// Проверяет JWT-токен запроса и добавляет данные авторизованного пользователя в request.
// Основные части: обработка запроса до контроллера или единый формат ошибки.
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { AppError } from '../utils/appError.js'
import { env } from './../config/env.js'

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new AppError('Token was not provided', 401)
    }

    const [bearer, token] = authHeader.split(' ')

    if (bearer !== 'Bearer' || !token) {
      throw new AppError('Invalid token format', 401)
    }

    const decoded = jwt.verify(token, env.jwtSecret) as { id: string }

    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      throw new AppError('User not found', 401)
    }

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}
