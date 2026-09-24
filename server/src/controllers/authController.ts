// Обрабатывает HTTP-запросы авторизации: регистрацию, вход и восстановление пароля.
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
  try {
    const { username, email, password, fullName } = req.body

    if (!username || !email || !password || !fullName) {
      throw new AppError(
        'Fields username, email, password and fullName are required',
        400,
      )
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      throw new AppError('User with this email or username already exists', 409)
    }

    const user = new User({
      username,
      email,
      password,
      fullName,
    })

    await user.save()

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
  try {
    const { identifier, password } = req.body

    if (!identifier || !password) {
      throw new AppError('Email/username and password required', 400)
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password')

    if (!user) {
      throw new AppError('Invalid password or email', 401)
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      throw new AppError('Invalid password or email', 401)
    }

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
