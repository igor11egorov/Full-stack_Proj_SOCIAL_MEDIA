// Настраивает общее Redux-хранилище приложения: объединяет редьюсеры функций
// и экспортирует типы состояния и dispatch для безопасного использования в компонентах.
// Основные части: запуск приложения, провайдеры, маршруты и общие настройки.
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../../features/auth/model/authSlice'
import commentsReducer from '../../entities/comment/model/commentsSlice'
import likesCommentReducer from '../../entities/like/model/likesCommentSlice'
import likesReducer from '../../entities/like/model/likesSlice'
import notificationsReducer from '../../entities/notification/model/notificationsSlice'
import postsReducer from '../../entities/post/model/postsSlice'
import profileReducer from '../../entities/user/model/profileSlice'
import searchReducer from '../../features/search/model/searchSlice'
import subscriptionsReducer from '../../entities/subscription/model/subscriptionsSlice'

// Хранит значение «store», необходимое для текущего логического блока.
const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    profile: profileReducer,
    comments: commentsReducer,
    likes: likesReducer,
    commentLikes: likesCommentReducer,
    notifications: notificationsReducer,
    search: searchReducer,
    subscriptions: subscriptionsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
