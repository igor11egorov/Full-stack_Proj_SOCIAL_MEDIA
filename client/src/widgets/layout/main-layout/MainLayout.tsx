// Формирует основной макет авторизованной части приложения с навигацией, контентом и футером,
// а также управляет открытием боковых панелей поиска и уведомлений.
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Footer from '../footer/Footer'
import LeftSidebar from '../left-sidebar/LeftSidebar'
import NotificationsPanel from '../../../entities/notification/ui/NotificationsPanel/NotificationsPanel'
import OverlayPanel from '../overlay-panel/OverlayPanel'
import SearchPanel from '../../../features/search/ui/SearchPanel/SearchPanel'
import styles from './MainLayout.module.css'

function MainLayout() {
  const [activePanel, setActivePanel] = useState<
    'search' | 'notifications' | null
  >(null)

  const closePanel = () => {
    setActivePanel(null)
  }

  const togglePanel = (panel: 'search' | 'notifications') => {
    setActivePanel((currentPanel) => (currentPanel === panel ? null : panel))
  }

  return (
    <div className={styles.layout}>
      <LeftSidebar
        isSearchOpen={activePanel === 'search'}
        isNotificationsOpen={activePanel === 'notifications'}
        onSearchClick={() => togglePanel('search')}
        onNotificationsClick={() => togglePanel('notifications')}
      />
      <main className={styles.content}>
        <div className={styles.pageContent}>
          <Outlet />
        </div>
        <Footer />
      </main>

      {activePanel === 'search' && (
        <OverlayPanel onClose={closePanel}>
          <SearchPanel onClose={closePanel} />
        </OverlayPanel>
      )}

      {activePanel === 'notifications' && (
        <OverlayPanel onClose={closePanel}>
          <NotificationsPanel />
        </OverlayPanel>
      )}
    </div>
  )
}

export default MainLayout
