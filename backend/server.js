import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import restaurantsRouter from './routes/restaurants.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/restaurants', restaurantsRouter)

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
})
