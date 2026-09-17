import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Job = typeof jobs.$inferSelect
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'
export const jobStatuses: JobStatus[] = ['pending', 'running', 'completed', 'failed']
