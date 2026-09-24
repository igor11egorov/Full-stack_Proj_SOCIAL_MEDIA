// Описывает TypeScript-тип отметки «нравится» для публикации и пользователя, который её поставил.
import type { User } from '../../user/types/user'

export type Like = {
  _id: string
  user: User
  post: string
  createdAt: string
  updatedAt: string
}
