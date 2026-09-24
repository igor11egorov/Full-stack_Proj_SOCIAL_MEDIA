// Содержит асинхронные Redux-запросы к API лайков комментариев:
// загрузку отметок и добавление или удаление лайка текущего пользователя.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { User } from '../../user/types/user'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export type CommentLike = {
  _id: string
  user: User
  comment: string
  createdAt: string
  updatedAt: string
}

type CommentLikesResponse = {
  success: boolean
  likes: CommentLike[]
  count: number
}

type ToggleCommentLikeResponse = {
  success: boolean
  liked: boolean
  like?: CommentLike
  count: number
  message?: string
}

// Возвращает вычисленные данные: AuthHeaders.
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// GET /api/comments/likes/:commentId
export const fetchCommentLikes = createAsyncThunk(
  'commentLikes/fetchCommentLikes',
  async (commentId: string, { rejectWithValue }) => {
    if (!commentId) {
      return rejectWithValue('Comment id is required')
    }

    try {
      const response = await axios.get<CommentLikesResponse>(
        `${API_URL}/api/comments/likes/${commentId}`,
      )

      return {
        commentId,
        likes: response.data.likes,
        count: response.data.count,
      }
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to load comment likes'),
      )
    }
  },
)

// POST /api/comments/likes/:commentId
export const toggleCommentLike = createAsyncThunk(
  'commentLikes/toggleCommentLike',
  async (commentId: string, { rejectWithValue }) => {
    if (!commentId) {
      return rejectWithValue('Comment id is required')
    }

    try {
      const response = await axios.post<ToggleCommentLikeResponse>(
        `${API_URL}/api/comments/likes/${commentId}`,
        {},
        { headers: getAuthHeaders() },
      )

      return {
        commentId,
        liked: response.data.liked,
        like: response.data.like,
        count: response.data.count,
      }
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to toggle comment like'),
      )
    }
  },
)
