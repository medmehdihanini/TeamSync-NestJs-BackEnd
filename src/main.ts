import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';

async function bootstrap() {

  const app = await NestFactory.create(AppModule,{cors:true});

 

  await app.listen(3001);
  app.enableCors({
    origin: [
      'http://localhost:3000'
    ],
    methods: ["GET", "POST"],
    credentials: true,
  });
  app.use(cors());
}
bootstrap();
