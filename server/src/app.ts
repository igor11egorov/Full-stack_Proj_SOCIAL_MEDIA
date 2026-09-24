// Настраивает Express-приложение: подключает middleware, маршруты и обработчики ошибок.
// Основные части: экспортируемая логика и зависимости модуля.
import cors from "cors"
import type { Request, Response } from "express"
import express from "express"
import { errorHandler } from "./middlewares/errorHandler.js"
import { notFound } from "./middlewares/notFound.js"
import authRoutes from "./routes/authRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"
import likeRoutes from "./routes/likeRoutes.js"
import notificationsRoutes from "./routes/notificationRoutes.js"
import postRoutes from "./routes/postRoutes.js"
import subscriptionRoutes from "./routes/subscribeRoutes.js"
import userRoutes from "./routes/userRoutes.js"

const app = express()

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.use(express.json())

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server Express is running",
  })
})

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/likes", likeRoutes)
app.use("/api/comments", commentRoutes)
app.use("/api/subscriptions", subscriptionRoutes)
app.use("/api/notifications", notificationsRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
