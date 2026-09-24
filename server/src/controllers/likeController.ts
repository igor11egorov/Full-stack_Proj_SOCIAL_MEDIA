// Обрабатывает запросы на получение и переключение лайков публикаций.
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { Like } from '../models/Like.js'
import { Notification } from '../models/Notification.js'
import { Post } from '../models/Post.js'
import { AppError } from '../utils/appError.js'

export const toggleLike = async (
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

    const existingLike = await Like.findOne({
      user: req.user._id,
      post: postId,
    })

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

export const getPostLikes = async (
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

    const likes = await Like.find({ post: postId })
      .populate('user', 'username fullName avatar')
      .sort({ createdAt: -1 })

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
