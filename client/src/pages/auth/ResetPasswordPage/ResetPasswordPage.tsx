// Отображает форму установки нового пароля по токену из ссылки,
// проверяет совпадение паролей и отправляет запрос на их обновление.
// Основные части: данные, локальное состояние и отображение страницы.
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { resetAuthState } from '../../../features/auth/model/authSlice'
import { resetPassword } from '../../../features/auth/model/authThunks'
import { useAppDispatch, useAppSelector } from '../../../app/providers/hooks'
import styles from './ResetPasswordPage.module.css'

// Выполняет логику ResetPasswordPage в текущем модуле.
function ResetPasswordPage() {
  const dispatch = useAppDispatch()
  const { token } = useParams<{ token: string }>()
  const { status, error } = useAppSelector((state) => state.auth)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const isLoading = status === 'loading'

  useEffect(() => {
    dispatch(resetAuthState())
  }, [dispatch])

  // Обрабатывает действие пользователя: Submit.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      setLocalError('Reset token is missing.')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    setLocalError(null)
    dispatch(resetPassword({ token, password }))
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link to="/login" aria-label="Go to login">
          <img
            className={styles.headerLogo}
            src="/images/ICHGRAM_logo.png"
            alt="ICHGRAM"
          />
        </Link>
      </header>

      <section className={styles.card}>
        <img
          className={styles.lockIcon}
          src="/images/Trouble_logging_in.png"
          alt=""
          aria-hidden="true"
        />

        <h1 className={styles.title}>Create a new password</h1>
        <p className={styles.description}>
          Your new password should be different from your previous password.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          <input
            className={styles.input}
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />

          {(localError || error) && (
            <p className={styles.error}>{localError || error}</p>
          )}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Reset password'}
          </button>
        </form>

        <Link className={styles.backLink} to="/login">
          Back to login
        </Link>
      </section>
    </main>
  )
}

export default ResetPasswordPage
