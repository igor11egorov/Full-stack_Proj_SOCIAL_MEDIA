import mongoose from 'mongoose';
import { Notification } from '../models/Notification.js';
import { AppError } from '../utils/appError.js';
export const getMyNotifications = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError('Unauthorized', 401);
        }
        const notifications = await Notification.find({
            recipient: req.user._id,
        })
            .populate('sender', 'username fullName avatar')
            .populate('post', 'description image images')
            .populate('comment', 'text')
            .populate('subscription')
            .sort({ createdAt: -1 });
        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            isRead: false,
        });
        res.status(200).json({
            success: true,
            notifications,
            count: notifications.length,
            unreadCount,
        });
    }
    catch (error) {
        next(error);
    }
};
export const markNotificationAsRead = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError('Unauthorized', 401);
        }
        const { notificationId } = req.params;
        if (typeof notificationId !== 'string' ||
            !mongoose.Types.ObjectId.isValid(notificationId)) {
            throw new AppError('Invalid notification id', 400);
        }
        const notification = await Notification.findOne({
            _id: notificationId,
            recipient: req.user._id,
        });
        if (!notification) {
            throw new AppError('Notification is not found', 404);
        }
        notification.isRead = true;
        await notification.save();
        res.status(200).json({
            success: true,
            notification,
        });
    }
    catch (error) {
        next(error);
    }
};
export const markAllNotificationsAsRead = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new AppError('Unauthorized', 401);
        }
        const result = await Notification.updateMany({
            recipient: req.user._id,
            isRead: false,
        }, {
            isRead: true,
        });
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount, //см ниже
        });
    }
    catch (error) {
        next(error);
    }
};
