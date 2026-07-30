import * as Hapi from "@hapi/hapi"
import { GoFishGame } from "@langfish/go-fish-engine"
import {
    GameRepository,
    GoFishManagingGamesPlugin,
    InMemoryGameRepository,
} from "@langfish/managing-games-server-plugin"
import {
    GoFishManagingGamesClient,
    GoFishManagingGamesClientInterface,
} from ".";

describe('Go Fish managing games client', function () {
    let server: Hapi.Server
    let client: GoFishManagingGamesClientInterface
    let gameRepository: GameRepository

    beforeEach(async function () {
        gameRepository = InMemoryGameRepository()

        server = new Hapi.Server({port: 0})
        await server.register({
            plugin: GoFishManagingGamesPlugin,
            options: {
                gameRepository: gameRepository
            }
        })
        await server.start()

        client = GoFishManagingGamesClient(
            `http://localhost:${server.info.port}`,
        )
    })

    afterEach(async function () {
        await server.stop()
    })

    describe('creating a new game', function () {
        const template = [
            {value: 'X'},
            {value: 'Y'},
            {value: 'Z'},
        ]
        let game: GoFishGame

        beforeEach(async function () {
            const gameId = await client.createGame(template)
            game = (await gameRepository.getGame(gameId))!
        })

        it('returns the id of the new game', async function () {
            expect(game).toBeTruthy()
        })

        it('populates the deck with 6 copies of each card in the template', async function () {
            const deck = game.currentState().deck

            template.forEach(cardTemplate => {
                const cardsWithThisValue = deck.filter(card => card.value === cardTemplate.value)
                expect(cardsWithThisValue.length).toEqual(6)
            })
        })

        it('assigns each card in the deck a unique id', async function () {
            const deck = game.currentState().deck;
            const uniqueIds = new Set(deck.map(card => card.id))

            expect(uniqueIds.size).toEqual(3 * 6)
        })

        it('puts the deck in a random order', async function () {
            const deck = game.currentState().deck
            const otherGameId = await client.createGame(template)
            const otherGame = (await gameRepository.getGame(otherGameId))!
            const otherDeck = otherGame.currentState().deck

            expect(deck.map(card => card.value)).not.toEqual(otherDeck.map(card => card.value))
        })
    })

    describe("when the endpoint prop has a trailing slash", () => {
        beforeEach(async () => {
            client = GoFishManagingGamesClient(
                `http://localhost:${server.info.port}/`,
            )
        });

        it("does not fail", async () => {
            const gameId = await client.createGame([{value: 'X'}])
            const game = (await gameRepository.getGame(gameId))!
            expect(game).toBeTruthy()
        });
    });
})