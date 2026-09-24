// Отображает боковую навигацию приложения, загружает данные профиля и обрабатывает
// переходы, открытие панелей поиска и уведомлений, а также выход из учётной записи.
// Основные части: композиция интерфейса, свойства и обработчики взаимодействия.
import { useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../../../features/auth/model/authSlice'
import { fetchMyProfile } from '../../../entities/user/model/profileThunks'
import { useAppDispatch, useAppSelector } from '../../../app/providers/hooks'
import styles from './LeftSidebar.module.css'

const navItems = [
  { label: 'Explore', to: '/explore', icon: '/icons/explore.png' },
  { label: 'Messages', to: '/messages', icon: '/icons/messages.png' },
]

type LeftSidebarProps = {
  isSearchOpen?: boolean
  isNotificationsOpen?: boolean
  onSearchClick: () => void
  onNotificationsClick: () => void
}

// Отображает боковую панель навигации и связывает её кнопки с действиями приложения.
function LeftSidebar({
  isSearchOpen = false,
  isNotificationsOpen = false,
  onSearchClick,
  onNotificationsClick,
}: LeftSidebarProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { myProfile } = useAppSelector((state) => state.profile)
  const profileAvatar = myProfile?.avatar || '/icons/ICH_avatar.png'

  // Загружает данные текущего пользователя, чтобы показать его фотографию в навигации.
  useEffect(() => {
    dispatch(fetchMyProfile())
  }, [dispatch])

  // Завершает сессию пользователя и перенаправляет его на страницу входа.
  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  // Переключает маршрут сообщений: открывает его или возвращает на главную при повторном клике.
  const handleMessagesClick = () => {
    navigate(location.pathname === '/messages' ? '/' : '/messages')
  }

  return (
    <aside
      className={`${styles.sidebar} ${
        location.pathname === '/messages' ? styles.messagesSidebar : ''
      }`}>
      <NavLink className={styles.logoLink} to="/" aria-label="ICHgram home">
        <img
          className={styles.logo}
          src="/images/ICHGRAM_logo.png"
          alt="ICHGRAM"
        />
      </NavLink>

      <nav className={styles.nav} aria-label="Main navigation">
        <ul className={styles.navList}>
          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              to="/">
              <img
                className={styles.icon}
                src="/icons/home.png"
                alt=""
                aria-hidden="true"
              />
              <span>Home</span>
            </NavLink>
          </li>

          <li>
            <button
              className={`${styles.navLink} ${styles.navButton} ${
                isSearchOpen ? styles.active : ''
              }`}
              type="button"
              onClick={onSearchClick}>
              <img
                className={styles.icon}
                src="/icons/search.png"
                alt=""
                aria-hidden="true"
              />
              <span>Search</span>
            </button>
          </li>

          {navItems.map((item) => (
            <li key={item.label}>
              {item.to === '/messages' ? (
                <button
                  className={`${styles.navLink} ${styles.navButton} ${
                    location.pathname === '/messages' ? styles.active : ''
                  }`}
                  type="button"
                  onClick={handleMessagesClick}>
                  <img
                    className={styles.icon}
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </button>
              ) : (
                <NavLink
                  className={({ isActive }) =>
                    `${styles.navLink} ${isActive ? styles.active : ''}`
                  }
                  to={item.to}>
                  <img
                    className={styles.icon}
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}

          <li>
            <button
              className={`${styles.navLink} ${styles.navButton} ${
                isNotificationsOpen ? styles.active : ''
              }`}
              type="button"
              onClick={onNotificationsClick}>
              <img
                className={styles.icon}
                src="/icons/notification.png"
                alt=""
                aria-hidden="true"
              />
              <span>Notifications</span>
            </button>
          </li>

          <li>
            <NavLink
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              to="/create">
              <img
                className={styles.icon}
                src="/icons/create.png"
                alt=""
                aria-hidden="true"
              />
              <span>Create</span>
            </NavLink>
          </li>
        </ul>
      </nav>

      <NavLink
        className={({ isActive }) =>
          `${styles.profileLink} ${isActive ? styles.active : ''}`
        }
        to="/profile">
        <img
          className={styles.profileIcon}
          src={profileAvatar}
          alt=""
          aria-hidden="true"
        />
        <span>Profile</span>
      </NavLink>

      <button
        className={styles.logoutButton}
        type="button"
        onClick={handleLogout}>
        <img
          className={styles.logoutIcon}
          src="/icons/logout-icon.webp"
          alt=""
          aria-hidden="true"
        />
        <span>Log out</span>
      </button>
    </aside>
  )
}

export default LeftSidebar
