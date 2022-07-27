import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';

import { GameBoard } from '../entities/game-board.entity';
import { Property } from '../entities/property.entity';
import { ResultInterface } from '../interfaces/result.interface';
import { Player } from '../entities/player.entity';
import { BehaviorType } from '../enums/behavior-type.enum';

@Injectable()
export class GameService {
  //TODO: fazer logs eficientes para validar o comportamento
  public simulate(): ResultInterface {
    const gameBoard: GameBoard = new GameBoard();
    gameBoard.properties = this.defineProperties();

    const cautiousPlayer = new Player({
      balance: 300,
      behavior: BehaviorType.CAUTIOUS,
      position: 0,
      busted: false,
    });
    const randomPlayer = new Player({
      balance: 300,
      behavior: BehaviorType.RANDOM,
      position: 0,
      busted: false,
    });
    const demandingPlayer = new Player({
      balance: 300,
      behavior: BehaviorType.DEMANDING,
      position: 0,
      busted: false,
    });
    const impulsivePlayer = new Player({
      balance: 300,
      behavior: BehaviorType.IMPULSIVE,
      position: 0,
      busted: false,
    });

    const { winner, players } = this.play(gameBoard, [
      cautiousPlayer,
      randomPlayer,
      demandingPlayer,
      impulsivePlayer,
    ]);

    return {
      winner,
      players,
    };
  }

  private defineProperties(): Property[] {
    const properties: Property[] = [];
    for (let i = 0; i < 20; i++) {
      properties.push({
        rent: faker.datatype.number({
          min: 1,
          max: 100,
        }),
        salePrice: faker.datatype.number({
          min: 101,
          max: 300,
        }),
        owner: null,
      });
    }

    return properties;
  }

  private play(gameBoard: GameBoard, players: Player[]): ResultInterface {
    const orderedPlayers = players.sort(() => 0.5 - Math.random());
    let round = 0;
    const busteds: string[] = [];
    let continueGame = true;

    while (continueGame) {
      for (const player of orderedPlayers) {
        const { properties } = gameBoard;

        if (!player.busted) {
          const moveForward = faker.datatype.number({
            min: 1,
            max: 6,
          });
          player.position =
            player.position + moveForward < 20
              ? player.position + moveForward
              : 0 + moveForward;
          if (properties[player.position].owner !== null) {
            if (player.balance - properties[player.position].rent < 0) {
              player.busted = true;
              busteds.push(player.behavior);
            } else {
              player.balance -= properties[player.position].rent;
            }
          }
          if (properties[player.position].owner === null) {
            properties[player.position].owner = this.willBuyProperty(
              properties[player.position],
              player,
            );
          }
        } else {
          ++round;

          if (busteds.length == 3 || round >= 999) {
            continueGame = false;
          }
        }
      }
    }

    if (round >= 999) {
      const resultOrderPlayers = orderedPlayers.map(
        (player) => player.behavior,
      );

      return {
        winner: resultOrderPlayers[0],
        players: resultOrderPlayers,
      };
    }

    const orderedByBalance = orderedPlayers.sort(
      (a, b) => b.balance - a.balance,
    );

    const resultOrderPlayers = orderedByBalance.map(
      (player) => player.behavior,
    );

    return {
      winner: resultOrderPlayers[0],
      players: resultOrderPlayers,
    };
  }

  private willBuyProperty(property: Property, player: Player): Player | null {
    if (player.balance < property.salePrice) {
      return null;
    }

    if (player.behavior == BehaviorType.IMPULSIVE) {
      player.balance -= property.salePrice;
      return player;
    }

    if (player.behavior == BehaviorType.DEMANDING) {
      if (property.rent > 50) {
        player.balance -= property.salePrice;
        return player;
      }
      return null;
    }

    if (player.behavior == BehaviorType.CAUTIOUS) {
      const finalBudget = player.balance - property.salePrice;
      if (finalBudget >= 80) {
        player.balance -= property.salePrice;
        return player;
      }
      return null;
    }

    if (player.behavior == BehaviorType.RANDOM) {
      if (Math.random() < 0.5) {
        player.balance -= property.salePrice;
        return player;
      }
      return null;
    }
  }
}
