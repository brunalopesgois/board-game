import { Controller, Get } from '@nestjs/common';
import { ResultInterface } from 'src/interfaces/result.interface';
import { GameService } from 'src/services/game.service';

@Controller('/game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('/simulate')
  public simulate(): ResultInterface {
    return this.gameService.simulate();
  }
}
