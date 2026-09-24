// Описывает Mongoose-модель уведомления о сообщении.
import mongoose, { Document, Model } from 'mongoose'

export interface INotificationMessage extends Document {
  recipient: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  message: mongoose.Types.ObjectId
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationMessageSchema = new mongoose.Schema<INotificationMessage>(
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
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      required: true,
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

export const NotificationMessage: Model<INotificationMessage> =
  mongoose.model<INotificationMessage>(
    'NotificationMessage',
    notificationMessageSchema,
  )
