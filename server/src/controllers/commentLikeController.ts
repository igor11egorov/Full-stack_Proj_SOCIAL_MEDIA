// Обрабатывает запросы на просмотр и переключение лайков комментариев.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { Comment } from '../models/Comment.js'
import { CommentLike } from '../models/CommentLike.js'
import { AppError } from '../utils/appError.js'

// Хранит значение «toggleCommentLike», необходимое для текущего логического блока.
export const toggleCommentLike = async (
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

    const { commentId } = req.params

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (
      typeof commentId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      throw new AppError('Invalid comment id', 400)
    }

    // Хранит значение «comment», необходимое для текущего логического блока.
    const comment = await Comment.findById(commentId)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!comment) {
      throw new AppError('Comment is not found', 404)
    }

    // Хранит значение «existingLike», необходимое для текущего логического блока.
    const existingLike = await CommentLike.findOne({
      user: req.user._id,
      comment: commentId,
    })

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (existingLike) {
      await existingLike.deleteOne()

      // Хранит значение «count», необходимое для текущего логического блока.
      const count = await CommentLike.countDocuments({ comment: commentId })

      return res.status(200).json({
        success: true,
        liked: false,
        count,
        message: 'Comment like removed',
      })
    }

    // Хранит значение «like», необходимое для текущего логического блока.
    const like = await CommentLike.create({
      user: req.user._id,
      comment: commentId,
    })

    await like.populate('user', 'username fullName avatar')

    // Хранит значение «count», необходимое для текущего логического блока.
    const count = await CommentLike.countDocuments({ comment: commentId })

    return res.status(201).json({
      success: true,
      liked: true,
      like,
      count,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getCommentLikes», необходимое для текущего логического блока.
export const getCommentLikes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { commentId } = req.params

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (
      typeof commentId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      throw new AppError('Invalid comment id', 400)
    }

    // Хранит значение «comment», необходимое для текущего логического блока.
    const comment = await Comment.findById(commentId)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!comment) {
      throw new AppError('Comment is not found', 404)
    }

    // Хранит значение «likes», необходимое для текущего логического блока.
    const likes = await CommentLike.find({ comment: commentId })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 })

    // Хранит значение «count», необходимое для текущего логического блока.
    const count = await CommentLike.countDocuments({ comment: commentId })

    res.status(200).json({
      success: true,
      likes,
      count,
    })
  } catch (error) {
    next(error)
  }
}
