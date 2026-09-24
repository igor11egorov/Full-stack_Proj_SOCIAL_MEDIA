// Описывает TypeScript-тип комментария к публикации и связанные с ним данные пользователя.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import type { User } from '../../user/types/user'

export type Comment = {
  _id: string
  user: User
  post: string
  text: string
  createdAt: string
  updatedAt: string
}
