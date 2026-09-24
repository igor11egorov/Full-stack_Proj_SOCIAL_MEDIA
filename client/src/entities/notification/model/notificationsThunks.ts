// Содержит асинхронные Redux-запросы к API уведомлений: загрузку списка
// и пометку одного или всех уведомлений как прочитанных.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { User } from '../../user/types/user'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export type NotificationPost = {
  _id: string
  description?: string
  image?: string
  images?: string[]
}

export type NotificationComment = {
  _id: string
  text: string
}

export type Notification = {
  _id: string
  recipient: string
  sender: User | string
  type: 'like' | 'comment' | 'follow'
  post?: NotificationPost | string
  comment?: NotificationComment
  subscription?: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}

type NotificationsResponse = {
  success: boolean
  notifications: Notification[]
  count: number
  unreadCount: number
}

type NotificationResponse = {
  success: boolean
  notification: Notification
}

type MarkAllResponse = {
  success: boolean
  message: string
  modifiedCount: number
}

// Возвращает вычисленные данные: AuthHeaders.
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// GET /api/notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<NotificationsResponse>(
        `${API_URL}/api/notifications`,
        { headers: getAuthHeaders() },
      )

      return {
        notifications: response.data.notifications,
        count: response.data.count,
        unreadCount: response.data.unreadCount,
      }
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to load notifications'),
      )
    }
  },
)

// PATCH /api/notifications/:notificationId/read
export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    if (!notificationId) {
      return rejectWithValue('Notification id is required')
    }

    try {
      const response = await axios.patch<NotificationResponse>(
        `${API_URL}/api/notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeaders() },
      )

      return response.data.notification
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to mark notification as read'),
      )
    }
  },
)

// PATCH /api/notifications/read-all
export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.patch<MarkAllResponse>(
        `${API_URL}/api/notifications/read-all`,
        {},
        { headers: getAuthHeaders() },
      )

      return response.data.modifiedCount
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to mark notifications as read'),
      )
    }
  },
)
