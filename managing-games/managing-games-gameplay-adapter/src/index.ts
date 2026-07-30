import { Deck, Game, GameRepository as ManagingGamesGameRepository } from "@langfish/managing-games-domain"
import { GameRepository as GameplayGameRepository, GoFishGame } from "@langfish/go-fish-engine"

type CombinedGame = GoFishGame & Game;

function CombinedGame(goFishGame: GoFishGame, deck: Deck, id: string | null): CombinedGame {
  return {
    ...goFishGame,
    deck,
    id,
  };
}

function isGameplayModel(game: GoFishGame | Game): game is GoFishGame {
  return game.hasOwnProperty("currentState")
}

function CombinedModelFromGameplayModel(game: GoFishGame, id: string | null): CombinedGame {
    return CombinedGame(game, game.currentState().deck, id)
}

function CombinedModelFromManagingGamesModel(game: Game): CombinedGame {
    let goFishGame = GoFishGame(game.deck.map((card, i) => (
        {...card, id: i+1}
    )));
    return CombinedGame(goFishGame, game.deck, game.id)
}

export function InMemoryGameRepository(): ManagingGamesGameRepository & GameplayGameRepository {
    const _games: { [key: string]: CombinedGame } = {}

    const randomId = () => Math.floor(Math.random() * 1e7)
    let _nextId = randomId()

    return {
        saveGame(game): Promise<string> {
            while(_games[`game-${_nextId}`]) _nextId = randomId()
            const id = `game-${_nextId}`
            _games[id] = isGameplayModel(game)
                ? CombinedModelFromGameplayModel(game, id)
                : CombinedModelFromManagingGamesModel(game)
            return Promise.resolve(id);
        },
        updateGame(gameId: string, game): Promise<void> {
            _games[gameId] = {
                ...game,
                deck: game.currentState().deck,
                id: gameId,
            }
            return Promise.resolve();
        },
        getGame(gameId: string): Promise<CombinedGame | null> {
            return Promise.resolve(_games[gameId] || null);
        }
    }
}