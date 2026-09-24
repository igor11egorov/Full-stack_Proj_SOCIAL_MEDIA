// Обрабатывает HTTP-запросы для создания, чтения, обновления и удаления публикаций.
import crypto from 'crypto';
import mongoose from 'mongoose';
import { uploadToS3 } from '../config/s3.js';
import { Post } from '../models/Post.js';
import { AppError } from '../utils/appError.js';
const getPostImageFiles = (req) => {
    if (Array.isArray(req.files)) {
        return req.files;
    }
    const files = req.files;
    return [...(files?.images ?? []), ...(files?.image ?? [])];
};
const parseExistingImages = (value) => {
    if (value === undefined) {
        return undefined;
    }
    if (Array.isArray(value)) {
        return value.filter((image) => typeof image === 'string');
    }
    if (typeof value !== 'string') {
        return [];
    }
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
            ? parsed.filter((image) => typeof image === 'string')
            : [];
    }
    catch {
        return [value];
    }
};
const uploadPostImage = async (file) => {
    const extension = file.originalname.split('.').pop() || 'jpg';
    const key = `posts/${crypto.randomUUID()}.${extension}`;
    return uploadToS3(file.buffer, key, file.mimetype);
};
export const createPost = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError('Unauthorized', 401);
        }
        const description = req.body?.description ?? '';
        const files = getPostImageFiles(req);
        if (!files || files.length === 0) {
            throw new AppError('At least one image is required', 400);
        }
        if (files.length > 10) {
            throw new AppError('Maximum 10 images allowed', 400);
        }
        const imageUrls = await Promise.all(files.map((file) => uploadPostImage(file)));
        const post = await Post.create({
            author: req.user._id,
            description,
            images: imageUrls,
        });
        await post.populate('author', 'username fullName avatar');
        if (!post) {
            throw new AppError('Post is not created', 400);
        }
        res.status(201).json({
            success: true,
            post,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getPostById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid post id', 400);
        }
        const post = await Post.findById(id).populate('author', 'username fullName avatar');
        if (!post) {
            throw new AppError('Post is not found', 404);
        }
        res.status(200).json({
            success: true,
            post,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getUserPosts = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (typeof userId !== 'string' ||
            !mongoose.Types.ObjectId.isValid(userId)) {
            throw new AppError('Invalid user id', 400);
        }
        const posts = await Post.find({ author: userId })
            .populate('author', 'username fullName avatar')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            posts,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getAllPosts = async (req, res, next) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username fullName avatar')
            .sort({ updatedAt: -1 });
        res.status(200).json({
            success: true,
            posts,
        });
    }
    catch (error) {
        next(error);
    }
};
export const updatePost = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError('Unauthorized', 401);
        }
        const { id } = req.params;
        if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid post id', 400);
        }
        const post = await Post.findById(id);
        if (!post) {
            throw new AppError('Post is not found', 404);
        }
        if (post.author.toString() !== req.user._id.toString()) {
            throw new AppError('You are not allowed to update this post', 403);
        }
        const { description } = req.body ?? {};
        if (description !== undefined) {
            post.description = description;
        }
        const files = getPostImageFiles(req);
        const existingImages = parseExistingImages(req.body?.existingImages);
        if (files.length > 0 || existingImages !== undefined) {
            const currentImages = post.images && post.images.length > 0
                ? post.images
                : post.image
                    ? [post.image]
                    : [];
            const retainedImages = existingImages?.filter((imageUrl) => currentImages.includes(imageUrl)) ?? currentImages;
            const imageUrls = await Promise.all(files.map((file) => uploadPostImage(file)));
            const nextImages = [...retainedImages, ...imageUrls];
            if (nextImages.length === 0) {
                throw new AppError('Post must have at least one image', 400);
            }
            if (nextImages.length > 10) {
                throw new AppError('Maximum 10 images allowed', 400);
            }
            post.images = nextImages;
            post.image = undefined;
        }
        await post.save();
        await post.populate('author', 'username fullName avatar');
        res.status(200).json({
            success: true,
            post,
        });
    }
    catch (error) {
        next(error);
    }
};
export const deletePost = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError('Unauthorized', 401);
        }
        const { id } = req.params;
        if (typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError('Invalid post id', 400);
        }
        const post = await Post.findById(id);
        if (!post) {
            throw new AppError('Post is not found', 404);
        }
        if (post.author.toString() !== req.user._id.toString()) {
            throw new AppError('You are not allowed to delete this post', 403);
        }
        await post.deleteOne();
        res.status(200).json({
            success: true,
            message: 'Post deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
export const getExplorePosts = async (req, res, next) => {
    try {
        const posts = await Post.aggregate([
            {
                $sample: {
                    size: 200,
                },
            },
        ]);
        await Post.populate(posts, {
            path: 'author',
            select: 'username fullName avatar',
        });
        res.status(200).json({
            success: true,
            posts,
            count: posts.length,
        });
    }
    catch (error) {
        next(error);
    }
};
