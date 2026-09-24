// Предоставляет типизированные хуки Redux для получения состояния и отправки действий
// из React-компонентов без повторного указания типов хранилища.
// Основные части: запуск приложения, провайдеры, маршруты и общие настройки.
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
