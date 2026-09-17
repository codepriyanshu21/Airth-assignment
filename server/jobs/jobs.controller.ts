import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { IsIn } from 'class-validator'
import { jobStatuses, type JobStatus } from '../../lib/db/schema'
import { JobsService } from './jobs.service'
import { CreateJobDto } from './jobs.dto'

class StatusDto {
  @IsIn(jobStatuses)
  status!: JobStatus
}

 @Controller('jobs')
 export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  list(@Query('status') status?: JobStatus) { return this.jobsService.list(status) }

  @Post()
  create(@Body() body: CreateJobDto) { return this.jobsService.create(body) }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.jobsService.remove(id) }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: StatusDto) { return this.jobsService.updateStatus(id, body.status) }
}
