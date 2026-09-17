import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool, { schema })

export async function ensureDatabaseSchema() {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS jobs (
			id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
			title text NOT NULL,
			description text NOT NULL,
			status text NOT NULL DEFAULT 'pending',
			created_at timestamptz NOT NULL DEFAULT now(),
			updated_at timestamptz NOT NULL DEFAULT now()
		)
	`)
}
