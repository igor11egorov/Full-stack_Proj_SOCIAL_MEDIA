// Описывает Mongoose-модель пользователя, его профиль и данные авторизации.
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    bio: {
        type: String,
        default: '',
    },
    website: {
        type: String,
        default: '',
        trim: true,
    },
    avatar: {
        type: String,
        default: '',
    },
    passwordResetToken: {
        type: String,
    },
    passwordResetExpires: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false, // запрещаем создание поля __v
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});
export const User = mongoose.model('User', userSchema);
