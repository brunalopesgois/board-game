import { NestFactory } from '@nestjs/core';
import { GameModule } from './modules/game.module';

async function bootstrap() {
  const app = await NestFactory.create(GameModule, {
    logger: console,
  });
  await app.listen(8080);
}
bootstrap();
