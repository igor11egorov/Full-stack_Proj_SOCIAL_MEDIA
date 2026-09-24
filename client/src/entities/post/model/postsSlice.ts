// Управляет состоянием публикаций в Redux: лентой, Explore, выбранным постом
// и статусами запросов на загрузку, создание, обновление и удаление.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import { createSlice } from '@reduxjs/toolkit'
import type { Post } from '../types/post'
import {
  createPost,
  deletePost,
  fetchAllPosts,
  fetchExplorePosts,
  fetchPostById,
  updatePost,
} from './postsThunks'

type PostsState = {
  allPosts: Post[]
  explorePosts: Post[]
  selectedPost: Post | null
  feedStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  selectedStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  createStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  updateStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: PostsState = {
  allPosts: [],
  explorePosts: [],
  selectedPost: null,
  feedStatus: 'idle',
  status: 'idle',
  selectedStatus: 'idle',
  createStatus: 'idle',
  updateStatus: 'idle',
  error: null,
}

// Хранит значение «postsSlice», необходимое для текущего логического блока.
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPosts.pending, (state) => {
        state.feedStatus = 'loading'
        state.error = null
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.feedStatus = 'succeeded'
        state.allPosts = action.payload
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.feedStatus = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load posts'
      })
      .addCase(fetchExplorePosts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchExplorePosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.explorePosts = action.payload
      })
      .addCase(fetchExplorePosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load explore posts'
      })
      .addCase(fetchPostById.pending, (state) => {
        state.selectedStatus = 'loading'
        state.selectedPost = null
        state.error = null
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.selectedStatus = 'succeeded'
        state.selectedPost = action.payload
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.selectedStatus = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load post'
      })
      .addCase(createPost.pending, (state) => {
        state.createStatus = 'loading'
        state.error = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createStatus = 'succeeded'
        state.allPosts = [action.payload, ...state.allPosts]
        state.explorePosts = [action.payload, ...state.explorePosts]
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to create post'
      })
      .addCase(updatePost.pending, (state) => {
        state.updateStatus = 'loading'
        state.error = null
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded'
        state.selectedPost = action.payload
        state.allPosts = [
          action.payload,
          ...state.allPosts.filter((post) => post._id !== action.payload._id),
        ]
        state.explorePosts = state.explorePosts.map((post) =>
          post._id === action.payload._id ? action.payload : post,
        )
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to update post'
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.allPosts = state.allPosts.filter(
          (post) => post._id !== action.payload,
        )
        state.explorePosts = state.explorePosts.filter(
          (post) => post._id !== action.payload,
        )
        // Проверяет условие и выбирает дальнейший сценарий выполнения.
        if (state.selectedPost?._id === action.payload) {
          state.selectedPost = null
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to delete post'
      })
  },
})

export default postsSlice.reducer
