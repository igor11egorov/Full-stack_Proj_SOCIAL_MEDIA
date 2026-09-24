// Ограничивает гостевые маршруты: перенаправляет авторизованного пользователя на главную
// и очищает состояние авторизации, если его токен уже истёк.
// Основные части: сопоставление URL и HTTP-методов с контроллерами и middleware.
import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { logout } from '../../features/auth/model/authSlice'
import { isTokenExpired } from '../../features/auth/model/tokenUtils'
import { useAppDispatch, useAppSelector } from '../providers/hooks'

// Выполняет логику GuestRoute в текущем модуле.
function GuestRoute() {
  // Хранит значение «dispatch», необходимое для текущего логического блока.
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  // Хранит значение «tokenExpired», необходимое для текущего логического блока.
  const tokenExpired = isAuthenticated && isTokenExpired(token)

  // Запускает побочный эффект и синхронизирует данные или состояние при изменении зависимостей.
  useEffect(() => {
    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (tokenExpired) {
      dispatch(logout())
    }
  }, [dispatch, tokenExpired])

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (tokenExpired) {
    return <Outlet />
  }

  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default GuestRoute
