// Управляет состоянием подписок в Redux: счётчиками, списками подписчиков и подписок,
// а также статусами запросов на получение данных и изменение подписки.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createSlice } from '@reduxjs/toolkit'
import type { User } from '../../user/types/user'
import {
  fetchSubscriptionSummary,
  fetchUserFollowers,
  fetchUserFollowing,
  followUser,
  unfollowUser,
} from './subscriptionsThunks'

type SubscriptionSummary = {
  followersCount: number
  followingCount: number
  isFollowing: boolean
}

type SubscriptionsState = {
  byUserId: Record<string, SubscriptionSummary>
  followersByUserId: Record<string, User[]>
  followingByUserId: Record<string, User[]>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  followStatus: 'idle' | 'loading'
  error: string | null
}

const initialState: SubscriptionsState = {
  byUserId: {},
  followersByUserId: {},
  followingByUserId: {},
  status: 'idle',
  listStatus: 'idle',
  followStatus: 'idle',
  error: null,
}

const getDefaultSummary = (): SubscriptionSummary => ({
  followersCount: 0,
  followingCount: 0,
  isFollowing: false,
})

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionSummary.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSubscriptionSummary.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.byUserId[action.payload.userId] = {
          followersCount: action.payload.followersCount,
          followingCount: action.payload.followingCount,
          isFollowing: action.payload.isFollowing,
        }
      })
      .addCase(fetchSubscriptionSummary.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load subscriptions'
      })
      .addCase(fetchUserFollowers.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(fetchUserFollowers.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.followersByUserId[action.payload.userId] = action.payload.users

        const summary =
          state.byUserId[action.payload.userId] ?? getDefaultSummary()

        state.byUserId[action.payload.userId] = {
          ...summary,
          followersCount: action.payload.count,
        }
      })
      .addCase(fetchUserFollowers.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load followers'
      })
      .addCase(fetchUserFollowing.pending, (state) => {
        state.listStatus = 'loading'
        state.error = null
      })
      .addCase(fetchUserFollowing.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.followingByUserId[action.payload.userId] = action.payload.users

        const summary =
          state.byUserId[action.payload.userId] ?? getDefaultSummary()

        state.byUserId[action.payload.userId] = {
          ...summary,
          followingCount: action.payload.count,
        }
      })
      .addCase(fetchUserFollowing.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load following'
      })
      .addCase(followUser.pending, (state) => {
        state.followStatus = 'loading'
        state.error = null
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.followStatus = 'idle'
        const summary = state.byUserId[action.payload] ?? getDefaultSummary()
        state.byUserId[action.payload] = {
          ...summary,
          followersCount: summary.followersCount + 1,
          isFollowing: true,
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.followStatus = 'idle'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to follow user'
      })
      .addCase(unfollowUser.pending, (state) => {
        state.followStatus = 'loading'
        state.error = null
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followStatus = 'idle'
        const summary = state.byUserId[action.payload] ?? getDefaultSummary()
        state.byUserId[action.payload] = {
          ...summary,
          followersCount: Math.max(0, summary.followersCount - 1),
          isFollowing: false,
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.followStatus = 'idle'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to unfollow user'
      })
  },
})

export default subscriptionsSlice.reducer
