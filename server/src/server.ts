// Запускает HTTP-сервер и подключает настроенное Express-приложение.
// Основные части: экспортируемая логика и зависимости модуля.
import http from 'http'
import app from './app.js'
import { env } from './config/env.js'
import { connectDB } from './db/db.js'

// Хранит значение «startServer», необходимое для текущего логического блока.
const startServer = async (): Promise<void> => {
  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    await connectDB()

    // Хранит значение «server», необходимое для текущего логического блока.
    const server = http.createServer(app)

    server.listen(env.port, () => {
      console.log(`Server is running on http://localhost:${env.port}`)
    })
  } catch (error) {
    // Хранит значение «message», необходимое для текущего логического блока.
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to start server:', message)
    process.exit(1)
  }
}
startServer()
export default app
