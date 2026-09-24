// Устанавливает подключение серверного приложения к базе данных MongoDB.
import mongoose from 'mongoose';
import { env } from '../config/env.js';
export const connectDB = async () => {
    if (!env.mongoUrl) {
        throw new Error('MONGO_URL is not defined in .env');
    }
    try {
        await mongoose.connect(env.mongoUrl);
        console.log('MongoDB connected');
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('MongoDB connection error:', message);
        process.exit(1); // Завершить Node.js-процесс с кодом ошибки 1.
    }
};
