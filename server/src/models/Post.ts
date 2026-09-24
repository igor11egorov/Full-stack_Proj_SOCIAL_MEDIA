// Описывает Mongoose-модель публикации, включая автора, текст и изображения.
import mongoose, { Document, Model } from 'mongoose'

export interface IPost extends Document {
  author: mongoose.Types.ObjectId
  description?: string
  image?: string
  images?: string[]
  createdAt: Date
  updatedAt: Date
}

const postSchema = new mongoose.Schema<IPost>(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      required: false,
    },
    images: {
      type: [String],
      required: false,
      validate: {
        validator: (images: string[]) =>
          images === undefined || images.length <= 10,
        message: 'Post must have maximum 10 images',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

postSchema.index({ createdAt: -1 })

export const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema)
