// Описывает Mongoose-модель лайка комментария и связь с пользователем и комментарием.
import mongoose from 'mongoose';
const commentLikeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
commentLikeSchema.index({ user: 1, comment: 1 }, { unique: true });
export const CommentLike = mongoose.model('CommentLike', commentLikeSchema);
