import * as Nes from "@hapi/nes/lib/client";

export interface GoFishGameplayClientInterface {
    connect: () => Promise<void>
    disconnect: () => Promise<void>
    onSetPlayerId(callback: (name) => void): void
    onUpdateGameState(callback: (newState) => void): void
    joinGame(gameId: string): void
    draw(): void;
    give(cardIds: Array<number>, recipientName: string): void;
    score(cardIds: number[]): void;
}

export function GoFishGameplayClient(websocketUrl: string): GoFishGameplayClientInterface {
    const client = new Nes.Client(websocketUrl)
    const setPlayerIdCallbacks: Array<(name) => void> = []
    const updateGameStateCallbacks: Array<(GameState) => void> = []
    let playerId: string | null = null
    let joinedGame: string | null = null

    return {
        joinGame(gameId: string): void {
            client.subscribe(`/game/${gameId}`, payload => {
                try {
                    switch (payload.type) {
                        case "SET_PLAYER_ID":
                            playerId = payload.playerId
                            setPlayerIdCallbacks.forEach(callback => callback(playerId))
                            break
                        case "UPDATE_GAME_STATE":
                            updateGameStateCallbacks.forEach(callback => callback(payload.state))
                            break
                        default:
                            console.warn("Didn't know how to handle message of type", payload.type)
                    }
                } catch(e) {
                    console.error(e)
                }
            })
            joinedGame = gameId
        },
        draw(): void {
            client.request({
                path: `/game/${joinedGame}`,
                method: "POST",
                payload: {
                    type: "DRAW",
                    player: playerId
                }
            })
        },
        give(cardIds: Array<number>, recipientName: string): void {
            client.request({
                path: `/game/${joinedGame}`,
                method: "POST",
                payload: {
                    type: "GIVE",
                    player: playerId,
                    recipient: recipientName,
                    cardIds
                }
            })
        },
        score(cardIds: number[]): void {
            client.request({
                path: `/game/${joinedGame}`,
                method: "POST",
                payload: {
                    type: "SCORE",
                    player: playerId,
                    cardIds
                }
            })
        },
        onSetPlayerId(callback: (name) => void): void {
            setPlayerIdCallbacks.push(callback)
        },
        onUpdateGameState(callback: (newState) => void): void {
            updateGameStateCallbacks.push(callback)
        },
        connect(): Promise<void> {
            return client.id ? Promise.resolve() : client.connect()
        },
        disconnect(): Promise<void> {
            return client.disconnect()
        }
    }
}
