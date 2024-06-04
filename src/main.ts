import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { envs } from './config/envs';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP, //el tipo de comunicación
      options: {
        port: envs.port //el port en el que corre el microservicio
      }
    }
  );


  const logger = new Logger("Main")

  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
   );


  await app.listen();
  logger.log(`Products Microservices running on port ${envs.port}`)
}
bootstrap();
