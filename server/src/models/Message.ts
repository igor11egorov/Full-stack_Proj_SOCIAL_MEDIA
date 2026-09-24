// Описывает Mongoose-модель личного сообщения между пользователями.
// Основные части: схема данных, ограничения полей и экспорт модели для MongoDB.
import mongoose, { Document, Model } from 'mongoose'

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId
  receiver: mongoose.Types.ObjectId
  text: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

// Хранит значение «messageSchema», необходимое для текущего логического блока.
const messageSchema = new mongoose.Schema<IMessage>(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
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

export const Message: Model<IMessage> = mongoose.model<IMessage>(
  'Message',
  messageSchema,
)
