import { Player } from './player.entity';

export class Property {
  rent: number;
  salePrice: number;
  owner?: Player;

  constructor(data: Partial<Property> = {}) {
    Object.assign(this, data);
  }
}
