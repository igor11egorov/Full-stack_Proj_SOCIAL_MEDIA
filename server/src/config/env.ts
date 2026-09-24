// Загружает и проверяет переменные окружения, используемые серверным приложением.
// Основные части: экспортируемая логика и зависимости модуля.
import dotenv from 'dotenv'

dotenv.config()

// Хранит значение «requiredEnv», необходимое для текущего логического блока.
const requiredEnv = (name: string): string => {
  // Хранит значение «value», необходимое для текущего логического блока.
  const value = process.env[name]

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (!value) {
    throw new Error(`${name} is not defined in .env`)
  }

  return value
}

// Хранит значение «env», необходимое для текущего логического блока.
export const env = {
  port: Number(process.env.PORT) || 3000,
  mongoUrl: process.env.MONGO_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development',

  jwtSecret: requiredEnv('JWT_SECRET'),

  awsRegion: requiredEnv('AWS_REGION'),
  awsAccessKeyId: requiredEnv('AWS_ACCESS_KEY_ID'),
  awsSecretAccessKey: requiredEnv('AWS_SECRET_ACCESS_KEY'),
  awsBucketName: requiredEnv('AWS_S3_BUCKET'),

  clientUrl: requiredEnv('CLIENT_URL'),
}
