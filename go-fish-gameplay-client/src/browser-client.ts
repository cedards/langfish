import * as Nes from "@hapi/nes/lib/client";

export interface GoFishGameplayClientInterface {
    connect: () => Promise<void>
    disconnect: () => Promise<void>
    onSetPlayerId(callback: (name) => void): void
    onUpdateGameState(callback: (newState) => void): void
    createGame(template: Array<{ value: string, image?: string }>): Promise<string>
    joinGame(gameId: string): void
    draw(): void
    give(cardIds: Array<number>, recipientName: string): void
    score(cardIds: number[]): void
    renamePlayer(name: string): void
}

export function GoFishGameplayClient(websocketUrl: string): GoFishGameplayClientInterface {
    const client = new Nes.Client(websocketUrl)
    const setPlayerIdCallbacks: Array<(name) => void> = []
    const updateGameStateCallbacks: Array<(GameState) => void> = []
    let playerId: string | null = null
    let joinedGame: string | null = null

    return {
        createGame(template: Array<{ value: string; image?: string }>): Promise<string> {
            return client.request({
                path: `/game`,
                method: "POST",
                payload: { template: template },
            }).then((response) => {
                return response.payload
            })
        },

        async joinGame(gameId: string): Promise<void> {
            await client.subscribe(`/game/${gameId}`, payload => {
                updateGameStateCallbacks.forEach(callback => callback(payload.state))
            })
            joinedGame = gameId
            const addPlayerResponse = await client.request({
                path: `/game/${joinedGame}/addPlayer`,
                method: "POST"
            })
            playerId = addPlayerResponse.payload.playerId
            setPlayerIdCallbacks.forEach(callback => callback(playerId))
        },

        renamePlayer(name: string): void {
            client.request({
                path: `/game/${joinedGame}`,
                method: "POST",
                payload: {
                    type: "RENAME",
                    player: playerId,
                    name: name
                }
            })
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
