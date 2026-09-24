// Содержит асинхронные Redux-запросы к API комментариев: загрузку, добавление
// и удаление комментариев к выбранной публикации.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { Comment } from '../types/comment'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

// Задаёт базовый адрес API, используемый запросами этого модуля.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type CommentsResponse = {
  success: boolean
  comments: Comment[]
  count: number
}

type AddCommentResponse = {
  success: boolean
  comment: Comment
}

type AddCommentPayload = {
  postId: string
  text: string
}

type DeleteCommentPayload = {
  postId: string
  commentId: string
}

// Возвращает вычисленные данные: AuthHeaders.
const getAuthHeaders = () => {
  // Хранит значение «token», необходимое для текущего логического блока.
  const token = localStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// GET /api/comments/:postId
export const fetchPostComments = createAsyncThunk(
  'comments/fetchPostComments',
  async (postId: string, { rejectWithValue }) => {
    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
      const response = await axios.get<CommentsResponse>(
        `${API_URL}/api/comments/${postId}`,
      )

      return {
        postId,
        comments: response.data.comments,
        count: response.data.count,
      }
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load comments'))
    }
  },
)

// POST /api/comments/:postId
export const addPostComment = createAsyncThunk(
  'comments/addPostComment',
  async ({ postId, text }: AddCommentPayload, { rejectWithValue }) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!postId) {
      return rejectWithValue('Post id is required')
    }

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!text.trim()) {
      return rejectWithValue('Comment text is required')
    }

    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
      const response = await axios.post<AddCommentResponse>(
        `${API_URL}/api/comments/${postId}`,
        { text: text.trim() },
        { headers: getAuthHeaders() },
      )

      return {
        postId,
        comment: response.data.comment,
      }
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to add comment'))
    }
  },
)

// DELETE /api/comments/:commentId
export const deletePostComment = createAsyncThunk(
  'comments/deletePostComment',
  async ({ postId, commentId }: DeleteCommentPayload, { rejectWithValue }) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!commentId) {
      return rejectWithValue('Comment id is required')
    }

    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      await axios.delete(`${API_URL}/api/comments/${commentId}`, {
        headers: getAuthHeaders(),
      })

      return {
        postId,
        commentId,
      }
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete comment'))
    }
  },
)
