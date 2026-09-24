// Управляет состоянием комментариев публикаций в Redux: хранит их по идентификатору поста
// и обновляет данные и статусы после загрузки, добавления или удаления.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createSlice } from '@reduxjs/toolkit'
import type { Comment } from '../types/comment'
import {
  addPostComment,
  deletePostComment,
  fetchPostComments,
} from './commentsThunks'

type PostCommentsState = {
  comments: Comment[]
  count: number
}

type CommentsState = {
  byPostId: Record<string, PostCommentsState>
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  addStatus: 'idle' | 'loading'
  deleteStatus: 'idle' | 'loading'
  error: string | null
}

const initialState: CommentsState = {
  byPostId: {},
  status: 'idle',
  addStatus: 'idle',
  deleteStatus: 'idle',
  error: null,
}

// Хранит значение «getDefaultPostComments», необходимое для текущего логического блока.
const getDefaultPostComments = (): PostCommentsState => ({
  comments: [],
  count: 0,
})

// Хранит значение «commentsSlice», необходимое для текущего логического блока.
const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostComments.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPostComments.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.byPostId[action.payload.postId] = {
          comments: action.payload.comments,
          count: action.payload.count,
        }
      })
      .addCase(fetchPostComments.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load comments'
      })
      .addCase(addPostComment.pending, (state) => {
        state.addStatus = 'loading'
        state.error = null
      })
      .addCase(addPostComment.fulfilled, (state, action) => {
        state.addStatus = 'idle'

        // Хранит значение «current», необходимое для текущего логического блока.
        const current =
          state.byPostId[action.payload.postId] ?? getDefaultPostComments()

        state.byPostId[action.payload.postId] = {
          comments: [action.payload.comment, ...current.comments],
          count: current.count + 1,
        }
      })
      .addCase(addPostComment.rejected, (state, action) => {
        state.addStatus = 'idle'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to add comment'
      })
      .addCase(deletePostComment.pending, (state) => {
        state.deleteStatus = 'loading'
        state.error = null
      })
      .addCase(deletePostComment.fulfilled, (state, action) => {
        state.deleteStatus = 'idle'

        // Хранит значение «current», необходимое для текущего логического блока.
        const current =
          state.byPostId[action.payload.postId] ?? getDefaultPostComments()

        state.byPostId[action.payload.postId] = {
          comments: current.comments.filter(
            (comment) => comment._id !== action.payload.commentId,
          ),
          count: Math.max(0, current.count - 1),
        }
      })
      .addCase(deletePostComment.rejected, (state, action) => {
        state.deleteStatus = 'idle'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to delete comment'
      })
  },
})

export default commentsSlice.reducer
