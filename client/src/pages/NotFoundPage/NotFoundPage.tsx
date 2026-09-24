// Отображает страницу ошибки 404, когда пользователь переходит по несуществующему маршруту.
import styles from './NotFoundPage.module.css'

// Выполняет логику NotFoundPage в текущем модуле.
function NotFoundPage() {
  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <img
          className={styles.image}
          src="/images/Background.png"
          alt=""
          aria-hidden="true"
        />

        <div className={styles.textBlock}>
          <h1 className={styles.title}>Oops! Page Not Found (404 Error)</h1>
          <p className={styles.description}>
            We&apos;re sorry, but the page you&apos;re looking for doesn&apos;t
            seem to exist.
            <br />
            If you typed the URL manually, please double-check the spelling.
            <br />
            If you clicked on a link, it may be outdated or broken.
          </p>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage
