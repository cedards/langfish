import { Server } from "@hapi/hapi";
import * as Nes from "@hapi/nes";
import { GameRepository, GoFishGame, GoFishGameState } from "@langfish/go-fish-engine";

export const GoFishGameplayPlugin = {
  name: "go-fish-gameplay-plugin",
  register: async function (
    server: Server,
    options: {
      gameRepository: GameRepository
    },
  ): Promise<void> {
    await server.register(Nes);

    async function publishNewGameState(gameId: string) {
      const game = await options.gameRepository.getGame(gameId);
      if(!game) throw new Error(`Cannot publish new game state for game ${gameId} because it is not in the repository`);
      server.publish(`/gameplay/api/game/${gameId}`, {
        type: 'UPDATE_GAME_STATE',
        state: game.currentState(),
      });
    }

    server.route({
      method: 'GET',
      path: `/gameplay/api/game/{gameId}`,
      options: {
        id: 'getGameState',
        handler: async (request) => {
          const game = await options.gameRepository
            .getGame(request.params["gameId"]);
          if (!game) throw new Error(`Cannot get game state, no game with id ${request.params["gameId"]}`);
          return game.currentState();
        },
      },
    });

    server.route({
      method: 'POST',
      path: `/gameplay/api/game/{gameId}`,
      options: {
        id: 'performGameAction',
        handler: async (request, h) => {
          const payload = request.payload as GameActionPayload;
          const gameId = request.params["gameId"];

          if(payload.type === "RESTORE") {
            await options.gameRepository.updateGame(
              gameId,
              GoFishGame(
                payload.gameState.deck,
                payload.gameState.players,
                payload.gameState.currentTurn,
              ),
            );
          }
          const game = await options.gameRepository.getGame(gameId);
          if(!game) return h.response({}).code(404);

          switch (payload.type) {
            case "RENAME":
              game.renamePlayer(payload.player, payload.name);
              await publishNewGameState(gameId);
              break;
            case "DRAW":
              game.draw(payload.player);
              await publishNewGameState(gameId);
              break;
            case "GIVE":
              payload.cardIds.forEach((cardId: number) => {
                game.give(payload.player, payload.recipient, cardId);
              });
              await publishNewGameState(gameId);
              break;
            case "SCORE":
              game.score(payload.player, payload.cardIds);
              await publishNewGameState(gameId);
              break;
            case "SHOW_OR_HIDE_CARD":
              game.showOrHideCard(payload.card);
              await publishNewGameState(gameId);
              break;
            case "END_TURN":
              game.endTurn();
              await publishNewGameState(gameId);
              break;
            case "REMOVE_PLAYER":
              game.removePlayer(payload.player);
              await publishNewGameState(gameId);
              break;
          }
          return true;
        },
      },
    });

    server.route({
      method: 'POST',
      path: `/gameplay/api/game/{gameId}/player`,
      options: {
        id: 'addPlayerToGame',
        handler: async (request) => {
          const game = await options.gameRepository.getGame(request.params["gameId"]);
          if(!game) throw new Error(`Cannot add player, no game with id ${request.params["gameId"]}`);
          const playerId = game.addPlayer();
          await publishNewGameState(request.params["gameId"]);
          return { playerId: playerId };
        },
      },
    });

    server.subscription('/gameplay/api/game/{gameId}');
  },
};

type GameActionPayload = GameActionRestorePayload
  | GameActionRename
  | GameActionDraw
  | GameActionGive
  | GameActionScore
  | GameActionShowHideCard
  | GameActionEndTurn
  | GameActionRemovePlayer;

interface GameActionRestorePayload {
  type: "RESTORE";
  gameState: GoFishGameState;
}

interface GameActionRename {
  type: "RENAME";
  player: string;
  name: string;
}

interface GameActionDraw {
  type: "DRAW";
  player: string;
}

interface GameActionGive {
  type: "GIVE";
  player: string;
  recipient: string;
  cardIds: number[];
}

interface GameActionScore {
  type: "SCORE";
  player: string;
  cardIds: number[];
}

interface GameActionShowHideCard {
  type: "SHOW_OR_HIDE_CARD";
  player: string;
  card: number;
}

interface GameActionEndTurn {
  type: "END_TURN";
  player: string;
}

interface GameActionRemovePlayer {
  type: "REMOVE_PLAYER";
  player: string;
}
