// Преобразует ошибки API и обычные ошибки JavaScript в понятное текстовое сообщение
// с запасным вариантом, если подробности ошибки недоступны.
import axios from 'axios'

type ApiErrorResponse = {
  message?: string
  error?: string
}

// Возвращает вычисленные данные: ErrorMessage.
export const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message || error.response?.data?.error || fallback
    )
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
