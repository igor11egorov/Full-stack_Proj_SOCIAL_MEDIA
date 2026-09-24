// Определяет маршруты приложения, разделяя открытые и защищённые страницы
// и подключая общий макет для авторизованных пользователей.
// Основные части: запуск приложения, провайдеры, маршруты и общие настройки.
import { Route, Routes } from 'react-router-dom'
import MainLayout from '../widgets/layout/main-layout/MainLayout'
import GuestRoute from './routes/GuestRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage/ForgotPasswordPage'
import LoginPage from '../pages/auth/LoginPage/LoginPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage/ResetPasswordPage'
import SignupPage from '../pages/auth/SignupPage/SignupPage'
import CreatePostPage from '../pages/CreatePostPage/CreatePostPage'
import EditPostPage from '../pages/EditPostPage/EditPostPage'
import EditProfilePage from '../pages/EditProfilePage/EditProfilePage'
import ExplorePage from '../pages/ExplorePage/ExplorePage'
import HomePage from '../pages/HomePage/HomePage'
import MyProfilePage from '../pages/MyProfilePage/MyProfilePage'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage'
import UserProfilePage from '../pages/UserProfilePage/UserProfilePage'

// Выполняет логику AppRoutes в текущем модуле.
function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<div>Search page</div>} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route
            path="/notifications"
            element={<div>Notifications page</div>}
          />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/posts/:postId/edit" element={<EditPostPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/users/:userId" element={<UserProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
export default AppRoutes
