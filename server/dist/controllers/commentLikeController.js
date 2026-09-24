import mongoose from 'mongoose';
import { Comment } from '../models/Comment.js';
import { CommentLike } from '../models/CommentLike.js';
import { AppError } from '../utils/appError.js';
export const toggleCommentLike = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError('Unauthorized', 401);
        }
        const { commentId } = req.params;
        if (typeof commentId !== 'string' ||
            !mongoose.Types.ObjectId.isValid(commentId)) {
            throw new AppError('Invalid comment id', 400);
        }
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new AppError('Comment is not found', 404);
        }
        const existingLike = await CommentLike.findOne({
            user: req.user._id,
            comment: commentId,
        });
        if (existingLike) {
            await existingLike.deleteOne();
            const count = await CommentLike.countDocuments({ comment: commentId });
            return res.status(200).json({
                success: true,
                liked: false,
                count,
                message: 'Comment like removed',
            });
        }
        const like = await CommentLike.create({
            user: req.user._id,
            comment: commentId,
        });
        await like.populate('user', 'username fullName avatar');
        const count = await CommentLike.countDocuments({ comment: commentId });
        return res.status(201).json({
            success: true,
            liked: true,
            like,
            count,
        });
    }
    catch (error) {
        next(error);
    }
};
export const getCommentLikes = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        if (typeof commentId !== 'string' ||
            !mongoose.Types.ObjectId.isValid(commentId)) {
            throw new AppError('Invalid comment id', 400);
        }
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new AppError('Comment is not found', 404);
        }
        const likes = await CommentLike.find({ comment: commentId })
            .populate('user', 'username fullName avatar')
            .sort({ createdAt: -1 });
        const count = await CommentLike.countDocuments({ comment: commentId });
        res.status(200).json({
            success: true,
            likes,
            count,
        });
    }
    catch (error) {
        next(error);
    }
};
