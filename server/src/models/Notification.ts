// Описывает Mongoose-модель пользовательского уведомления.
// Основные части: схема данных, ограничения полей и экспорт модели для MongoDB.
import mongoose, { Document, Model } from 'mongoose'

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  type: 'like' | 'comment' | 'follow'
  post?: mongoose.Types.ObjectId
  comment?: mongoose.Types.ObjectId
  subscription?: mongoose.Types.ObjectId
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

// Хранит значение «notificationSchema», необходимое для текущего логического блока.
const notificationSchema = new mongoose.Schema<INotification>(
  {
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
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export const Notification: Model<INotification> = mongoose.model<INotification>(
  'Notification',
  notificationSchema,
)
