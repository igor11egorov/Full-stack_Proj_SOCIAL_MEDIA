// Обрабатывает запросы профилей пользователей, поиска и обновления личных данных.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import crypto from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { uploadToS3 } from '../config/s3.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/appError.js'

// Хранит значение «getUserProfile», необходимое для текущего логического блока.
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { id } = req.params

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user id', 400)
    }

    // Хранит значение «user», необходимое для текущего логического блока.
    const user = await User.findById(id).select('-password')

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!user) {
      throw new AppError('User not found', 404)
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getMyProfile», необходимое для текущего логического блока.
export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!req.user) {
      throw new AppError('Unauthorized', 401)
    }

    res.status(200).json({
      success: true,
      user: req.user,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «updateUserProfile», необходимое для текущего логического блока.
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { fullName, username, bio, website } = req.body ?? {}

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!req.user) {
      throw new AppError('Unauthorized', 401)
    }

    // Хранит значение «user», необходимое для текущего логического блока.
    const user = await User.findById(req.user._id).select('-password')

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!user) {
      throw new AppError('User not found', 404)
    }

    // Хранит значение «nextUsername», необходимое для текущего логического блока.
    const nextUsername =
      typeof username === 'string' ? username.trim() : undefined

    // Хранит значение «nextFullName», необходимое для текущего логического блока.
    const nextFullName =
      typeof fullName === 'string' ? fullName.trim() : undefined

    // Хранит значение «nextBio», необходимое для текущего логического блока.
    const nextBio = typeof bio === 'string' ? bio.trim() : undefined

    // Хранит значение «nextWebsite», необходимое для текущего логического блока.
    const nextWebsite = typeof website === 'string' ? website.trim() : undefined

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (nextUsername !== undefined && !nextUsername) {
      throw new AppError('Username is required', 400)
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (nextFullName !== undefined) {
      user.fullName = nextFullName
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (nextUsername !== undefined && nextUsername !== user.username) {
      // Хранит значение «existingUser», необходимое для текущего логического блока.
      const existingUser = await User.findOne({
        username: nextUsername,
        _id: { $ne: user._id },
      })

      // Проверяет условие и выбирает дальнейший сценарий выполнения.
      if (existingUser) {
        throw new AppError('Username is already taken', 409)
      }

      user.username = nextUsername
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (nextBio !== undefined) {
      user.bio = nextBio
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (nextWebsite !== undefined) {
      user.website = nextWebsite
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (req.file) {
      // Хранит значение «extension», необходимое для текущего логического блока.
      const extension = req.file.originalname.split('.').pop() || 'jpg'

      // Хранит значение «key», необходимое для текущего логического блока.
      const key = `avatars/${crypto.randomUUID()}.${extension}`

      // Хранит значение «avatarUrl», необходимое для текущего логического блока.
      const avatarUrl = await uploadToS3(
        req.file.buffer,
        key,
        req.file.mimetype,
      )

      user.avatar = avatarUrl
    }

    // Хранит значение «updatedUser», необходимое для текущего логического блока.
    const updatedUser = await user.save()

    res.status(200).json({
      success: true,
      message: 'User has been successfully updated',
      user: updatedUser,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «searchUsers», необходимое для текущего логического блока.
export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { query } = req.query

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (typeof query !== 'string' || !query.trim()) {
      throw new AppError('Search query is required', 400)
    }

    // Хранит значение «users», необходимое для текущего логического блока.
    const users = await User.find({
      $or: [
        {
          username: {
            $regex: query,
            $options: 'i',
          },
        },
        {
          fullName: {
            $regex: query,
            $options: 'i',
          },
        },
      ],
    }).select('-password')

    res.status(200).json({
      success: true,
      users,
      count: users.length,
    })
  } catch (error) {
    next(error)
  }
}
