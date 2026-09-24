// Управляет состоянием поиска пользователей в Redux: результатами, статусом запроса
// и ошибками, а также очищает данные при сбросе поиска.
// Основные части: логика пользовательского сценария и запросы к API.
import { createSlice } from '@reduxjs/toolkit'
import type { User } from '../../../entities/user/types/user'
import { searchUsers } from './searchThunks'

type SearchState = {
  users: User[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: SearchState = {
  users: [],
  status: 'idle',
  error: null,
}

// Хранит значение «searchSlice», необходимое для текущего логического блока.
const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearchResults: (state) => {
      state.users = []
      state.status = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.users = action.payload.users
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : action.error.message || 'Failed to search users'
      })
  },
})

export const { clearSearchResults } = searchSlice.actions
export default searchSlice.reducer
