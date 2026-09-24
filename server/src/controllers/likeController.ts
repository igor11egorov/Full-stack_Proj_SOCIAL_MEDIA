// Обрабатывает запросы на получение и переключение лайков публикаций.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { Like } from '../models/Like.js'
import { Notification } from '../models/Notification.js'
import { Post } from '../models/Post.js'
import { AppError } from '../utils/appError.js'

// Хранит значение «toggleLike», необходимое для текущего логического блока.
export const toggleLike = async (
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

    const { postId } = req.params
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (
      typeof postId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      throw new AppError('Invalid post id', 400)
    }

    // Хранит значение «post», необходимое для текущего логического блока.
    const post = await Post.findById(postId)
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!post) {
      throw new AppError('Post is not found', 404)
    }

    // Хранит значение «existingLike», необходимое для текущего логического блока.
    const existingLike = await Like.findOne({
      user: req.user._id,
      post: postId,
    })

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (existingLike) {
      await existingLike.deleteOne()

      await Notification.deleteOne({
        recipient: post.author,
        sender: req.user._id,
        type: 'like',
        post: postId,
      })

      return res.status(200).json({
        success: true,
        liked: false,
        message: 'Like removed',
      })
    }

    // Хранит значение «like», необходимое для текущего логического блока.
    const like = await Like.create({
      user: req.user._id,
      post: postId,
    })
    // if (post.author.toString() !== req.user._id.toString()) {
    //   await Notification.create({
    //     recipient: post.author,
    //     sender: req.user._id,
    //     type: 'like',
    //     post: postId,
    //   })
    // }

    return res.status(201).json({
      success: true,
      liked: true,
      like,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getPostLikes», необходимое для текущего логического блока.
export const getPostLikes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { postId } = req.params
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (
      typeof postId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      throw new AppError('Invalid post id', 400)
    }

    // Хранит значение «post», необходимое для текущего логического блока.
    const post = await Post.findById(postId)
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!post) {
      throw new AppError('Post is not found', 404)
    }

    // Хранит значение «likes», необходимое для текущего логического блока.
    const likes = await Like.find({ post: postId })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 })

    // Хранит значение «count», необходимое для текущего логического блока.
    const count = await Like.countDocuments({ post: postId })

    res.status(200).json({
      success: true,
      likes,
      count,
    })
  } catch (error) {
    next(error)
  }
}
