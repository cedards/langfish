import * as Nes from "@hapi/nes/lib/client";
import {GameMembershipRepository, InMemoryGameMembershipRepository} from "./game-membership-repository";
import { GoFishGameState } from "@langfish/go-fish-engine";

export interface GoFishGameplayClientInterface {
  connect: () => Promise<void>
  disconnect: () => Promise<void>,
  isConnected: () => boolean,
  onSetPlayerId(callback: (name: string) => void): void
  onUpdateGameState(callback: (newState: GoFishGameState) => void): void
  joinGame(gameId: string): void
  renamePlayer(name: string): void
  draw(): void
  give(cardIds: Array<number>, recipientName: string): void
  score(cardIds: number[]): void
  hideOrShowCard(cardId: number): void;
  endTurn(): Promise<void>
  removePlayer(playerId: string): void
}

export function GoFishGameplayClient(
  websocketUrl: `ws://${string}` | `wss://${string}`,
  gameMembershipRepository: GameMembershipRepository = InMemoryGameMembershipRepository(),
): GoFishGameplayClientInterface {
  /* Connection management */
  const client = new Nes.Client(websocketUrl);
  let connected = false;
  let connectionPromise: Promise<void> | null = null;
  client.onConnect = () => { connected = true; };
  client.onDisconnect = () => { connected = false; };
  client.onError = err => { console.error("NES CLIENT ERROR:", err); };

  /* Client state */
  const setPlayerIdCallbacks: Array<(playerId: string) => void> = [];
  const updateGameStateCallbacks: Array<(newState: GoFishGameState) => void> = [];
  let playerId: string | null = null;
  let joinedGame: string | null = null;
  let latestGameState: GoFishGameState | null = null;

  async function useExistingPlayer(gameId: string) {
    return gameMembershipRepository.getPlayerIdFor(gameId);
  }

  async function createNewPlayer(gameId: string) {
    return (await client.request({
      path: `/gameplay/api/game/${gameId}/player`,
      method: "POST",
    })).payload.playerId;
  }

  function restoreGameFromLocalState() {
    return client.request({
      path: `/gameplay/api/game/${joinedGame}`,
      method: "POST",
      payload: {
        type: "RESTORE",
        gameState: latestGameState,
      },
    });
  }

  async function performGameAction(action: string, options: Record<string, unknown> = {}) {
    const request = {
      path: `/gameplay/api/game/${joinedGame}`,
      method: "POST",
      payload: {
        type: action,
        ...options,
      },
    };

    try {
      return await client.request(request);
    } catch(e) {
      if(e && (e as {statusCode: number}).statusCode === 404) {
        await restoreGameFromLocalState();
        return await client.request(request)
          .catch(e2 => console.error("Still received unsuccessful status from server after restoring the game:", e2));
      } else {
        console.error("Received unsuccessful status from server:", e);
        return null;
      }
    }
  }

  function updateGameState(gameState: GoFishGameState) {
    latestGameState = gameState;
    updateGameStateCallbacks.forEach(callback => callback(gameState));
  }

  return {
    async joinGame(gameId: string): Promise<void> {
      await client.subscribe(
        `/gameplay/api/game/${gameId}`,
        (payload) => { updateGameState((payload as { state: GoFishGameState }).state); },
      );
      joinedGame = gameId;

      playerId = await useExistingPlayer(gameId) || await createNewPlayer(gameId);
      gameMembershipRepository.savePlayerIdFor(gameId, playerId!);
      setPlayerIdCallbacks.forEach(callback => callback(playerId!));

      const gameState = (await client.request({
        path: `/gameplay/api/game/${gameId}`,
        method: "GET",
      })).payload;
      updateGameState(gameState);
    },

    renamePlayer(name: string): void {
      performGameAction("RENAME", {
        player: playerId,
        name: name,
      });
    },

    removePlayer(playerId: string): void {
      performGameAction("REMOVE_PLAYER", {
        player: playerId,
      });
    },

    async draw(): Promise<void> {
      await performGameAction("DRAW", {
        player: playerId,
      });
    },

    give(cardIds: Array<number>, recipientId: string): void {
      performGameAction("GIVE", {
        player: playerId,
        recipient: recipientId,
        cardIds,
      });
    },

    score(cardIds: number[]): void {
      performGameAction("SCORE", {
        player: playerId,
        cardIds,
      });
    },

    hideOrShowCard(cardId: number): void {
      performGameAction("SHOW_OR_HIDE_CARD", {
        player: playerId,
        card: cardId,
      });
    },

    async endTurn(): Promise<void> {
      performGameAction("END_TURN");
    },

    onSetPlayerId(callback: (name: string) => void): void {
      setPlayerIdCallbacks.push(callback);
    },

    onUpdateGameState(callback: (newState: GoFishGameState) => void): void {
      updateGameStateCallbacks.push(callback);
    },

    connect(): Promise<void> {
      if(connectionPromise) return connectionPromise;
      if(connected) return Promise.resolve();

      return connectionPromise = client.connect().then(() => {
        connectionPromise = null;
      }).catch(reason => {
        console.log("connection failed with:", reason);
      });
    },

    disconnect(): Promise<void> {
      return client.disconnect();
    },

    isConnected: () => connected,
  };
}
