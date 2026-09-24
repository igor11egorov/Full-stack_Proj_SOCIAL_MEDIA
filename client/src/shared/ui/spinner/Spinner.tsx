// Отображает доступный индикатор загрузки с настраиваемым текстом состояния.
import styles from './Spinner.module.css'

type SpinnerProps = {
  label?: string
}

// Выполняет логику Spinner в текущем модуле.
function Spinner({ label = 'Loading...' }: SpinnerProps) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  )
}

export default Spinner
