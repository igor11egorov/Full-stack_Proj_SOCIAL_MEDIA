// Является корневым компонентом приложения: подключает общие стили и маршрутизацию.
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
