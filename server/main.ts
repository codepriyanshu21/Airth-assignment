import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ensureDatabaseSchema } from '../lib/db'

async function bootstrap() {
  await ensureDatabaseSchema()
  const app = await NestFactory.create(AppModule)
  app.enableCors({ origin: ['http://localhost:3000', process.env.WEB_ORIGIN ?? 'http://localhost:5173'], credentials: true })
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  await app.listen(Number(process.env.PORT ?? process.env.NEST_PORT ?? 4000), '0.0.0.0')
}

void bootstrap()

export { bootstrap }
