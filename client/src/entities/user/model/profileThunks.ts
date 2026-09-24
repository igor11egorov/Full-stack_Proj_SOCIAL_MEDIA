// Содержит асинхронные Redux-запросы для получения и обновления профиля текущего пользователя,
// а также загрузки списка его публикаций через API.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { Post } from '../../post/types/post'
import type { User } from '../types/user'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type UserResponse = {
  success: boolean
  user: User
}

type UserPostsResponse = {
  success: boolean
  posts: Post[]
}

// Возвращает вычисленные данные: AuthHeaders.
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// GET /api/users/me
export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<UserResponse>(
        `${API_URL}/api/users/me`,
        {
          headers: getAuthHeaders(),
        },
      )

      return response.data.user
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load profile'))
    }
  },
)

// GET /api/posts/user/:userId
export const fetchMyPosts = createAsyncThunk(
  'profile/fetchMyPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get<UserPostsResponse>(
        `${API_URL}/api/posts/user/${userId}`,
      )

      return response.data.posts
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to load profile posts'),
      )
    }
  },
)

// PATCH /api/users/me
export const updateMyProfile = createAsyncThunk(
  'profile/updateMyProfile',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.patch<UserResponse>(
        `${API_URL}/api/users/me`,
        formData,
        {
          headers: getAuthHeaders(),
        },
      )

      return response.data.user
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to update profile'))
    }
  },
)
