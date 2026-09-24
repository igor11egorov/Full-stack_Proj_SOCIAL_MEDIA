// Управляет состоянием авторизации в Redux: хранит пользователя и токен, обрабатывает вход,
// регистрацию, восстановление пароля, выход и очистку истёкшего токена.
// Основные части: логика пользовательского сценария и запросы к API.
import { createSlice } from '@reduxjs/toolkit'
import type { User } from '../../../entities/user/types/user'
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from './authThunks'
import { isTokenExpired } from './tokenUtils'

// Хранит значение «storedToken», необходимое для текущего логического блока.
const storedToken = localStorage.getItem('token')
// Хранит значение «token», необходимое для текущего логического блока.
const token = isTokenExpired(storedToken) ? null : storedToken

// Проверяет условие и выбирает дальнейший сценарий выполнения.
if (storedToken && !token) {
  localStorage.removeItem('token')
}

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  message: string | null
}

const initialState: AuthState = {
  user: null,
  token,
  isAuthenticated: Boolean(token),
  status: 'idle', // idle | loading | succeeded | failed
  error: null,
  message: null,
}

// Хранит значение «authSlice», необходимое для текущего логического блока.
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
    },
    resetAuthState: (state) => {
      state.status = 'idle'
      state.error = null
      state.message = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Login failed'
      })

      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Registration failed'
      })

      .addCase(forgotPassword.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.message = null
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.message = action.payload.message || 'Password reset link sent'
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Password reset request failed'
      })

      .addCase(resetPassword.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.message = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.message = action.payload.message || null
        localStorage.setItem('token', action.payload.token)
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Password reset failed'
      })
  },
})

export const { logout, resetAuthState } = authSlice.actions
export default authSlice.reducer
