// Определяет класс прикладной ошибки с HTTP-статусом и дополнительными данными.
// Основные части: экспортируемая логика и зависимости модуля.
export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode

    Object.setPrototypeOf(this, AppError.prototype)
  }
}
