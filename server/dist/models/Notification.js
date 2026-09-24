// Описывает Mongoose-модель пользовательского уведомления.
import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'follow'],
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    },
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscribe',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
export const Notification = mongoose.model('Notification', notificationSchema);
