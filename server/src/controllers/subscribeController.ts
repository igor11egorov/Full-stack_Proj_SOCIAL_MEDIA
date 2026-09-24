// Обрабатывает запросы подписки, отписки и получения данных о связях пользователей.
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { Notification } from '../models/Notification.js'
import { Subscribe } from '../models/Subscribe.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/appError.js'

export const subscribeToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401)
    }

    const { userId } = req.params
    if (
      typeof userId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new AppError('Invalid user id', 400)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User is not found', 404)
    }

    if (userId === req.user._id.toString()) {
      throw new AppError('You cannot subscribe to yourself', 400)
    }

    const existingSubscribe = await Subscribe.findOne({
      follower: req.user._id,
      following: userId,
    })

    if (existingSubscribe) {
      throw new AppError('You are already subscribed to this user', 400)
    }

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

export const unsubscribeFromUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401)
    }

    const { userId } = req.params
    if (
      typeof userId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new AppError('Invalid user id', 400)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User is not found', 404)
    }

    if (userId === req.user._id.toString()) {
      throw new AppError('You cannot unsubscribe to yourself', 400)
    }

    const existingSubscribe = await Subscribe.findOne({
      follower: req.user._id,
      following: userId,
    })

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

export const getUserFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params
    if (
      typeof userId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new AppError('Invalid user id', 400)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User is not found', 404)
    }

    const followers = await Subscribe.find({ following: userId })
      .populate('follower', 'username fullName avatar')
      .sort({ createdAt: -1 })

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

export const getUserFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = req.params
    if (
      typeof userId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      throw new AppError('Invalid user id', 400)
    }

    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User is not found', 404)
    }

    const following = await Subscribe.find({ follower: userId })
      .populate('following', 'username fullName avatar')
      .sort({ createdAt: -1 })

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
