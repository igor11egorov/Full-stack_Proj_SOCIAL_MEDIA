// Обрабатывает запросы подписки, отписки и получения данных о связях пользователей.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { Notification } from '../models/Notification.js'
import { Subscribe } from '../models/Subscribe.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/appError.js'

// Хранит значение «subscribeToUser», необходимое для текущего логического блока.
export const subscribeToUser = async (
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

    const { userId } = req.params
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (
      typeof userId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new AppError('Invalid user id', 400)
    }

    // Хранит значение «user», необходимое для текущего логического блока.
    const user = await User.findById(userId)
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!user) {
      throw new AppError('User is not found', 404)
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (userId === req.user._id.toString()) {
      throw new AppError('You cannot subscribe to yourself', 400)
    }

    // Хранит значение «existingSubscribe», необходимое для текущего логического блока.
    const existingSubscribe = await Subscribe.findOne({
      follower: req.user._id,
      following: userId,
    })

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (existingSubscribe) {
      throw new AppError('You are already subscribed to this user', 400)
    }

    // Хранит значение «subscribe», необходимое для текущего логического блока.
    const subscribe = await Subscribe.create({
      follower: req.user._id,
      following: userId,
    })

    await Notification.create({
      recipient: userId,
      sender: req.user._id,
      type: 'follow',
      subscription: subscribe._id,
    })

    res.status(201).json({
      success: true,
      subscribe,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «unsubscribeFromUser», необходимое для текущего логического блока.
export const unsubscribeFromUser = async (
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

    const { userId } = req.params
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (
      typeof userId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new AppError('Invalid user id', 400)
    }

    // Хранит значение «user», необходимое для текущего логического блока.
    const user = await User.findById(userId)
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!user) {
      throw new AppError('User is not found', 404)
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (userId === req.user._id.toString()) {
      throw new AppError('You cannot unsubscribe to yourself', 400)
    }

    // Хранит значение «existingSubscribe», необходимое для текущего логического блока.
    const existingSubscribe = await Subscribe.findOne({
      follower: req.user._id,
      following: userId,
    })

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!existingSubscribe) {
      throw new AppError('Subscription is not found', 404)
    }

    await Notification.deleteOne({
      recipient: userId,
      sender: req.user._id,
      type: 'follow',
      subscription: existingSubscribe._id,
    })
    await existingSubscribe.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Unsubscribed successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getUserFollowers», необходимое для текущего логического блока.
export const getUserFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { userId } = req.params
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (
      typeof userId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new AppError('Invalid user id', 400)
    }

    // Хранит значение «user», необходимое для текущего логического блока.
    const user = await User.findById(userId)
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!user) {
      throw new AppError('User is not found', 404)
    }

    // Хранит значение «followers», необходимое для текущего логического блока.
    const followers = await Subscribe.find({ following: userId })
      .populate('follower', 'username fullName avatar')
      .sort({ createdAt: -1 })

    // Хранит значение «count», необходимое для текущего логического блока.
    const count = await Subscribe.countDocuments({ following: userId })

    res.status(200).json({
      success: true,
      followers,
      count,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getUserFollowing», необходимое для текущего логического блока.
export const getUserFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { userId } = req.params
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (
      typeof userId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new AppError('Invalid user id', 400)
    }

    // Хранит значение «user», необходимое для текущего логического блока.
    const user = await User.findById(userId)
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!user) {
      throw new AppError('User is not found', 404)
    }

    // Хранит значение «following», необходимое для текущего логического блока.
    const following = await Subscribe.find({ follower: userId })
      .populate('following', 'username fullName avatar')
      .sort({ createdAt: -1 })

    // Хранит значение «count», необходимое для текущего логического блока.
    const count = await Subscribe.countDocuments({ follower: userId })

    res.status(200).json({
      success: true,
      following,
      count,
    })
  } catch (error) {
    next(error)
  }
}
