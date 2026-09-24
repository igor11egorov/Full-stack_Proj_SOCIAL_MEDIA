// Содержит асинхронный Redux-запрос поиска пользователей по строке запроса
// и преобразует ошибки API в сообщение для интерфейса.
// Основные части: логика пользовательского сценария и запросы к API.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { User } from '../../../entities/user/types/user'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

// Задаёт базовый адрес API, используемый запросами этого модуля.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type SearchUsersResponse = {
  success: boolean
  users: User[]
  count: number
}

// GET /api/users/search?query=...
export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async (query: string, { rejectWithValue }) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!query.trim()) {
      return {
        users: [],
        count: 0,
      }
    }

    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
      const response = await axios.get<SearchUsersResponse>(
        `${API_URL}/api/users/search`,
        {
          // Это способ axios добавить query-параметр в URL
          params: {
            query: query.trim(),
          },
        },
      )

      return {
        users: response.data.users,
        count: response.data.count,
      }
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to search users'))
    }
  },
)
