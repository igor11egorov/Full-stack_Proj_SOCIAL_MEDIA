// Управляет состоянием лайков комментариев в Redux, включая списки, счётчики
// и статусы запросов на загрузку или переключение отметки «нравится».
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createSlice } from '@reduxjs/toolkit'
import {
  fetchCommentLikes,
  toggleCommentLike,
  type CommentLike,
} from './likesCommentThunks'

type CommentLikesState = {
  likes: CommentLike[]
  count: number
  isLiked: boolean
}

type LikesCommentState = {
  byCommentId: Record<string, CommentLikesState>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  toggleStatus: 'idle' | 'loading'
  error: string | null
}

const initialState: LikesCommentState = {
  byCommentId: {},
  status: 'idle',
  toggleStatus: 'idle',
  error: null,
}

// Хранит значение «getDefaultCommentLikes», необходимое для текущего логического блока.
const getDefaultCommentLikes = (): CommentLikesState => ({
  likes: [],
  count: 0,
  isLiked: false,
})

// Хранит значение «likesCommentSlice», необходимое для текущего логического блока.
const likesCommentSlice = createSlice({
  name: 'commentLikes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommentLikes.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCommentLikes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.byCommentId[action.payload.commentId] = {
          likes: action.payload.likes,
          count: action.payload.count,
          isLiked: false,
        }
      })
      .addCase(fetchCommentLikes.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load comment likes'
      })
      .addCase(toggleCommentLike.pending, (state) => {
        state.toggleStatus = 'loading'
        state.error = null
      })
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        state.toggleStatus = 'idle'

        // Хранит значение «current», необходимое для текущего логического блока.
        const current =
          state.byCommentId[action.payload.commentId] ??
          getDefaultCommentLikes()

        state.byCommentId[action.payload.commentId] = {
          ...current,
          likes: action.payload.like
            ? [action.payload.like, ...current.likes]
            : current.likes,
          count: action.payload.count,
          isLiked: action.payload.liked,
        }
      })
      .addCase(toggleCommentLike.rejected, (state, action) => {
        state.toggleStatus = 'idle'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to toggle comment like'
      })
  },
})

export default likesCommentSlice.reducer
