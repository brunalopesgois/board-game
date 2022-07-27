import { BehaviorType } from '../enums/behavior-type.enum';

export class Player {
  balance: number;
  behavior: BehaviorType;
  position: number;
  busted: boolean;

  constructor(data: Partial<Player> = {}) {
    Object.assign(this, data);
  }
}
