// Обрабатывает HTTP-запросы для получения, создания и удаления комментариев к постам.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { Comment } from '../models/Comment.js'
import { CommentLike } from '../models/CommentLike.js'
import { Notification } from '../models/Notification.js'
import { Post } from '../models/Post.js'
import { AppError } from '../utils/appError.js'

// Хранит значение «addComment», необходимое для текущего логического блока.
export const addComment = async (
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

    const { text } = req.body
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (typeof text !== 'string' || !text.trim()) {
      throw new AppError('Text is required', 400)
    }

    // Хранит значение «comment», необходимое для текущего логического блока.
    const comment = await Comment.create({
      user: req.user._id,
      post: postId,
      text,
    })
    await comment.populate('user', 'username fullName avatar')
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: postId,
        comment: comment._id,
      })
    }

    res.status(201).json({
      success: true,
      comment,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getPostComments», необходимое для текущего логического блока.
export const getPostComments = async (
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

    // Хранит значение «comments», необходимое для текущего логического блока.
    const comments = await Comment.find({ post: postId })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 })

    // Хранит значение «count», необходимое для текущего логического блока.
    const count = await Comment.countDocuments({ post: postId })

    res.status(200).json({
      success: true,
      comments,
      count,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «deleteComment», необходимое для текущего логического блока.
export const deleteComment = async (
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

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (comment.user.toString() !== req.user._id.toString()) {
      throw new AppError('You are not allowed to delete this comment', 403)
    }

    // Хранит значение «post», необходимое для текущего логического блока.
    const post = await Post.findById(comment.post)

    await CommentLike.deleteMany({ comment: comment._id })
    await comment.deleteOne()

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (post) {
      await Notification.deleteOne({
        recipient: post.author,
        sender: req.user._id,
        type: 'comment',
        post: comment.post,
        comment: comment._id,
      })
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
