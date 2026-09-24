// Описывает Mongoose-модель публикации, включая автора, текст и изображения.
import mongoose from 'mongoose';
const postSchema = new mongoose.Schema({
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
            validator: (images) => images === undefined || images.length <= 10,
            message: 'Post must have maximum 10 images',
        },
    },
}, {
    timestamps: true,
    versionKey: false,
});
postSchema.index({ createdAt: -1 });
export const Post = mongoose.model('Post', postSchema);
