import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '../../lib/db'
import { jobs, jobStatuses, type JobStatus } from '../../lib/db/schema'
import type { CreateJobDto } from './jobs.dto'

@Injectable()
export class JobsService {
  list(status?: JobStatus) {
    return db.select().from(jobs).where(status ? eq(jobs.status, status) : undefined).orderBy(desc(jobs.createdAt))
  }

  async create(input: CreateJobDto) {
    const [job] = await db.insert(jobs).values(input).returning()
    return job
  }

  async remove(id: string) {
    const [job] = await db.delete(jobs).where(eq(jobs.id, id)).returning({ id: jobs.id })
    if (!job) throw new NotFoundException('Job not found')
    return { deleted: true, id: job.id }
  }

  async updateStatus(id: string, status: JobStatus) {
    if (!jobStatuses.includes(status)) throw new BadRequestException('Invalid job status')
    const [job] = await db.update(jobs).set({ status, updatedAt: new Date() }).where(and(eq(jobs.id, id), eq(jobs.status, 'pending'))).returning()
    if (!job) throw new NotFoundException('Job not found or status transition is not allowed')
    return job
  }
}
