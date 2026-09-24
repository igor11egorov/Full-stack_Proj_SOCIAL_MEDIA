// Отображает панель поиска пользователей, выполняет запрос с задержкой ввода
// и показывает найденные профили с возможностью перейти к выбранному пользователю.
// Основные части: логика пользовательского сценария и запросы к API.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { clearSearchResults } from '../../model/searchSlice'
import { searchUsers } from '../../model/searchThunks'
import { useAppDispatch, useAppSelector } from '../../../../app/providers/hooks'
import styles from './SearchPanel.module.css'

const getUserId = (
  user: { _id?: string; id?: string; userId?: string } | null | undefined,
) => user?._id || user?.userId || user?.id || ''

type SearchPanelProps = {
  onClose?: () => void
}

// Выполняет логику SearchPanel в текущем модуле.
function SearchPanel({ onClose }: SearchPanelProps) {
  const dispatch = useAppDispatch()
  const { users, status, error } = useAppSelector((state) => state.search)

  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    const query = searchValue.trim()

    if (!query) {
      dispatch(clearSearchResults())
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch(searchUsers(query))
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [dispatch, searchValue])

  // Обрабатывает действие пользователя: Clear.
  const handleClear = () => {
    setSearchValue('')
    dispatch(clearSearchResults())
  }

  // Обрабатывает действие пользователя: UserClick.
  const handleUserClick = () => {
    handleClear()
    onClose?.()
  }

  return (
    <section className={styles.searchPanel}>
      <h2 className={styles.title}>Search</h2>

      <label className={styles.searchField}>
        <span className={styles.visuallyHidden}>Search</span>
        <input
          className={styles.input}
          type="text"
          placeholder="Search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />

        {searchValue && (
          <button
            className={styles.clearButton}
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
          />
        )}
      </label>

      {searchValue.trim() && (
        <div className={styles.recentBlock}>
          <h3 className={styles.subtitle}>Results</h3>

          {status === 'loading' && (
            <p className={styles.stateText}>Searching...</p>
          )}

          {status === 'failed' && <p className={styles.errorText}>{error}</p>}

          {status === 'succeeded' && users.length === 0 && (
            <p className={styles.stateText}>No users found.</p>
          )}

          {users.map((user) => (
            <Link
              className={styles.userButton}
              key={getUserId(user)}
              to={`/users/${getUserId(user)}`}
              onClick={handleUserClick}>
              <img
                className={styles.avatar}
                src={user.avatar || '/icons/ICH_avatar.png'}
                alt=""
                aria-hidden="true"
              />
              <span>{user.username}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

export default SearchPanel
