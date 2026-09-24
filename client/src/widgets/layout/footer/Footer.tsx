// Отображает нижний колонтитул приложения с навигационными ссылками и годом проекта.
// Основные части: композиция интерфейса, свойства и обработчики взаимодействия.
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Search', to: '/search' },
  { label: 'Explore', to: '/explore' },
  { label: 'Messages', to: '/messages' },
  { label: 'Notifications', to: '/notifications' },
  { label: 'Create', to: '/create' },
]

// Выполняет логику Footer в текущем модуле.
function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.nav} aria-label="Footer navigation">
        {footerLinks.map((link) => (
          <Link className={styles.link} key={link.label} to={link.to}>
            {link.label}
          </Link>
        ))}
      </nav>

      <p className={styles.copy}>© 2026 ICHgram</p>
    </footer>
  )
}

export default Footer
