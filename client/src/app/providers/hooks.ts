// Предоставляет типизированные хуки Redux для получения состояния и отправки действий
// из React-компонентов без повторного указания типов хранилища.
// Основные части: запуск приложения, провайдеры, маршруты и общие настройки.
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// Хранит значение «useAppDispatch», необходимое для текущего логического блока.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
// Хранит значение «useAppSelector», необходимое для текущего логического блока.
export const useAppSelector = useSelector.withTypes<RootState>()
