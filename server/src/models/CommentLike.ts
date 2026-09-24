// Описывает Mongoose-модель лайка комментария и связь с пользователем и комментарием.
import mongoose, { Document, Model } from 'mongoose'

export interface ICommentLike extends Document {
  user: mongoose.Types.ObjectId
  comment: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const commentLikeSchema = new mongoose.Schema<ICommentLike>(
  {
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

commentLikeSchema.index({ user: 1, comment: 1 }, { unique: true })

export const CommentLike: Model<ICommentLike> = mongoose.model<ICommentLike>(
  'CommentLike',
  commentLikeSchema,
)
