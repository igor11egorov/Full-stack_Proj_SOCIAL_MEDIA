// Создаёт универсальную выдвижную панель поверх страницы и закрывает её по клику на фон
// или нажатию клавиши Escape, отображая переданное дочернее содержимое.
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import styles from './OverlayPanel.module.css'

type OverlayPanelProps = {
  children: ReactNode
  onClose: () => void
}

function OverlayPanel({ children, onClose }: OverlayPanelProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className={styles.overlay}>
      <button
        className={styles.backdrop}
        type="button"
        aria-label="Close panel"
        onClick={onClose}
      />

      <aside className={styles.panel}>
        <button
          className={styles.closeButton}
          type="button"
          aria-label="Close panel"
          onClick={onClose}
        />

        {children}
      </aside>
    </div>
  )
}

export default OverlayPanel
