// Описывает TypeScript-тип публикации, используемый в компонентах и состояниях приложения.
// Основные части: состояние, редьюсеры и операции с данными сущности.
import type { User } from '../../user/types/user'

export type Post = {
  _id: string
  author: User
  description?: string
  image?: string
  images?: string[]
  createdAt: string
  updatedAt: string
}
