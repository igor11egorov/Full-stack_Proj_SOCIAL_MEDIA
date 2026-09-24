// Преобразует ошибки API и обычные ошибки JavaScript в понятное текстовое сообщение
// с запасным вариантом, если подробности ошибки недоступны.
// Основные части: переиспользуемая логика без привязки к сценарию.
import axios from 'axios'

type ApiErrorResponse = {
  message?: string
  error?: string
}

// Возвращает вычисленные данные: ErrorMessage.
export const getErrorMessage = (error: unknown, fallback: string) => {
  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message || error.response?.data?.error || fallback
    )
  }

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
