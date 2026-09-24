// Загружает и проверяет переменные окружения, используемые серверным приложением.
import dotenv from 'dotenv'

dotenv.config()

const requiredEnv = (name: string): string => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not defined in .env`)
  }

  return value
}

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
