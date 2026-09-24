// Является корневым компонентом приложения: подключает общие стили и маршрутизацию.
import './styles/App.css'
import AppRoutes from './AppRoutes.tsx'

function App() {
  return (
    <div className="app">
      <AppRoutes />
    </div>
  )
}

export default App
