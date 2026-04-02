import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

const isProduction = process.env.NODE_ENV === 'production'

const pool = isProduction
  ? new Pool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: Number(process.env.PGPORT) || 5432,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      connectionString: process.env.DATABASE_URL
    })

await pool.query(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    region TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    rating NUMERIC(2,1) DEFAULT 0,
    memo TEXT,
    photo TEXT,
    lat NUMERIC(10,7),
    lng NUMERIC(10,7),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`)

export default pool
