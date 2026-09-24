// Определяет класс прикладной ошибки с HTTP-статусом и дополнительными данными.
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
