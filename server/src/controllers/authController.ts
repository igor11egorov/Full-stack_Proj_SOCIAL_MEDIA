// Обрабатывает HTTP-запросы авторизации: регистрацию, вход и восстановление пароля.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import type { NextFunction, Request, Response } from 'express'
import { User } from '../models/User.js'
import { AppError } from '../utils/appError.js'
import generateToken from '../utils/generateToken.js'

// Регистрация пользователя
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { username, email, password, fullName } = req.body

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!username || !email || !password || !fullName) {
      throw new AppError(
        'Fields username, email, password and fullName are required',
        400,
      )
    }

    // Хранит значение «existingUser», необходимое для текущего логического блока.
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (existingUser) {
      throw new AppError('User with this email or username already exists', 409)
    }

    // Хранит значение «user», необходимое для текущего логического блока.
    const user = new User({
      username,
      email,
      password,
      fullName,
    })

    await user.save()

    // Хранит значение «token», необходимое для текущего логического блока.
    const token = generateToken(user._id.toString())

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}

// Авторизация пользователя (логин)
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { identifier, password } = req.body

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!identifier || !password) {
      throw new AppError('Email/username and password required', 400)
    }

    // Хранит значение «user», необходимое для текущего логического блока.
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password')

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!user) {
      throw new AppError('Invalid password or email', 401)
    }

    // Хранит результат проверки условия для последующей логики интерфейса.
    const isPasswordValid = await user.comparePassword(password)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!isPasswordValid) {
      throw new AppError('Invalid password or email', 401)
    }

    // Хранит значение «token», необходимое для текущего логического блока.
    const token = generateToken(user._id.toString())

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    next(error)
  }
}
