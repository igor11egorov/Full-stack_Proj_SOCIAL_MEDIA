// Устанавливает подключение серверного приложения к базе данных MongoDB.
// Основные части: экспортируемая логика и зависимости модуля.
import mongoose from 'mongoose'
import { env } from '../config/env.js'

// Хранит значение «connectDB», необходимое для текущего логического блока.
export const connectDB = async (): Promise<void> => {
  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (!env.mongoUrl) {
    throw new Error('MONGO_URL is not defined in .env')
  }

  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    await mongoose.connect(env.mongoUrl)
    console.log('MongoDB connected')
  } catch (error) {
    // Хранит значение «message», необходимое для текущего логического блока.
    const message = error instanceof Error ? error.message : 'Unknown error'

    console.error('MongoDB connection error:', message)
    process.exit(1) // Завершить Node.js-процесс с кодом ошибки 1.
  }
}
