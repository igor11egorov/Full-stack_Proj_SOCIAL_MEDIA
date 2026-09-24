// Является корневым компонентом приложения: подключает общие стили и маршрутизацию.
// Основные части: запуск приложения, провайдеры, маршруты и общие настройки.
import './styles/App.css'
import AppRoutes from './AppRoutes.tsx'

// Выполняет логику App в текущем модуле.
function App() {
  return (
    <div className="app">
      <AppRoutes />
    </div>
  )
}

export default App
