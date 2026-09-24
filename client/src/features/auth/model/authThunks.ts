// Содержит асинхронные Redux-запросы для авторизации, регистрации
// и восстановления или сброса пароля через API приложения.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type LoginPayload = {
  identifier: string
  password: string
}

type RegisterPayload = {
  email: string
  fullName: string
  username: string
  password: string
}

type ForgotPasswordPayload = {
  identifier: string
}

type ResetPasswordPayload = {
  token: string
  password: string
}

// POST /api/auth/login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, payload)
      return response.data
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Login failed'))
    }
  },
)

// POST /api/auth/register
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, payload)
      return response.data
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Registration failed'))
    }
  },
)

// POST /api/auth/forgot-password
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        payload,
      )
      return response.data
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Password reset request failed'),
      )
    }
  },
)

// PATCH /api/auth/reset-password/:token
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',

  async ({ token, password }: ResetPasswordPayload, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/auth/reset-password/${token}`,
        { password },
      )
      return response.data
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Password reset failed'))
    }
  },
)
