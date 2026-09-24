// Отображает страницу входа: собирает данные пользователя, отправляет запрос авторизации
// и позволяет переключать видимость введённого пароля.
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { resetAuthState } from '../../../features/auth/model/authSlice'
import { loginUser } from '../../../features/auth/model/authThunks'
import { useAppDispatch, useAppSelector } from '../../../app/providers/hooks'
import styles from './LoginPage.module.css'

// Выполняет логику LoginPage в текущем модуле.
function LoginPage() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((state) => state.auth)

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isLoading = status === 'loading'

  useEffect(() => {
    dispatch(resetAuthState())
  }, [dispatch])

  // Обрабатывает действие пользователя: Submit.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    dispatch(
      loginUser({
        identifier: identifier.trim(),
        password,
      }),
    )
  }

  return (
    <main className={styles.page}>
      <section className={styles.preview} aria-hidden="true">
        <img
          className={styles.previewImage}
          src="/images/Background.png"
          alt=""
        />
      </section>

      <section className={styles.authColumn}>
        <div className={styles.card}>
          <img
            className={styles.logo}
            src="/images/ICHGRAM_logo.png"
            alt="ICHGRAM"
          />

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="text"
              name="identifier"
              placeholder="Username, or email"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
              required
            />

            <div className={styles.passwordField}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                className={styles.passwordToggle}
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((current) => !current)}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="3" />
                  {!showPassword && <line x1="4" y1="20" x2="20" y2="4" />}
                </svg>
              </button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <div className={styles.divider}>
            <span />
            <p>OR</p>
            <span />
          </div>

          <Link className={styles.forgotLink} to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <div className={styles.signupCard}>
          <p>
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
