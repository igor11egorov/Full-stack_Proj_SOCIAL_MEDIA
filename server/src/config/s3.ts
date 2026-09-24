// Настраивает клиент AWS S3 для хранения и получения загружаемых файлов.
// Основные части: экспортируемая логика и зависимости модуля.
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { env } from './env.js'

// Хранит значение «s3», необходимое для текущего логического блока.
const s3 = new S3Client({
  region: env.awsRegion,
  credentials: {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
  },
})

// Хранит значение «uploadToS3», необходимое для текущего логического блока.
export const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> => {
  // Хранит значение «command», необходимое для текущего логического блока.
  const command = new PutObjectCommand({
    Bucket: env.awsBucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })

  await s3.send(command)

  return `https://${env.awsBucketName}.s3.${env.awsRegion}.amazonaws.com/${key}`
}
