import * as Hapi from "@hapi/hapi"
import {GoFishGame} from "@langfish/go-fish-engine"
import {
    GameRepository,
    GoFishGameplayPlugin,
    InMemoryGameRepository,
} from "@langfish/go-fish-gameplay-server-plugin"
import {
    GameMembershipRepository,
    GoFishGameplayClient,
    GoFishGameplayClientInterface,
    InMemoryGameMembershipRepository,
} from ".";

describe('Go Fish gameplay client', function () {
    let server: Hapi.Server
    let client: GoFishGameplayClientInterface
    let gameRepository: GameRepository
    let existingGameId: string
    let gameMembershipRepository: GameMembershipRepository

    beforeEach(async function () {
        gameRepository = InMemoryGameRepository()
        gameMembershipRepository = InMemoryGameMembershipRepository()
        existingGameId = await gameRepository.saveGame(GoFishGame([
            {id: 1, value: 'A'},
            {id: 2, value: 'B'},
            {id: 3, value: 'C'},
        ]))

        server = new Hapi.Server({port: 0})
        await server.register({
            plugin: GoFishGameplayPlugin,
            options: {
                gameRepository: gameRepository
            }
        })
        await server.start()

        client = GoFishGameplayClient(
            `ws://localhost:${server.info.port}`,
            gameMembershipRepository
        )
        await client.connect()
    })

    afterEach(async function () {
        await client.disconnect()
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
            game = await gameRepository.getGame(gameId)
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
            const otherGame = await gameRepository.getGame(otherGameId)
            const otherDeck = otherGame.currentState().deck

            expect(deck.map(card => card.value)).not.toEqual(otherDeck.map(card => card.value))
        })
    })

    describe('given I have joined a game previously', function () {
        let existingPlayerId
        let gameStatesSpy: jest.Mock

        beforeEach(async function () {
            gameStatesSpy = jest.fn()
            const game = await gameRepository.getGame(existingGameId)

            existingPlayerId = game.addPlayer()
            gameMembershipRepository.savePlayerIdFor(existingGameId, existingPlayerId)

            client.onUpdateGameState(gameStatesSpy)
            await client.joinGame(existingGameId)
        })

        it('does not create another player', async function () {
            const game = await gameRepository.getGame(existingGameId)
            expect(Object.keys(game.currentState().players)).toEqual([existingPlayerId])
        })

        it('uses my existing player id for game actions', function () {
            client.draw()
            return eventually(() => {
                expect(latestCallTo(gameStatesSpy)[0].players[existingPlayerId].hand.length).toEqual(1)
            })
        })
    })

    describe('when I join a game', function () {
        let playerIdSpy: jest.Mock
        let gameStatesSpy: jest.Mock

        beforeEach(async function () {
            playerIdSpy = jest.fn()
            gameStatesSpy = jest.fn()
            client.onSetPlayerId(playerIdSpy)
            client.onUpdateGameState(gameStatesSpy)
            await client.joinGame(existingGameId)
        })

        it('receives an assigned player id for the game', function () {
            return eventually(() => {
                expect(playerIdSpy).toHaveBeenCalled()
            })
        })

        it('saves my player id in the game membership repo', async function () {
            await eventually(() => { expect(playerIdSpy).toHaveBeenCalled() })
            expect(gameMembershipRepository.getPlayerIdFor(existingGameId)).toEqual(latestCallTo(playerIdSpy)[0])
        })

        it('receives the current game state', async function () {
            const existingGame = await gameRepository.getGame(existingGameId)
            return eventually(() => {
                expect(latestCallTo(gameStatesSpy)[0]).toEqual(existingGame.currentState())
            })
        })

        describe('and then leave the game', function () {
            beforeEach(async function () {
                await eventually(() => expect(playerIdSpy).toHaveBeenCalled())
                client.removePlayer(latestCallTo(playerIdSpy)[0])
            })

            it('removes me from the game and publishes new state', async function () {
                await eventually(() => {
                    expect(latestCallTo(gameStatesSpy)[0].players[latestCallTo(playerIdSpy)]).toBeFalsy()
                })
            })
        })

        describe('and update my name', function () {
            beforeEach(async function () {
                await eventually(() => {
                    expect(playerIdSpy).toHaveBeenCalled()
                })
                client.renamePlayer('alex')
            })

            it('receives updated game state', function () {
                return eventually(() => {
                    expect(latestCallTo(gameStatesSpy)[0].players[latestCallTo(playerIdSpy)[0]].name).toEqual('alex')
                })
            })
        })

        describe('and show one of my cards', function () {
            let playerId

            beforeEach(async function () {
                await eventually(() => { expect(playerIdSpy).toHaveBeenCalled() })
                playerId = latestCallTo(playerIdSpy)[0]

                client.draw()
                await eventually(() => {
                    expect(latestCallTo(gameStatesSpy)[0].players[playerId].hand.length).toEqual(1)
                })

                expect(latestCallTo(gameStatesSpy)[0].players[playerId].hand[0].revealed).toBeFalsy()
                client.hideOrShowCard(latestCallTo(gameStatesSpy)[0].players[playerId].hand[0].id)
            })

            it('publishes new state', async function () {
                await eventually(() => {
                    expect(latestCallTo(gameStatesSpy)[0].players[playerId].hand[0].revealed).toBeTruthy()
                })
            })
        })

        describe('and someone else joins', function () {
            let otherClient: GoFishGameplayClientInterface
            let otherClientPlayerIdSpy: jest.Mock

            beforeEach(async function () {
                otherClientPlayerIdSpy = jest.fn()

                otherClient = GoFishGameplayClient(`ws://localhost:${server.info.port}`)
                await otherClient.connect()

                otherClient.onSetPlayerId(otherClientPlayerIdSpy)
                await otherClient.joinGame(existingGameId)
            })

            afterEach(async () => {
                await otherClient.disconnect()
            })

            it('assigns a different id to the other player', function () {
                return eventually(() => {
                    expect(playerIdSpy).toHaveBeenCalled()
                    expect(otherClientPlayerIdSpy).toHaveBeenCalled()
                    expect(playerIdSpy.mock.calls[0][0])
                        .not.toEqual(otherClientPlayerIdSpy.mock.calls[0][0])
                })
            })

            it('receives updated game state with the new player', function () {
                return eventually(() => {
                    const playerId = latestCallTo(playerIdSpy)[0]
                    const otherPlayerId = latestCallTo(otherClientPlayerIdSpy)[0]
                    const gameState = latestCallTo(gameStatesSpy)[0]

                    expect(gameState.players[playerId]).toBeTruthy()
                    expect(gameState.players[otherPlayerId]).toBeTruthy()
                })
            })

            describe('and I end the current turn', function () {
                beforeEach(async function () {
                    await client.endTurn()
                })

                it('publishes new game state', async function () {
                    await eventually(() => expect(expect(otherClientPlayerIdSpy).toHaveBeenCalled()))
                    await eventually(() => {
                        expect(latestCallTo(gameStatesSpy)[0].currentTurn).toEqual(latestCallTo(otherClientPlayerIdSpy)[0])
                    })
                })
            })

            describe('and the other player draws a card', function () {
                let otherClientGameStatesSpy: jest.Mock

                beforeEach(async function () {
                    otherClientGameStatesSpy = jest.fn()
                    otherClient.onUpdateGameState(otherClientGameStatesSpy)
                    await eventually(() => {
                        expect(otherClientPlayerIdSpy).toHaveBeenCalled()
                    })
                    otherClient.draw()
                })

                it('receives updated game state on all clients in the game', function () {
                    return eventually(() => {
                        const otherPlayerId = latestCallTo(otherClientPlayerIdSpy)[0]
                        const myState = latestCallTo(gameStatesSpy)[0]
                        const otherPlayerState = latestCallTo(otherClientGameStatesSpy)[0]

                        expect(myState.players[otherPlayerId].hand.length).toEqual(1)
                        expect(otherPlayerState.players[otherPlayerId].hand.length).toEqual(1)
                    })
                })

                describe('and then gives me a card', function () {
                    let myId = null
                    let otherPlayerId = null
                    let cardsToGive = null

                    beforeEach(async function () {
                        await eventually(() => {
                            myId = latestCallTo(playerIdSpy)[0]
                            otherPlayerId = latestCallTo(otherClientPlayerIdSpy)[0]
                        })
                        otherClient.draw()
                        await eventually(() => {
                            const otherPlayerHand = latestCallTo(otherClientGameStatesSpy)[0].players[otherPlayerId].hand
                            expect(otherPlayerHand.length).toEqual(2)

                            cardsToGive = otherPlayerHand
                            otherClient.give(cardsToGive.map(card => card.id), myId)
                        })
                    })

                    it('updates all clients with the new game state', function () {
                        return eventually(() => {
                            expect(latestCallTo(otherClientGameStatesSpy)[0].players[otherPlayerId].hand.length).toEqual(0)
                            expect(latestCallTo(otherClientGameStatesSpy)[0].players[myId].hand).toEqual(cardsToGive)

                            expect(latestCallTo(gameStatesSpy)[0].players[otherPlayerId].hand.length).toEqual(0)
                            expect(latestCallTo(gameStatesSpy)[0].players[myId].hand).toEqual(cardsToGive)
                        })
                    })
                })
            })
        })
    })

    describe('when I score a set', function () {
        let assignedId: string | null
        let gameStatesSpy: jest.Mock

        beforeEach(async function () {
            const gameWithIdenticalCards = await gameRepository.saveGame(GoFishGame([
                {id: 1, value: 'A'},
                {id: 2, value: 'A'},
                {id: 3, value: 'A'},
            ]))

            gameStatesSpy = jest.fn()
            assignedId = null
            client.onSetPlayerId(name => assignedId = name)
            client.onUpdateGameState(gameStatesSpy)
            await client.joinGame(gameWithIdenticalCards)
            await eventually(() => { if(!assignedId) throw new Error(`Never received player id for ${gameWithIdenticalCards}`) })

            client.draw()
            client.draw()
            client.draw()
            await eventually(() => {
                expect(latestCallTo(gameStatesSpy)[0].players[assignedId].hand.length).toEqual(3)
            })

            expect(latestCallTo(gameStatesSpy)[0].players[assignedId].sets.length).toEqual(0)
            client.score([1,2,3])
        })

        it('broadcasts updated game state to all clients', function () {
            return eventually(() => {
                expect(latestCallTo(gameStatesSpy)[0].players[assignedId].sets).toEqual([
                    [
                        { id: 1, value: 'A' },
                        { id: 2, value: 'A' },
                        { id: 3, value: 'A' },
                    ]
                ])
            })
        })
    })

    describe('sad paths when connecting', function () {
        beforeEach(async function () {
            await client.disconnect()
        })

        it('does not fail if I try to connect while already connected', async function () {
            await client.connect()
            await client.connect()
        })

        it('does not fail when connect is called multiple times in quick succession', async function () {
            client.connect()
            await client.connect()
        })
    })

    describe("recovering from a server restart", () => {
        let playerIdSpy: jest.Mock
        let gameStatesSpy: jest.Mock
        let playerId: string
        let newServer: Hapi.Server
        let originalPort: number

        beforeEach(async function () {
            jest.setTimeout(10000);
            originalPort = server.info.port
            playerIdSpy = jest.fn()
            gameStatesSpy = jest.fn()
            client.onSetPlayerId(playerIdSpy)
            client.onUpdateGameState(gameStatesSpy)
        })

        it("works", async () => {
            await client.joinGame(existingGameId)

            await eventually(() => { expect(playerIdSpy).toHaveBeenCalled() })
            playerId = latestCallTo(playerIdSpy)[0]

            client.draw()
            await eventually(() => {
                expect(latestCallTo(gameStatesSpy)[0].players[playerId].hand.length).toEqual(1)
            })

            await server.stop({ timeout: 0 })

            newServer = new Hapi.Server({port: originalPort})
            await newServer.register({
                plugin: GoFishGameplayPlugin,
                options: {
                    gameRepository: InMemoryGameRepository() // restarted server has forgotten all game data
                }
            })
            await newServer.start()

            await new Promise(res => setTimeout(res, 2000))

            await client.draw()
            await eventually(() => {
                expect(latestCallTo(gameStatesSpy)[0].players[playerId].hand.length).toEqual(2)
            })
        })

        afterEach(async function () {
            await newServer.stop()
        })
    })
})

function eventually(assertion: () => void) {
    const now = () => new Date().getTime()
    const stopTime = now() + 3000
    return new Promise<void>((resolve, reject) => {
        const timer = setInterval(() => {
            try {
                assertion()
            } catch(e) {
                if(now() > stopTime) {
                    clearInterval(timer)
                    reject(e)
                }
                return
            }
            clearInterval(timer)
            resolve()
        }, 2)
    })
}

function latestCallTo(spy: jest.Mock) {
    return spy.mock.calls[spy.mock.calls.length - 1]
}