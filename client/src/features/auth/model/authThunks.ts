// Содержит асинхронные Redux-запросы для авторизации, регистрации
// и восстановления или сброса пароля через API приложения.
// Основные части: логика пользовательского сценария и запросы к API.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

// Задаёт базовый адрес API, используемый запросами этого модуля.
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
    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
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
    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
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
    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
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
    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
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
