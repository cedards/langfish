import * as Nes from "@hapi/nes";
import {GoFishGame} from "@langfish/go-fish-engine";

export interface GameRepository {
    getGame: (gameId: string) => Promise<GoFishGame | null>
}

export const GoFishGameplayPlugin = {
    name: "go-fish-gameplay-plugin",
    register: async function (server, options) {
        await server.register(Nes)

        async function publishNewGameState(gameId: string) {
            const game = await options.gameRepository.getGame(gameId)
            await server.publish(`/game/${gameId}`, {
                type: 'UPDATE_GAME_STATE',
                state: game.currentState()
            });
        }

        server.route({
            method: 'POST',
            path: `/game/{gameId}`,
            options: {
                id: 'game',
                handler: async (request, h) => {
                    const payload = request.payload
                    const game = await options.gameRepository.getGame(request.params.gameId)
                    switch (payload.type) {
                        case "DRAW":
                            game.draw(payload.player)
                            await publishNewGameState(request.params.gameId)
                            break
                        case "GIVE":
                            payload.cardIds.forEach(cardId => {
                                game.give(payload.player, payload.recipient, cardId)
                            })
                            await publishNewGameState(request.params.gameId)
                            break
                        case "SCORE":
                            game.score(payload.player, payload.cardIds)
                            await publishNewGameState(request.params.gameId)
                            break
                    }
                    return true;
                }
            }
        })

        server.subscription('/game/{gameId}', {
            onSubscribe: async function (socket, path, params) {
                const game = await options.gameRepository.getGame(params.gameId)
                const playerName = game.addPlayer()

                await socket.publish(path, {
                    type: 'SET_NAME',
                    name: playerName
                })
                await socket.publish(path, {
                    type: 'UPDATE_GAME_STATE',
                    state: game.currentState()
                });
                await publishNewGameState(params.gameId)
            }
        })
    }
}