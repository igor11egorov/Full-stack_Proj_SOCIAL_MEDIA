// Обрабатывает запросы на получение и пометку пользовательских уведомлений как прочитанных.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { Notification } from '../models/Notification.js'
import { AppError } from '../utils/appError.js'

// Хранит значение «getMyNotifications», необходимое для текущего логического блока.
export const getMyNotifications = async (
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

    // Хранит значение «notifications», необходимое для текущего логического блока.
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate('sender', 'username fullName avatar')
      .populate('post', 'description image images')
      .populate('comment', 'text')
      .populate('subscription')
      .sort({ createdAt: -1 })

    // Задаёт ограничение, используемое при проверке или отображении данных.
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    })

    res.status(200).json({
      success: true,
      notifications,
      count: notifications.length,
      unreadCount,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «markNotificationAsRead», необходимое для текущего логического блока.
export const markNotificationAsRead = async (
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

    const { notificationId } = req.params

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (
      typeof notificationId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(notificationId)
    ) {
      throw new AppError('Invalid notification id', 400)
    }

    // Хранит значение «notification», необходимое для текущего логического блока.
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user._id,
    })

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!notification) {
      throw new AppError('Notification is not found', 404)
    }

    notification.isRead = true
    await notification.save()

    res.status(200).json({
      success: true,
      notification,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «markAllNotificationsAsRead», необходимое для текущего логического блока.
export const markAllNotificationsAsRead = async (
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

    // Хранит значение «result», необходимое для текущего логического блока.
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        isRead: true,
      },
    )

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount, //см ниже
    })
  } catch (error) {
    next(error)
  }
}
