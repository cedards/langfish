import * as Nes from "@hapi/nes";
import {GoFishGame} from "@langfish/go-fish-engine";

export interface GameRepository {
    getGame: (gameId: string) => Promise<GoFishGame | null>
    saveGame: (game: GoFishGame) => Promise<string>
    updateGame: (gameId: string, game: GoFishGame) => Promise<void>
}

export function InMemoryGameRepository(): GameRepository {
    const _games: { [key: string]: GoFishGame } = {}

    const randomId = () => Math.floor(Math.random() * 1e7)
    let _nextId = randomId()

    return {
        saveGame(game): Promise<string> {
            while(_games[`game-${_nextId}`]) _nextId = randomId()
            const id = `game-${_nextId}`
            _games[id] = game
            return Promise.resolve(id);
        },
        updateGame(gameId: string, game): Promise<void> {
            _games[gameId] = game
            return Promise.resolve();
        },
        getGame(gameId: string): Promise<GoFishGame | null> {
            return Promise.resolve(_games[gameId] || null);
        }
    }
}

export const GoFishGameplayPlugin = {
    name: "go-fish-gameplay-plugin",
    register: async function (server, options) {
        await server.register(Nes)

        async function publishNewGameState(gameId: string) {
            const game = await options.gameRepository.getGame(gameId)
            await server.publish(`/api/game/${gameId}`, {
                type: 'UPDATE_GAME_STATE',
                state: game.currentState()
            })
        }

        server.route({
            method: 'POST',
            path: `/api/game`,
            options: {
                id: 'createGame',
                handler: (request, h) => {
                    const deck = request.payload.template
                        .map(cloneTimes(6))
                        .reduce((nextItem, result) => result.concat(nextItem), [])
                        .map((cardTemplate, index) => ({ ...cardTemplate, id: index+1 }))
                    return options.gameRepository.saveGame(GoFishGame(shuffle(deck)))
                }
            }
        })

        server.route({
            method: 'GET',
            path: `/api/game/{gameId}`,
            options: {
                id: 'getGameState',
                handler: (request, h) => {
                    return options.gameRepository
                        .getGame(request.params.gameId)
                        .then(game => game.currentState())
                }
            }
        })

        server.route({
            method: 'POST',
            path: `/api/game/{gameId}`,
            options: {
                id: 'performGameAction',
                handler: async (request, h) => {
                    const payload = request.payload
                    const game = await options.gameRepository.getGame(request.params.gameId)
                    switch (payload.type) {
                        case "RENAME":
                            game.renamePlayer(payload.player, payload.name)
                            await publishNewGameState(request.params.gameId)
                            break
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
                        case "END_TURN":
                            game.endTurn()
                            await publishNewGameState(request.params.gameId)
                            break
                        case "REMOVE_PLAYER":
                            game.removePlayer(payload.player)
                            await publishNewGameState(request.params.gameId)
                            break
                    }
                    return true
                }
            }
        })

        server.route({
            method: 'POST',
            path: `/api/game/{gameId}/player`,
            options: {
                id: 'addPlayerToGame',
                handler: async (request, h) => {
                    const game = await options.gameRepository.getGame(request.params.gameId)
                    const playerId = game.addPlayer()
                    await publishNewGameState(request.params.gameId)
                    return { playerId: playerId }
                }
            }
        })

        server.subscription('/api/game/{gameId}')
    }
}

function cloneTimes<T>(number: number): (item: T) => Array<T> {
    return function(item: T) {
        const result: Array<T> = []
        for (let i = 0; i < number; i++) {
            result.push(item)
        }
        return result
    }
}

function shuffle<T>(list: Array<T>): Array<T> {
    const shuffledList: Array<T> = []
    while(list.length > 0) {
        const choice = Math.floor(Math.random() * list.length)
        shuffledList.push(list[choice])
        list = list.slice(0,choice).concat(list.slice(choice+1))
    }
    return shuffledList
}