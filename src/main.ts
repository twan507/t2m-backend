import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
require('dotenv').config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Sửa lỗi CORS, trường origin dùng để định nghĩa các domain có thể truy cập backend
  app.enableCors({
    "origin": true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    credentials: true
  });


  await app.listen(process.env.PORT);
}
bootstrap();
