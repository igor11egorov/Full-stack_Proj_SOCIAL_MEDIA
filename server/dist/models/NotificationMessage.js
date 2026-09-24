// Описывает Mongoose-модель уведомления о сообщении.
import mongoose from 'mongoose';
const notificationMessageSchema = new mongoose.Schema({
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
    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
export const NotificationMessage = mongoose.model('NotificationMessage', notificationMessageSchema);
