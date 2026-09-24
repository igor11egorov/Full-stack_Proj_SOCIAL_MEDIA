// Обрабатывает HTTP-запросы для создания, чтения, обновления и удаления публикаций.
// Основные части: валидация входных данных, вызовы моделей и формирование HTTP-ответов.
import crypto from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import mongoose from 'mongoose'
import { uploadToS3 } from '../config/s3.js'
import { Post } from '../models/Post.js'
import { AppError } from '../utils/appError.js'

// Хранит значение «getPostImageFiles», необходимое для текущего логического блока.
const getPostImageFiles = (req: Request): Express.Multer.File[] => {
  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (Array.isArray(req.files)) {
    return req.files
  }

  // Хранит значение «files», необходимое для текущего логического блока.
  const files = req.files as
    | {
        images?: Express.Multer.File[]
        image?: Express.Multer.File[]
      }
    | undefined

  return [...(files?.images ?? []), ...(files?.image ?? [])]
}

// Хранит значение «parseExistingImages», необходимое для текущего логического блока.
const parseExistingImages = (value: unknown): string[] | undefined => {
  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (value === undefined) {
    return undefined
  }

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (Array.isArray(value)) {
    return value.filter((image): image is string => typeof image === 'string')
  }

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (typeof value !== 'string') {
    return []
  }

  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    // Хранит значение «parsed», необходимое для текущего логического блока.
    const parsed = JSON.parse(value)

    return Array.isArray(parsed)
      ? parsed.filter((image): image is string => typeof image === 'string')
      : []
  } catch {
    return [value]
  }
}

// Хранит значение «uploadPostImage», необходимое для текущего логического блока.
const uploadPostImage = async (file: Express.Multer.File): Promise<string> => {
  // Хранит значение «extension», необходимое для текущего логического блока.
  const extension = file.originalname.split('.').pop() || 'jpg'

  // Хранит значение «key», необходимое для текущего логического блока.
  const key = `posts/${crypto.randomUUID()}.${extension}`

  return uploadToS3(file.buffer, key, file.mimetype)
}

// Хранит значение «createPost», необходимое для текущего логического блока.
export const createPost = async (
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

    // Хранит значение «description», необходимое для текущего логического блока.
    const description = req.body?.description ?? ''

    // Хранит значение «files», необходимое для текущего логического блока.
    const files = getPostImageFiles(req)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!files || files.length === 0) {
      throw new AppError('At least one image is required', 400)
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (files.length > 10) {
      throw new AppError('Maximum 10 images allowed', 400)
    }

    // Хранит значение «imageUrls», необходимое для текущего логического блока.
    const imageUrls = await Promise.all(
      files.map((file) => uploadPostImage(file)),
    )

    // Хранит значение «post», необходимое для текущего логического блока.
    const post = await Post.create({
      author: req.user._id,
      description,
      images: imageUrls,
    })

    await post.populate('author', 'username fullName avatar')

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!post) {
      throw new AppError('Post is not created', 400)
    }

    res.status(201).json({
      success: true,
      post,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getPostById», необходимое для текущего логического блока.
export const getPostById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    const { id } = req.params

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid post id', 400)
    }

    // Хранит значение «post», необходимое для текущего логического блока.
    const post = await Post.findById(id).populate(
      'author',
      'username fullName avatar',
    )

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!post) {
      throw new AppError('Post is not found', 404)
    }

    res.status(200).json({
      success: true,
      post,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getUserPosts», необходимое для текущего логического блока.
export const getUserPosts = async (
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

    // Хранит значение «posts», необходимое для текущего логического блока.
    const posts = await Post.find({ author: userId })
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      posts,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getAllPosts», необходимое для текущего логического блока.
export const getAllPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    // Хранит значение «posts», необходимое для текущего логического блока.
    const posts = await Post.find()
      .populate('author', 'username fullName avatar')
      .sort({ updatedAt: -1 })

    res.status(200).json({
      success: true,
      posts,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «updatePost», необходимое для текущего логического блока.
export const updatePost = async (
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

    const { id } = req.params

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid post id', 400)
    }

    // Хранит значение «post», необходимое для текущего логического блока.
    const post = await Post.findById(id)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!post) {
      throw new AppError('Post is not found', 404)
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (post.author.toString() !== req.user._id.toString()) {
      throw new AppError('You are not allowed to update this post', 403)
    }

    const { description } = req.body ?? {}

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (description !== undefined) {
      post.description = description
    }

    // Хранит значение «files», необходимое для текущего логического блока.
    const files = getPostImageFiles(req)

    // Хранит значение «existingImages», необходимое для текущего логического блока.
    const existingImages = parseExistingImages(req.body?.existingImages)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (files.length > 0 || existingImages !== undefined) {
      // Хранит значение «currentImages», необходимое для текущего логического блока.
      const currentImages =
        post.images && post.images.length > 0
          ? post.images
          : post.image
            ? [post.image]
            : []

      // Хранит значение «retainedImages», необходимое для текущего логического блока.
      const retainedImages =
        existingImages?.filter((imageUrl) =>
          currentImages.includes(imageUrl),
        ) ?? currentImages

      // Хранит значение «imageUrls», необходимое для текущего логического блока.
      const imageUrls = await Promise.all(
        files.map((file) => uploadPostImage(file)),
      )

      // Хранит значение «nextImages», необходимое для текущего логического блока.
      const nextImages = [...retainedImages, ...imageUrls]

      // Проверяет условие и выбирает дальнейший сценарий выполнения.
      if (nextImages.length === 0) {
        throw new AppError('Post must have at least one image', 400)
      }

      // Проверяет условие и выбирает дальнейший сценарий выполнения.
      if (nextImages.length > 10) {
        throw new AppError('Maximum 10 images allowed', 400)
      }

      post.images = nextImages
      post.image = undefined
    }

    await post.save()

    await post.populate('author', 'username fullName avatar')

    res.status(200).json({
      success: true,
      post,
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «deletePost», необходимое для текущего логического блока.
export const deletePost = async (
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

    const { id } = req.params

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid post id', 400)
    }

    // Хранит значение «post», необходимое для текущего логического блока.
    const post = await Post.findById(id)

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!post) {
      throw new AppError('Post is not found', 404)
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (post.author.toString() !== req.user._id.toString()) {
      throw new AppError('You are not allowed to delete this post', 403)
    }

    await post.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}

// Хранит значение «getExplorePosts», необходимое для текущего логического блока.
export const getExplorePosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    // Хранит значение «posts», необходимое для текущего логического блока.
    const posts = await Post.aggregate([
      {
        $sample: {
          size: 200,
        },
      },
    ])

    await Post.populate(posts, {
      path: 'author',
      select: 'username fullName avatar',
    })

    res.status(200).json({
      success: true,
      posts,
      count: posts.length,
    })
  } catch (error) {
    next(error)
  }
}
