import * as Nes from "@hapi/nes/lib/client";

export interface GoFishGameplayClient {
    connect: () => Promise<void>
    disconnect: () => Promise<void>
    onSetPlayerName(callback: (name) => void): void
    onUpdateGameState(callback: (newState) => void): void
    joinGame(gameId: string): void
    draw(): void;
}

export function GoFishGameplayClient(websocketUrl: string): GoFishGameplayClient {
    const client = new Nes.Client(websocketUrl)
    const setPlayerNameCallbacks: Array<(name) => void> = []
    const updateGameStateCallbacks: Array<(GameState) => void> = []
    let playerName: string | null = null
    let joinedGame: string | null = null

    return {
        joinGame(gameId: string): void {
            client.subscribe(`/game/${gameId}`, payload => {
                try {
                    switch (payload.type) {
                        case "SET_NAME":
                            playerName = payload.name
                            setPlayerNameCallbacks.forEach(callback => callback(playerName))
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
                        player: playerName
                    }
                }
            )
        },
        onSetPlayerName(callback: (name) => void): void {
            setPlayerNameCallbacks.push(callback)
        },
        onUpdateGameState(callback: (newState) => void): void {
            updateGameStateCallbacks.push(callback)
        },
        connect(): Promise<void> {
            return client.connect()
        },
        disconnect(): Promise<void> {
            return client.disconnect()
        }
    }
}