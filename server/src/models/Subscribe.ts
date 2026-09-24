// Описывает Mongoose-модель подписки между двумя пользователями.
// Основные части: схема данных, ограничения полей и экспорт модели для MongoDB.
import mongoose, { Document, Model } from 'mongoose'

export interface ISubscribe extends Document {
  follower: mongoose.Types.ObjectId
  following: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

// Хранит значение «subscribeSchema», необходимое для текущего логического блока.
const subscribeSchema = new mongoose.Schema<ISubscribe>(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)
// один пользователь подписывается на другого одни раз
subscribeSchema.index({ follower: 1, following: 1 }, { unique: true })

export const Subscribe: Model<ISubscribe> = mongoose.model<ISubscribe>(
  'Subscribe',
  subscribeSchema,
)
