// Настраивает клиент AWS S3 для хранения и получения загружаемых файлов.
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { env } from './env.js'

const s3 = new S3Client({
  region: env.awsRegion,
  credentials: {
    accessKeyId: env.awsAccessKeyId,
    secretAccessKey: env.awsSecretAccessKey,
  },
})

export const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: env.awsBucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  })

  await s3.send(command)

  return `https://${env.awsBucketName}.s3.${env.awsRegion}.amazonaws.com/${key}`
}
