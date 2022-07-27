import { Module } from '@nestjs/common';
import { GameController } from 'src/controllers/game.controller';
import { GameService } from 'src/services/game.service';

@Module({
  imports: [],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
