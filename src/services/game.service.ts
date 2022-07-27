import { Injectable, Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';

import { GameBoard } from '../entities/game-board.entity';
import { Property } from '../entities/property.entity';
import { ResultInterface } from '../interfaces/result.interface';
import { Player } from '../entities/player.entity';
import { BehaviorType } from '../enums/behavior-type.enum';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  public simulate(): ResultInterface {
    const gameBoard: GameBoard = new GameBoard();
    gameBoard.properties = this.defineProperties();

    this.logger.debug('Gameboard properties:', gameBoard);

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
    let orderedPlayers = players.sort(() => 0.5 - Math.random());
    let round = 0;
    const busteds: string[] = [];
    let continueGame = true;

    this.logger.debug('Players order:', orderedPlayers);

    while (continueGame) {
      for (const player of orderedPlayers) {
        let { properties } = gameBoard;

        if (!player.busted) {
          const moveForward = faker.datatype.number({
            min: 1,
            max: 6,
          });

          this.logger.debug('Dice:', moveForward);

          player.position =
            player.position + moveForward < 20
              ? player.position + moveForward
              : 0 + moveForward;

          this.logger.debug(
            `Player ${player.behavior} moved to position: `,
            player.position,
          );

          if (properties[player.position].owner !== null) {
            orderedPlayers = this.payRent(
              player,
              orderedPlayers,
              properties[player.position],
              busteds,
            );
          }
          if (properties[player.position].owner === null) {
            properties[player.position].owner = this.willBuyProperty(
              properties[player.position],
              player,
            );
          }

          if (player.busted) {
            properties = this.removeProperties(player.behavior, properties);
          }
        } else {
          ++round;

          if (busteds.length == 3 || round >= 999) {
            continueGame = false;
          }
        }

        gameBoard.properties = properties;
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

    this.logger.debug('Rounds played:', round);
    this.logger.debug('Final snapshot gameboard:', JSON.stringify(gameBoard));
    this.logger.debug('Final snapshot players:', orderedByBalance);

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
      this.logger.debug(
        `Player ${player.behavior} buyed property with value: ${property.salePrice}. Balance left:`,
        player.balance,
      );
      return player;
    }

    if (player.behavior == BehaviorType.DEMANDING) {
      if (property.rent > 50) {
        player.balance -= property.salePrice;
        this.logger.debug(
          `Player ${player.behavior} buyed property with value: ${property.salePrice}. Balance left:`,
          player.balance,
        );
        return player;
      }
      return null;
    }

    if (player.behavior == BehaviorType.CAUTIOUS) {
      const finalBudget = player.balance - property.salePrice;
      if (finalBudget >= 80) {
        player.balance -= property.salePrice;
        this.logger.debug(
          `Player ${player.behavior} buyed property with value: ${property.salePrice}. Balance left:`,
          player.balance,
        );
        return player;
      }
      return null;
    }

    if (player.behavior == BehaviorType.RANDOM) {
      if (Math.random() < 0.5) {
        player.balance -= property.salePrice;
        this.logger.debug(
          `Player ${player.behavior} buyed property with value: ${property.salePrice}. Balance left:`,
          player.balance,
        );
        return player;
      }
      return null;
    }
  }

  private payRent(
    currentPlayer: Player,
    players: Player[],
    property: Property,
    busteds: string[],
  ): Player[] {
    if (currentPlayer.balance - property.rent < 0) {
      const index = players.indexOf(currentPlayer);
      players[index].busted = true;
      busteds.push(currentPlayer.behavior);
      this.logger.debug(
        `Player ${currentPlayer.behavior} can't pay rent. Rent value: ${property.rent}. Player balance: ${currentPlayer.balance} Current status: busted`,
        currentPlayer.busted,
      );
      players[index].balance = 0;
    } else {
      let index = players.indexOf(currentPlayer);
      players[index].balance -= property.rent;
      this.logger.debug(
        `Player ${currentPlayer.behavior} have to pay the rent for ${property.owner?.behavior} property. Balance left`,
        currentPlayer.balance,
      );
      index = players.indexOf(property.owner);
      players[index].balance += property.rent;
      this.logger.debug(
        `Owner ${players[index].behavior} balance after receive rent:`,
        players[index].balance,
      );
    }

    return players;
  }

  private removeProperties(
    playerName: string,
    properties: Property[],
  ): Property[] {
    properties.forEach((property) => {
      if (property.owner?.behavior === playerName) {
        property.owner = null;
      }
    });

    return properties;
  }
}
