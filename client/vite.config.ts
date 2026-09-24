// Настраивает Vite для клиентского приложения: подключает React и Babel,
// а также задаёт параметры локального сервера разработки.
import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    host: true,
    port: 5173,
  },
})
