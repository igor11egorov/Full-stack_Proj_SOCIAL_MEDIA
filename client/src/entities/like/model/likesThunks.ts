// Содержит асинхронные Redux-запросы к API лайков публикаций:
// загрузку списка лайков и переключение отметки «нравится».
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { Like } from '../types/like'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

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
  const token = localStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// GET /api/likes/:postId
export const fetchPostLikes = createAsyncThunk(
  'likes/fetchPostLikes',
  async (postId: string, { rejectWithValue }) => {
    try {
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
    if (!postId) {
      return rejectWithValue('Post id is required')
    }

    try {
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
