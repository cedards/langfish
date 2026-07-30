import { GameRepository as ManagingGamesGameRepository } from "@langfish/managing-games-server-plugin"
import { GameRepository as GameplayGameRepository } from "@langfish/gameplay-server-plugin"
import { GoFishGame } from "@langfish/go-fish-engine";

export function InMemoryGameRepository(): ManagingGamesGameRepository & GameplayGameRepository {
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