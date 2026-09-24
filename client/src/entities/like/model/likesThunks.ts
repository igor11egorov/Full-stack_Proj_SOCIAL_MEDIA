// Содержит асинхронные Redux-запросы к API лайков публикаций:
// загрузку списка лайков и переключение отметки «нравится».
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { Like } from '../types/like'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

// Задаёт базовый адрес API, используемый запросами этого модуля.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type LikesResponse = {
  success: boolean
  likes: Like[]
  count: number
}

type ToggleLikeResponse = {
  success: boolean
  liked: boolean
  like?: Like
  message?: string
}

// Возвращает вычисленные данные: AuthHeaders.
const getAuthHeaders = () => {
  // Хранит значение «token», необходимое для текущего логического блока.
  const token = localStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// GET /api/likes/:postId
export const fetchPostLikes = createAsyncThunk(
  'likes/fetchPostLikes',
  async (postId: string, { rejectWithValue }) => {
    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
      const response = await axios.get<LikesResponse>(
        `${API_URL}/api/likes/${postId}`,
      )

      return {
        postId,
        likes: response.data.likes,
        count: response.data.count,
      }
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load likes'))
    }
  },
)

// POST /api/likes/:postId
export const togglePostLike = createAsyncThunk(
  'likes/togglePostLike',
  async (postId: string, { rejectWithValue }) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!postId) {
      return rejectWithValue('Post id is required')
    }

    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
      const response = await axios.post<ToggleLikeResponse>(
        `${API_URL}/api/likes/${postId}`,
        {},
        { headers: getAuthHeaders() },
      )

      return {
        postId,
        liked: response.data.liked,
        like: response.data.like,
      }
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to toggle like'))
    }
  },
)
