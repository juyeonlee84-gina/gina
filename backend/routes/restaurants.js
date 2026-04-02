import { Router } from 'express'
import multer from 'multer'
import pool from '../db.js'

const router = Router()

// 사진을 메모리에 받아서 base64로 DB에 저장 (외부 서비스 불필요)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('이미지 파일만 업로드 가능합니다.'))
  }
})

const fileToBase64 = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString('base64')}`

// 목록 조회 (사진은 목록에서 제외해 응답 속도 개선)
router.get('/', async (req, res) => {
  try {
    const { q, category, region, rating, sort = 'created_at', order = 'desc' } = req.query
    const conditions = []
    const params = []
    let i = 1

    if (q) {
      conditions.push(`(name ILIKE $${i} OR memo ILIKE $${i} OR address ILIKE $${i})`)
      params.push(`%${q}%`)
      i++
    }
    if (category) { conditions.push(`category = $${i++}`); params.push(category) }
    if (region) { conditions.push(`region = $${i++}`); params.push(region) }
    if (rating) { conditions.push(`rating >= $${i++}`); params.push(Number(rating)) }

    const allowedSort = { created_at: 'created_at', rating: 'rating', name: 'name' }
    const sortCol = allowedSort[sort] || 'created_at'
    const sortDir = order === 'asc' ? 'ASC' : 'DESC'
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const { rows } = await pool.query(
      `SELECT id, name, category, region, address, phone, rating, memo, photo, lat, lng, tags, created_at, updated_at
       FROM restaurants ${where} ORDER BY ${sortCol} ${sortDir}`,
      params
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 메타 - 카테고리
router.get('/meta/categories', async (req, res) => {
  const { rows } = await pool.query(`SELECT DISTINCT category FROM restaurants ORDER BY category`)
  res.json(rows.map(r => r.category))
})

// 메타 - 지역
router.get('/meta/regions', async (req, res) => {
  const { rows } = await pool.query(`SELECT DISTINCT region FROM restaurants ORDER BY region`)
  res.json(rows.map(r => r.region))
})

// 단건 조회
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM restaurants WHERE id = $1`, [req.params.id])
  if (!rows[0]) return res.status(404).json({ error: '맛집을 찾을 수 없습니다.' })
  res.json(rows[0])
})

// 등록
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, category, region, address, phone, rating, memo, lat, lng, tags } = req.body
    if (!name || !category || !region) {
      return res.status(400).json({ error: '이름, 카테고리, 지역은 필수입니다.' })
    }

    const photo = req.file ? fileToBase64(req.file) : null
    const tagList = tags ? JSON.parse(tags) : []

    const { rows } = await pool.query(`
      INSERT INTO restaurants (name, category, region, address, phone, rating, memo, photo, lat, lng, tags)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
    `, [name, category, region, address || null, phone || null, Number(rating) || 0,
      memo || null, photo, lat ? Number(lat) : null, lng ? Number(lng) : null, tagList])

    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 수정
router.put('/:id', upload.single('photo'), async (req, res) => {
  try {
    const { rows: existing } = await pool.query(`SELECT * FROM restaurants WHERE id = $1`, [req.params.id])
    if (!existing[0]) return res.status(404).json({ error: '맛집을 찾을 수 없습니다.' })
    const old = existing[0]

    const { name, category, region, address, phone, rating, memo, lat, lng, tags } = req.body
    const photo = req.file ? fileToBase64(req.file) : old.photo
    const tagList = tags !== undefined ? JSON.parse(tags) : old.tags

    const { rows } = await pool.query(`
      UPDATE restaurants
      SET name=$1, category=$2, region=$3, address=$4, phone=$5, rating=$6,
          memo=$7, photo=$8, lat=$9, lng=$10, tags=$11, updated_at=NOW()
      WHERE id=$12 RETURNING *
    `, [
      name ?? old.name, category ?? old.category, region ?? old.region,
      address !== undefined ? address : old.address,
      phone !== undefined ? phone : old.phone,
      rating !== undefined ? Number(rating) : old.rating,
      memo !== undefined ? memo : old.memo,
      photo,
      lat !== undefined ? Number(lat) : old.lat,
      lng !== undefined ? Number(lng) : old.lng,
      tagList, req.params.id
    ])

    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT id FROM restaurants WHERE id = $1`, [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: '맛집을 찾을 수 없습니다.' })
    await pool.query(`DELETE FROM restaurants WHERE id = $1`, [req.params.id])
    res.json({ message: '삭제되었습니다.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
