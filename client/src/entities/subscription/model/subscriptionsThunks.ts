// Содержит асинхронные Redux-запросы к API подписок: загрузку сводки и списков,
// а также подписку и отписку текущего пользователя.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import type { User } from '../../user/types/user'
import { getErrorMessage } from '../../../shared/api/getErrorMessage'

// Задаёт базовый адрес API, используемый запросами этого модуля.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type SubscriptionUser = {
  _id?: string
  id?: string
  userId?: string
}

type FollowerItem = {
  follower: SubscriptionUser | string
}

type FollowersResponse = {
  success: boolean
  followers: FollowerItem[]
  count: number
}

type FollowingItem = {
  following: SubscriptionUser | string
}

type FollowingResponse = {
  success: boolean
  following: FollowingItem[]
  count: number
}

type SubscriptionListItem = {
  follower?: User
  following?: User
}

type FollowersListResponse = {
  success: boolean
  followers: SubscriptionListItem[]
  count: number
}

type FollowingListResponse = {
  success: boolean
  following: SubscriptionListItem[]
  count: number
}

// Возвращает вычисленные данные: AuthHeaders.
const getAuthHeaders = () => {
  // Хранит значение «token», необходимое для текущего логического блока.
  const token = localStorage.getItem('token')

  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// Возвращает вычисленные данные: UserId.
const getUserId = (user: SubscriptionUser | string) =>
  typeof user === 'string' ? user : user._id || user.userId || user.id || ''

// Хранит значение «fetchSubscriptionSummary», необходимое для текущего логического блока.
export const fetchSubscriptionSummary = createAsyncThunk(
  'subscriptions/fetchSummary',
  async (
    { userId, currentUserId }: { userId: string; currentUserId: string },
    { rejectWithValue },
  ) => {
    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «headers», необходимое для текущего логического блока.
      const headers = getAuthHeaders()
      const [followersResponse, followingResponse] = await Promise.all([
        axios.get<FollowersResponse>(
          `${API_URL}/api/subscriptions/${userId}/followers`,
          { headers },
        ),
        axios.get<FollowingResponse>(
          `${API_URL}/api/subscriptions/${userId}/following`,
          { headers },
        ),
      ])

      return {
        userId,
        followersCount: followersResponse.data.count,
        followingCount: followingResponse.data.count,
        isFollowing: followersResponse.data.followers.some(
          (item) => getUserId(item.follower) === currentUserId,
        ),
      }
    } catch (error: unknown) {
      return rejectWithValue(
        getErrorMessage(error, 'Failed to load subscriptions'),
      )
    }
  },
)

// POST /api/subscriptions/:userId
export const followUser = createAsyncThunk(
  'subscriptions/followUser',
  async (userId: string, { rejectWithValue }) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!userId) {
      return rejectWithValue('User id is required')
    }
    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      await axios.post(
        `${API_URL}/api/subscriptions/${userId}`,
        {},
        { headers: getAuthHeaders() },
      )

      return userId
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to follow user'))
    }
  },
)

// DELETE /api/subscriptions/:userId
export const unfollowUser = createAsyncThunk(
  'subscriptions/unfollowUser',
  async (userId: string, { rejectWithValue }) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!userId) {
      return rejectWithValue('User id is required')
    }
    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      await axios.delete(`${API_URL}/api/subscriptions/${userId}`, {
        headers: getAuthHeaders(),
      })

      return userId
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to unfollow user'))
    }
  },
)

// GET /api/subscriptions/:userId/followers
export const fetchUserFollowers = createAsyncThunk(
  'subscriptions/fetchUserFollowers',
  async (userId: string, { rejectWithValue }) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!userId) {
      return rejectWithValue('User id is required')
    }

    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
      const response = await axios.get<FollowersListResponse>(
        `${API_URL}/api/subscriptions/${userId}/followers`,
        { headers: getAuthHeaders() },
      )

      return {
        userId,
        users: response.data.followers
          .map((item) => item.follower)
          .filter((user): user is User => Boolean(user)),
        count: response.data.count,
      }
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load followers'))
    }
  },
)

// GET /api/subscriptions/:userId/following
export const fetchUserFollowing = createAsyncThunk(
  'subscriptions/fetchUserFollowing',
  async (userId: string, { rejectWithValue }) => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!userId) {
      return rejectWithValue('User id is required')
    }

    // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
    try {
      // Хранит значение «response», необходимое для текущего логического блока.
      const response = await axios.get<FollowingListResponse>(
        `${API_URL}/api/subscriptions/${userId}/following`,
        { headers: getAuthHeaders() },
      )

      return {
        userId,
        users: response.data.following
          .map((item) => item.following)
          .filter((user): user is User => Boolean(user)),
        count: response.data.count,
      }
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error, 'Failed to load following'))
    }
  },
)
