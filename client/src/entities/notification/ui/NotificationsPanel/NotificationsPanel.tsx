// Отображает панель уведомлений, загружает их из API и позволяет помечать
// отдельные или все уведомления как прочитанные.
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from '../../model/notificationsThunks'
import { useAppDispatch, useAppSelector } from '../../../../app/providers/hooks'
import styles from './NotificationsPanel.module.css'

const getUserId = (
  user:
    | { _id?: string; id?: string; userId?: string }
    | string
    | null
    | undefined,
) =>
  typeof user === 'string' ? user : user?._id || user?.userId || user?.id || ''

// Возвращает вычисленные данные: SenderUsername.
const getSenderUsername = (notification: Notification) =>
  typeof notification.sender === 'string'
    ? ''
    : notification.sender.username || ''

// Возвращает вычисленные данные: SenderAvatar.
const getSenderAvatar = (notification: Notification) =>
  typeof notification.sender === 'string'
    ? '/icons/ICH_avatar.png'
    : notification.sender.avatar || '/icons/ICH_avatar.png'

// Возвращает вычисленные данные: NotificationAgeLabel.
const getNotificationAgeLabel = (createdAt: string) => {
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  )

  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)

  if (diffDays < 7) {
    return `${diffDays}d`
  }

  return `${Math.floor(diffDays / 7)}w`
}

// Возвращает вычисленные данные: NotificationAction.
const getNotificationAction = (notification: Notification) => {
  if (notification.type === 'like') {
    return 'liked your photo.'
  }

  if (notification.type === 'comment') {
    return 'commented your photo.'
  }

  return 'started following.'
}

// Возвращает вычисленные данные: NotificationPostImage.
const getNotificationPostImage = (notification: Notification) => {
  const post = notification.post

  if (!post || typeof post === 'string') {
    return ''
  }

  return post.images?.[0] || post.image || ''
}

// Выполняет логику NotificationsPanel в текущем модуле.
function NotificationsPanel() {
  const dispatch = useAppDispatch()
  const { items, status, error, unreadCount, updateStatus } = useAppSelector(
    (state) => state.notifications,
  )

  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  // Обрабатывает действие пользователя: NotificationClick.
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification._id))
    }
  }

  // Обрабатывает действие пользователя: MarkAllRead.
  const handleMarkAllRead = () => {
    if (unreadCount > 0 && updateStatus !== 'loading') {
      dispatch(markAllNotificationsAsRead())
    }
  }

  return (
    <section className={styles.notificationsPanel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Notifications</h2>
        {items.length > 0 && (
          <button
            className={styles.readAllButton}
            type="button"
            disabled={unreadCount === 0 || updateStatus === 'loading'}
            onClick={handleMarkAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <h3 className={styles.subtitle}>
        {unreadCount > 0 ? `New (${unreadCount})` : 'New'}
      </h3>

      {status === 'loading' && (
        <p className={styles.stateText}>Loading notifications...</p>
      )}

      {status === 'failed' && <p className={styles.errorText}>{error}</p>}

      {status === 'succeeded' && items.length === 0 && (
        <p className={styles.stateText}>No notifications yet.</p>
      )}

      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map((notification) => {
            const senderId = getUserId(notification.sender)
            const senderUsername = getSenderUsername(notification)
            const postImage = getNotificationPostImage(notification)

            if (!senderId || !senderUsername) {
              return null
            }

            return (
              <li
                className={`${styles.item} ${
                  notification.isRead ? '' : styles.unread
                }`}
                key={notification._id}>
                <Link
                  className={styles.avatarLink}
                  to={`/users/${senderId}`}
                  onClick={() => handleNotificationClick(notification)}>
                  <img
                    className={styles.avatar}
                    src={getSenderAvatar(notification)}
                    alt=""
                    aria-hidden="true"
                  />
                </Link>

                <button
                  className={styles.textButton}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}>
                  <span>{senderUsername}</span>{' '}
                  {getNotificationAction(notification)}{' '}
                  <time dateTime={notification.createdAt}>
                    {getNotificationAgeLabel(notification.createdAt)}
                  </time>
                </button>

                {postImage ? (
                  <img
                    className={styles.postImage}
                    src={postImage}
                    alt=""
                    aria-hidden="true"
                  />
                ) : (
                  <span className={styles.postImagePlaceholder} />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default NotificationsPanel
