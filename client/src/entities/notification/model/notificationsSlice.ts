// Управляет состоянием уведомлений в Redux: хранит список, счётчики и статусы запросов,
// а также обновляет данные после пометки уведомлений как прочитанных.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createSlice } from '@reduxjs/toolkit'
import { logout } from '../../../features/auth/model/authSlice'
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from './notificationsThunks'

type NotificationsState = {
  items: Notification[]
  count: number
  unreadCount: number
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  updateStatus: 'idle' | 'loading'
  error: string | null
}

const initialState: NotificationsState = {
  items: [],
  count: 0,
  unreadCount: 0,
  status: 'idle',
  updateStatus: 'idle',
  error: null,
}

// Хранит значение «notificationsSlice», необходимое для текущего логического блока.
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading'
        state.items = []
        state.count = 0
        state.unreadCount = 0
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.notifications
        state.count = action.payload.count
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load notifications'
      })
      .addCase(markNotificationAsRead.pending, (state) => {
        state.updateStatus = 'loading'
        state.error = null
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.updateStatus = 'idle'
        // Хранит значение «wasUnread», необходимое для текущего логического блока.
        const wasUnread = state.items.some(
          (notification) =>
            notification._id === action.payload._id && !notification.isRead,
        )

        state.items = state.items.map((notification) =>
          notification._id === action.payload._id
            ? { ...notification, isRead: true }
            : notification,
        )
        // Проверяет условие и выбирает дальнейший сценарий выполнения.
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.updateStatus = 'idle'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to mark notification as read'
      })
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.updateStatus = 'loading'
        state.error = null
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.updateStatus = 'idle'
        state.items = state.items.map((notification) => ({
          ...notification,
          isRead: true,
        }))
        state.unreadCount = 0
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.updateStatus = 'idle'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to mark notifications as read'
      })
      .addCase(logout, () => initialState)
  },
})

export default notificationsSlice.reducer
