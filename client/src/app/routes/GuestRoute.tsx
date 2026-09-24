// Ограничивает гостевые маршруты: перенаправляет авторизованного пользователя на главную
// и очищает состояние авторизации, если его токен уже истёк.
import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { logout } from '../../features/auth/model/authSlice'
import { isTokenExpired } from '../../features/auth/model/tokenUtils'
import { useAppDispatch, useAppSelector } from '../providers/hooks'

function GuestRoute() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  const tokenExpired = isAuthenticated && isTokenExpired(token)

  useEffect(() => {
    if (tokenExpired) {
      dispatch(logout())
    }
  }, [dispatch, tokenExpired])

  if (tokenExpired) {
    return <Outlet />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default GuestRoute
