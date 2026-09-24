// Создаёт корневое React-приложение и подключает строгий режим, Redux-хранилище
// и маршрутизатор, доступные всем компонентам приложения.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App.tsx'
import './app/styles/fonts.css'
import './app/styles/index.css'
import store from './app/providers/store.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
