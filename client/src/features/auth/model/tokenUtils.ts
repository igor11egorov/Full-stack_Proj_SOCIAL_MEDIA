// Проверяет JWT-токен авторизации: извлекает срок его действия и определяет,
// истёк ли токен или имеет некорректный формат.
// Основные части: логика пользовательского сценария и запросы к API.
type JwtPayload = {
  exp?: number
}

// Проверяет условие: TokenExpired.
export const isTokenExpired = (token: string | null) => {
  // Проверяет условие и выбирает дальнейший сценарий выполнения.
  if (!token) return true

  // Выполняет основную операцию, для которой ниже предусмотрена обработка ошибок.
  try {
    // Хранит значение «payloadPart», необходимое для текущего логического блока.
    const payloadPart = token.split('.')[1]

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!payloadPart) return true

    // Хранит значение «base64Payload», необходимое для текущего логического блока.
    const base64Payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    // Хранит значение «normalizedPayload», необходимое для текущего логического блока.
    const normalizedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      '=',
    )
    // Хранит значение «payload», необходимое для текущего логического блока.
    const payload = JSON.parse(atob(normalizedPayload)) as JwtPayload

    // Проверяет условие и выбирает дальнейший сценарий выполнения.
    if (!payload.exp) return true

    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}
