import { Server } from "@hapi/hapi";
import { Card, GoFishGame } from "@langfish/go-fish-engine";

export interface GameRepository {
    getGame: (gameId: string) => Promise<GoFishGame | null>
    saveGame: (game: GoFishGame) => Promise<string>
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
        getGame(gameId: string): Promise<GoFishGame | null> {
            return Promise.resolve(_games[gameId] || null);
        }
    }
}

export const GoFishManagingGamesPlugin = {
    name: "go-fish-managing-games-plugin",
    register: async function (
        server: Server,
        options: {
            gameRepository: GameRepository
        }
    ): Promise<void> {

        server.route({
            method: 'POST',
            path: `/api/game`,
            options: {
                id: 'createGame',
                handler: (request) => {
                    const deck = (request.payload as {template: Array<Card>}).template
                        .map(cloneTimes(6))
                        .reduce((nextItem, result) => result.concat(nextItem), [] as Array<Card>)
                        .map((cardTemplate, index) => ({ ...cardTemplate, id: index+1 }))
                    return options
                        .gameRepository
                        .saveGame(GoFishGame(shuffle(deck)))
                }
            }
        })
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