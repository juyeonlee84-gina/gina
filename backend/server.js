import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'
import restaurantsRouter from './routes/restaurants.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/restaurants', restaurantsRouter)

// 프로덕션: 빌드된 프론트엔드 파일 서빙
const frontendDist = join(__dirname, '../frontend/dist')
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  app.get('*', (req, res) => {
    res.sendFile(join(frontendDist, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)
})
