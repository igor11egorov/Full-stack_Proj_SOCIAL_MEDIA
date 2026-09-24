// Отображает форму восстановления доступа и отправляет запрос на сброс пароля
// по введённому email, имени пользователя или номеру телефона.
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { resetAuthState } from '../../../features/auth/model/authSlice'
import { forgotPassword } from '../../../features/auth/model/authThunks'
import { useAppDispatch, useAppSelector } from '../../../app/providers/hooks'
import styles from './ForgotPasswordPage.module.css'

function ForgotPasswordPage() {
  const dispatch = useAppDispatch()
  const { status, error, message } = useAppSelector((state) => state.auth)
  const [identifier, setIdentifier] = useState('')

  const isLoading = status === 'loading'

  useEffect(() => {
    dispatch(resetAuthState())
  }, [dispatch])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch(forgotPassword({ identifier: identifier.trim() }))
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

        <h1 className={styles.title}>Trouble logging in?</h1>
        <p className={styles.description}>
          Enter your email, phone, or username and we&apos;ll send you a link to
          get back into your account.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            name="identifier"
            placeholder="Email or Username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="username"
            required
          />

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <button
            className={styles.submitButton}
            type="submit"
            disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Reset your password'}
          </button>
        </form>

        <div className={styles.divider}>
          <span />
          <p>OR</p>
          <span />
        </div>

        <Link className={styles.createLink} to="/signup">
          Create new account
        </Link>

        <Link className={styles.backLink} to="/login">
          Back to login
        </Link>
      </section>
    </main>
  )
}

export default ForgotPasswordPage
