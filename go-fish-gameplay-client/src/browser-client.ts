import * as Nes from "@hapi/nes/lib/client";
import {GameMembershipRepository, InMemoryGameMembershipRepository} from "./game-membership-repository";

export interface GoFishGameplayClientInterface {
    connect: () => Promise<void>
    disconnect: () => Promise<void>
    onSetPlayerId(callback: (name) => void): void
    onUpdateGameState(callback: (newState) => void): void
    createGame(template: Array<{ value: string, image?: string }>): Promise<string>
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
    websocketUrl: string,
    gameMembershipRepository: GameMembershipRepository = InMemoryGameMembershipRepository()
): GoFishGameplayClientInterface {
    const client = new Nes.Client(websocketUrl)
    const setPlayerIdCallbacks: Array<(name) => void> = []
    const updateGameStateCallbacks: Array<(GameState) => void> = []
    let playerId: string | null = null
    let joinedGame: string | null = null

    let connectionPromise: Promise<void> | null = null
    const isConnected = () => !!client.id

    async function useExistingPlayer(gameId) {
        return gameMembershipRepository.getPlayerIdFor(gameId)
    }

    async function createNewPlayer(gameId) {
        return (await client.request({
            path: `/api/game/${gameId}/player`,
            method: "POST"
        })).payload.playerId
    }

    function performGameAction(action: string, options: Record<string, unknown> = {}) {
        client.request({
            path: `/api/game/${joinedGame}`,
            method: "POST",
            payload: {
                type: action,
                ...options
            }
        })
    }

    return {
        createGame(template: Array<{ value: string; image?: string }>): Promise<string> {
            return client.request({
                path: `/api/game`,
                method: "POST",
                payload: { template: template },
            }).then((response) => {
                return response.payload
            })
        },

        async joinGame(gameId: string): Promise<void> {
            await client.subscribe(`/api/game/${gameId}`, payload => {
                updateGameStateCallbacks.forEach(callback => callback(payload.state))
            })
            joinedGame = gameId

            playerId = await useExistingPlayer(gameId) || await createNewPlayer(gameId)
            gameMembershipRepository.savePlayerIdFor(gameId, playerId)
            setPlayerIdCallbacks.forEach(callback => callback(playerId))

            const getGameStateResponse = await client.request({
                path: `/api/game/${gameId}`,
                method: "GET",
            })
            updateGameStateCallbacks.forEach(callback => callback(getGameStateResponse.payload))
        },

        renamePlayer(name: string): void {
            performGameAction("RENAME", {
                player: playerId,
                name: name
            })
        },

        removePlayer(playerId: string): void {
            performGameAction("REMOVE_PLAYER", {
                player: playerId
            })
        },

        draw(): void {
            performGameAction("DRAW", {
                player: playerId
            })
        },

        give(cardIds: Array<number>, recipientId: string): void {
            performGameAction("GIVE", {
                player: playerId,
                recipient: recipientId,
                cardIds
            })
        },

        score(cardIds: number[]): void {
            performGameAction("SCORE", {
                player: playerId,
                cardIds
            })
        },

        hideOrShowCard(cardId: number): void {
            performGameAction("SHOW_OR_HIDE_CARD", {
                player: playerId,
                card: cardId
            })
        },

        async endTurn(): Promise<void> {
            performGameAction("END_TURN")
        },

        onSetPlayerId(callback: (name) => void): void {
            setPlayerIdCallbacks.push(callback)
        },

        onUpdateGameState(callback: (newState) => void): void {
            updateGameStateCallbacks.push(callback)
        },

        connect(): Promise<void> {
            if(connectionPromise) return connectionPromise
            if(isConnected()) return Promise.resolve()

            return connectionPromise = client.connect().then(() => {
                connectionPromise = null
            })
        },

        disconnect(): Promise<void> {
            return client.disconnect()
        }
    }
}
