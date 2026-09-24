// Отображает модальное окно со списком подписчиков или подписок пользователя,
// поддерживая загрузку данных, ошибки, закрытие окна и отписку.
// Основные части: композиция интерфейса, свойства и обработчики взаимодействия.
import { Link } from 'react-router-dom'
import type { User } from '../../entities/user/types/user'
import styles from './SubscriptionsModal.module.css'

type SubscriptionsModalProps = {
  title: string
  users: User[]
  isLoading: boolean
  isActionLoading?: boolean
  error: string | null
  showUnfollowButton?: boolean
  onUnfollowUser?: (userId: string) => void
  onClose: () => void
}

// Возвращает вычисленные данные: UserId.
const getUserId = (user: User) => user._id || user.userId || user.id || ''

// Выполняет логику SubscriptionsModal в текущем модуле.
function SubscriptionsModal({
  title,
  users,
  isLoading,
  isActionLoading = false,
  error,
  showUnfollowButton = false,
  onUnfollowUser,
  onClose,
}: SubscriptionsModalProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close subscriptions modal"
        onClick={onClose}
      />

      <section className={styles.modal}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}>
            x
          </button>
        </header>

        <div className={styles.body}>
          {isLoading && <p className={styles.stateText}>Loading...</p>}

          {!isLoading && error && <p className={styles.errorText}>{error}</p>}

          {!isLoading && !error && users.length === 0 && (
            <p className={styles.stateText}>No users found.</p>
          )}

          {!isLoading && !error && users.length > 0 && (
            <ul className={styles.usersList}>
              {users.map((user) => {
                // Хранит значение «userId», необходимое для текущего логического блока.
                const userId = getUserId(user)
                // Хранит значение «avatar», необходимое для текущего логического блока.
                const avatar = user.avatar || '/icons/ICH_avatar.png'

                return (
                  <li className={styles.userRow} key={userId || user.username}>
                    <Link
                      className={styles.userLink}
                      to={`/users/${userId}`}
                      onClick={onClose}>
                      <img src={avatar} alt="" />
                      <span>
                        <strong>{user.username}</strong>
                        {user.fullName && <small>{user.fullName}</small>}
                      </span>
                    </Link>
                    {showUnfollowButton && userId && (
                      <button
                        className={styles.unfollowButton}
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => onUnfollowUser?.(userId)}>
                        Unfollow
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

export default SubscriptionsModal
