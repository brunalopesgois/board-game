import { Property } from './property.entity';

export class GameBoard {
  properties: Property[];

  constructor(data: Partial<GameBoard> = {}) {
    Object.assign(this, data);
  }
}
