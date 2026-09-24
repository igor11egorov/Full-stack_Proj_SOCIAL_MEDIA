// Управляет состоянием профиля текущего пользователя и его публикаций в Redux,
// обрабатывая загрузку, обновление, удаление и возможные ошибки запросов.
import { createSlice } from '@reduxjs/toolkit'
import type { Post } from '../../post/types/post'
import type { User } from '../types/user'
import { deletePost, updatePost } from '../../post/model/postsThunks'
import { fetchMyPosts, fetchMyProfile, updateMyProfile } from './profileThunks'

type ProfileState = {
  myProfile: User | null
  myPosts: Post[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  postsStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ProfileState = {
  myProfile: null,
  myPosts: [],
  status: 'idle',
  postsStatus: 'idle',
  error: null,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.myProfile = action.payload
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load profile'
      })
      .addCase(fetchMyPosts.pending, (state) => {
        state.postsStatus = 'loading'
        state.error = null
      })
      .addCase(fetchMyPosts.fulfilled, (state, action) => {
        state.postsStatus = 'succeeded'
        state.myPosts = action.payload
      })
      .addCase(fetchMyPosts.rejected, (state, action) => {
        state.postsStatus = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to load profile posts'
      })
      .addCase(updateMyProfile.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.myProfile = action.payload
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to update profile'
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.myPosts = state.myPosts.filter(
          (post) => post._id !== action.payload,
        )
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.myPosts = state.myPosts.map((post) =>
          post._id === action.payload._id ? action.payload : post,
        )
      })
  },
})

export default profileSlice.reducer
