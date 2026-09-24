// Описывает Mongoose-модель лайка публикации и связь с пользователем и постом.
// Основные части: схема данных, ограничения полей и экспорт модели для MongoDB.
import mongoose, { Document, Model } from 'mongoose'

export interface ILike extends Document {
  user: mongoose.Types.ObjectId
  post: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const likeSchema = new mongoose.Schema<ILike>(
  {
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// { user, post } - уникальна - один пользователь может лайкнуть один пост только один раз
likeSchema.index({ user: 1, post: 1 }, { unique: true })
export const Like: Model<ILike> = mongoose.model<ILike>('Like', likeSchema)
