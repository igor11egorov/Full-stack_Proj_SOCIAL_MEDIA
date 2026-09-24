// Обрабатывает запросы профилей пользователей, поиска и обновления личных данных.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import crypto from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { uploadToS3 } from '../config/s3.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/appError.js'

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params

    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid user id', 400)
    }

    const user = await User.findById(id).select('-password')

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

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
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

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { fullName, username, bio, website } = req.body ?? {}

    if (!req.user) {
      throw new AppError('Unauthorized', 401)
    }

    const user = await User.findById(req.user._id).select('-password')

    if (!user) {
      throw new AppError('User not found', 404)
    }

    const nextUsername =
      typeof username === 'string' ? username.trim() : undefined

    const nextFullName =
      typeof fullName === 'string' ? fullName.trim() : undefined

    const nextBio = typeof bio === 'string' ? bio.trim() : undefined

    const nextWebsite = typeof website === 'string' ? website.trim() : undefined

    if (nextUsername !== undefined && !nextUsername) {
      throw new AppError('Username is required', 400)
    }

    if (nextFullName !== undefined) {
      user.fullName = nextFullName
    }

    if (nextUsername !== undefined && nextUsername !== user.username) {
      const existingUser = await User.findOne({
        username: nextUsername,
        _id: { $ne: user._id },
      })

      if (existingUser) {
        throw new AppError('Username is already taken', 409)
      }

      user.username = nextUsername
    }

    if (nextBio !== undefined) {
      user.bio = nextBio
    }

    if (nextWebsite !== undefined) {
      user.website = nextWebsite
    }

    if (req.file) {
      const extension = req.file.originalname.split('.').pop() || 'jpg'

      const key = `avatars/${crypto.randomUUID()}.${extension}`

      const avatarUrl = await uploadToS3(
        req.file.buffer,
        key,
        req.file.mimetype,
      )

      user.avatar = avatarUrl
    }

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

export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query } = req.query

    if (typeof query !== 'string' || !query.trim()) {
      throw new AppError('Search query is required', 400)
    }

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
