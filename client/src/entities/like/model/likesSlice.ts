// Управляет состоянием лайков публикаций в Redux: хранит списки, счётчики и статусы
// загрузки или переключения лайка для каждой публикации.
import { createSlice } from '@reduxjs/toolkit'
import type { Like } from '../types/like'
import { fetchPostLikes, togglePostLike } from './likesThunks'

type PostLikesState = {
  likes: Like[]
  count: number
  isLiked: boolean
}

type LikesState = {
  byPostId: Record<string, PostLikesState>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  toggleStatus: 'idle' | 'loading'
  error: string | null
}

const initialState: LikesState = {
  byPostId: {},
  status: 'idle',
  toggleStatus: 'idle',
  error: null,
}

const getDefaultPostLikes = (): PostLikesState => ({
  likes: [],
  count: 0,
  isLiked: false,
})

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostLikes.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPostLikes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.byPostId[action.payload.postId] = {
          likes: action.payload.likes,
          count: action.payload.count,
          isLiked: false,
        }
      })
      .addCase(fetchPostLikes.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load likes'
      })
      .addCase(togglePostLike.pending, (state) => {
        state.toggleStatus = 'loading'
        state.error = null
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        state.toggleStatus = 'idle'

        const current =
          state.byPostId[action.payload.postId] ?? getDefaultPostLikes()

        state.byPostId[action.payload.postId] = {
          ...current,
          count: action.payload.liked
            ? current.count + 1
            : Math.max(0, current.count - 1),
          isLiked: action.payload.liked,
        }
      })
      .addCase(togglePostLike.rejected, (state, action) => {
        state.toggleStatus = 'idle'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to toggle like'
      })
  },
})

export default likesSlice.reducer
