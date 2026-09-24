// Описывает TypeScript-тип пользователя, применяемый для профилей и авторизации в приложении.
// Основные части: состояние, редьюсеры и операции с данными сущности.
export type User = {
  _id?: string
  id?: string
  userId?: string
  username: string
  email?: string
  fullName: string
  bio?: string
  website?: string
  avatar?: string
  createdAt?: string
  updatedAt?: string
}
