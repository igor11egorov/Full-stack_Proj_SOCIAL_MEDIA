// Содержит асинхронные Redux-запросы к API комментариев: загрузку, добавление
// и удаление комментариев к выбранной публикации.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { Comment } from '../types/comment'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

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

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// GET /api/comments/:postId
export const fetchPostComments = createAsyncThunk(
  'comments/fetchPostComments',
  async (postId: string, { rejectWithValue }) => {
    try {
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
    if (!postId) {
      return rejectWithValue('Post id is required')
    }

    if (!text.trim()) {
      return rejectWithValue('Comment text is required')
    }

    try {
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
    if (!commentId) {
      return rejectWithValue('Comment id is required')
    }

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
