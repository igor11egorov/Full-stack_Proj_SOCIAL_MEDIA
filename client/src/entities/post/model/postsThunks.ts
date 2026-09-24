// Содержит асинхронные Redux-запросы к API публикаций: загрузку лент и отдельного поста,
// а также создание, обновление и удаление публикаций.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { Post } from '../types/post'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type ExplorePostsResponse = {
  success: boolean
  posts: Post[]
  count: number
}

type PostsResponse = {
  success: boolean
  posts: Post[]
}

type PostResponse = {
  success: boolean
  post: Post
}

type DeletePostResponse = {
  success: boolean
  message: string
}

// Возвращает вычисленные данные: AuthHeaders.
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// GET /api/posts/explore
export const fetchExplorePosts = createAsyncThunk(
  'posts/fetchExplorePosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ExplorePostsResponse>(
        `${API_URL}/api/posts/explore`,
      )

      return response.data.posts
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to load explore posts'),
      )
    }
  },
)

// GET /api/posts
export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAllPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<PostsResponse>(`${API_URL}/api/posts`)

      return response.data.posts
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load posts'))
    }
  },
)

// GET /api/posts/:id
export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<PostResponse>(
        `${API_URL}/api/posts/${postId}`,
      )

      return response.data.post
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load post'))
    }
  },
)

// POST /api/posts
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post<PostResponse>(
        `${API_URL}/api/posts`,
        formData,
        {
          headers: getAuthHeaders(),
        },
      )

      return response.data.post
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to create post'))
    }
  },
)

// PATCH /api/posts/:id
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async (
    { postId, formData }: { postId: string; formData: FormData },
    { rejectWithValue },
  ) => {
    try {
      const response = await axios.patch<PostResponse>(
        `${API_URL}/api/posts/${postId}`,
        formData,
        {
          headers: getAuthHeaders(),
        },
      )

      return response.data.post
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update post'))
    }
  },
)

// DELETE /api/posts/:id
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await axios.delete<DeletePostResponse>(`${API_URL}/api/posts/${postId}`, {
        headers: getAuthHeaders(),
      })

      return postId
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to delete post'))
    }
  },
)
