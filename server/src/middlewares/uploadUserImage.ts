// Настраивает загрузку изображений пользователей и передачу файлов в обработчики запросов.
// Основные части: обработка запроса до контроллера или единый формат ошибки.
import multer from 'multer'

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
})
