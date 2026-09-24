// Описывает Mongoose-модель комментария и правила хранения его данных в MongoDB.
// Основные части: схема данных, ограничения полей и экспорт модели для MongoDB.
import mongoose, { Document, Model } from 'mongoose'

export interface IComment extends Document {
  user: mongoose.Types.ObjectId
  post: mongoose.Types.ObjectId
  text: string
  createdAt: Date
  updatedAt: Date
}

const commentSchema = new mongoose.Schema<IComment>(
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
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Comment: Model<IComment> = mongoose.model<IComment>(
  'Comment',
  commentSchema,
)
