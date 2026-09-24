// Отображает страницу регистрации и отправляет данные новой учётной записи в Redux,
// показывая ошибки валидации и состояния запроса пользователю.
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { resetAuthState } from '../../../features/auth/model/authSlice'
import { registerUser } from '../../../features/auth/model/authThunks'
import { useAppDispatch, useAppSelector } from '../../../app/providers/hooks'
import styles from './SignupPage.module.css'

// Выполняет логику SignupPage в текущем модуле.
function SignupPage() {
  const dispatch = useAppDispatch()
  const { status, error } = useAppSelector((state) => state.auth)

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const isLoading = status === 'loading'
  const usernameError = error?.toLowerCase().includes('username')
    ? 'This username is already taken.'
    : null
  const formError = error && !usernameError ? error : null

  useEffect(() => {
    dispatch(resetAuthState())
  }, [dispatch])

  // Обрабатывает действие пользователя: Submit.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    dispatch(
      registerUser({
        email: email.trim(),
        fullName: fullName.trim(),
        username: username.trim(),
        password,
      }),
    )
  }

  return (
    <main className={styles.page}>
      <section className={styles.authColumn}>
        <div className={styles.card}>
          <img
            className={styles.logo}
            src="/images/ICHGRAM_logo.png"
            alt="ICHGRAM"
          />

          <p className={styles.subtitle}>
            Sign up to see photos and videos from your friends.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <input
              className={styles.input}
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              required
            />

            <input
              className={styles.input}
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />

            {usernameError && (
              <p className={styles.fieldError}>{usernameError}</p>
            )}

            <input
              className={styles.input}
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            {formError && <p className={styles.error}>{formError}</p>}

            <p className={styles.notice}>
              People who use our service may have uploaded your contact
              information to Instagram. <a href="#">Learn More</a>
            </p>

            <p className={styles.terms}>
              By signing up, you agree to our <a href="#">Terms</a>,{' '}
              <a href="#">Privacy Policy</a> and <a href="#">Cookies Policy</a>.
            </p>

            <button
              className={styles.submitButton}
              type="submit"
              disabled={isLoading}>
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        </div>

        <div className={styles.loginCard}>
          <p>
            Have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default SignupPage
