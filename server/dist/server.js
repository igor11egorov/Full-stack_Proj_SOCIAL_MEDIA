// Запускает HTTP-сервер и подключает настроенное Express-приложение.
import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './db/db.js';
const startServer = async () => {
    try {
        await connectDB();
        const server = http.createServer(app);
        server.listen(env.port, () => {
            console.log(`Server is running on http://localhost:${env.port}`);
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to start server:', message);
        process.exit(1);
    }
};
startServer();
export default app;
