import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 헬스체크는 DB와 무관하게 즉시 응답
app.get('/health', (req, res) => res.json({ status: 'ok' }))

// 서버를 먼저 시작한 후 DB 초기화
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`)

  // DB와 라우터는 서버 시작 후 비동기로 연결
  import('./routes/restaurants.js').then(({ default: restaurantsRouter }) => {
    app.use('/api/restaurants', restaurantsRouter)

    // 프로덕션: 프론트엔드 정적 파일 서빙
    const frontendDist = join(__dirname, '../frontend/dist')
    if (existsSync(frontendDist)) {
      app.use(express.static(frontendDist))
      app.get('*', (req, res) => {
        res.sendFile(join(frontendDist, 'index.html'))
      })
    }

    console.log('라우터 및 DB 초기화 완료')
  }).catch(err => {
    console.error('초기화 오류:', err.message)
  })
})
