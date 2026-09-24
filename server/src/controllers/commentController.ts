// Обрабатывает HTTP-запросы для получения, создания и удаления комментариев к постам.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { Comment } from '../models/Comment.js'
import { CommentLike } from '../models/CommentLike.js'
import { Notification } from '../models/Notification.js'
import { Post } from '../models/Post.js'
import { AppError } from '../utils/appError.js'

export const addComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401)
    }

    const { postId } = req.params
    if (
      typeof postId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      throw new AppError('Invalid post id', 400)
    }

    const post = await Post.findById(postId)

    if (!post) {
      throw new AppError('Post is not found', 404)
    }

    const { text } = req.body
    if (typeof text !== 'string' || !text.trim()) {
      throw new AppError('Text is required', 400)
    }

    const comment = await Comment.create({
      user: req.user._id,
      post: postId,
      text,
    })
    await comment.populate('user', 'username fullName avatar')
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

export const getPostComments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { postId } = req.params
    if (
      typeof postId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(postId)
    ) {
      throw new AppError('Invalid post id', 400)
    }

    const post = await Post.findById(postId)
    if (!post) {
      throw new AppError('Post is not found', 404)
    }

    const comments = await Comment.find({ post: postId })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 })

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

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401)
    }

    const { commentId } = req.params

    if (
      typeof commentId !== 'string' ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      throw new AppError('Invalid comment id', 400)
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
      throw new AppError('Comment is not found', 404)
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      throw new AppError('You are not allowed to delete this comment', 403)
    }

    const post = await Post.findById(comment.post)

    await CommentLike.deleteMany({ comment: comment._id })
    await comment.deleteOne()

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
