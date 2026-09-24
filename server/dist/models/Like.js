// Описывает Mongoose-модель лайка публикации и связь с пользователем и постом.
import mongoose from 'mongoose';
const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
    },
}, {
    timestamps: true,
    versionKey: false,
});
// { user, post } - уникальна - один пользователь может лайкнуть один пост только один раз
likeSchema.index({ user: 1, post: 1 }, { unique: true });
export const Like = mongoose.model('Like', likeSchema);
