// Проверяет JWT-токен авторизации: извлекает срок его действия и определяет,
// истёк ли токен или имеет некорректный формат.
// Основные части: логика пользовательского сценария и запросы к API.
type JwtPayload = {
  exp?: number
}

// Проверяет условие: TokenExpired.
export const isTokenExpired = (token: string | null) => {
  if (!token) return true

  try {
    const payloadPart = token.split('.')[1]

    if (!payloadPart) return true

    const base64Payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const normalizedPayload = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      '=',
    )
    const payload = JSON.parse(atob(normalizedPayload)) as JwtPayload

    if (!payload.exp) return true

    return payload.exp * 1000 <= Date.now()
  } catch {
    return true
  }
}
