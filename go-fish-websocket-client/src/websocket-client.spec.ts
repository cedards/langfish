import * as Hapi from "@hapi/hapi"
import {GoFishGame} from "@langfish/go-fish-engine"
import {
    GameRepository,
    GoFishGameplayPlugin,
} from "@langfish/go-fish-websocket-server-plugin"
import {
    GoFishGameplayClientInterface,
    GoFishGameplayClient,
} from ".";

describe('Go Fish websocket client', function () {
    let server: Hapi.Server
    let client: GoFishGameplayClientInterface
    let games: { [key: string]: GoFishGame }
    const gameRepository: GameRepository = {
        getGame: async gameId => games[gameId]
    };

    beforeEach(async function () {
        const existingGame = GoFishGame()
        existingGame.setDeck([
            { id: 1, value: 'A' },
            { id: 2, value: 'B' },
            { id: 3, value: 'C' },
        ])

        games = { "existing-game": existingGame }

        server = new Hapi.Server({port: 0})
        await server.register({
            plugin: GoFishGameplayPlugin,
            options: {
                gameRepository: gameRepository
            }
        })
        await server.start()

        client = GoFishGameplayClient(`ws://localhost:${server.info.port}`)
        await client.connect()
    })

    afterEach(async function () {
        await client.disconnect()
        await server.stop()
    })

    describe('when I join a game', function () {
        let playerIdSpy: jest.Mock
        let gameStatesSpy: jest.Mock

        beforeEach(function () {
            playerIdSpy = jest.fn()
            gameStatesSpy = jest.fn()
            client.onSetPlayerId(playerIdSpy)
            client.onUpdateGameState(gameStatesSpy)
            client.joinGame("existing-game")
        })

        it('receives an assigned player id for the game', function () {
            return eventually(() => {
                expect(playerIdSpy).toHaveBeenCalled()
            })
        })

        it('receives the current game state', function () {
            return eventually(() => {
                expect(gameStatesSpy).toHaveBeenCalledWith(games["existing-game"].currentState())
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

        describe('and someone else joins', function () {
            let otherClient: GoFishGameplayClientInterface
            let otherClientPlayerIdSpy: jest.Mock

            beforeEach(async function () {
                otherClientPlayerIdSpy = jest.fn()

                otherClient = GoFishGameplayClient(`ws://localhost:${server.info.port}`)
                await otherClient.connect()

                otherClient.onSetPlayerId(otherClientPlayerIdSpy)
                otherClient.joinGame("existing-game")
            })

            afterEach(async () => {
                await otherClient.disconnect()
            })

            it('assigns a different name to the other player', function () {
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
            const gameWithIdenticalCards = GoFishGame()
            gameWithIdenticalCards.setDeck([
                { id: 1, value: 'A' },
                { id: 2, value: 'A' },
                { id: 3, value: 'A' },
            ])
            games["game-with-identical-cards"] = gameWithIdenticalCards

            gameStatesSpy = jest.fn()
            assignedId = null
            client.onSetPlayerId(name => assignedId = name)
            client.onUpdateGameState(gameStatesSpy)
            client.joinGame("game-with-identical-cards")
            await eventually(() => { if(!assignedId) throw new Error("Never received player id for game-with-identical-cards") })

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

    describe('sad paths', function () {
        it('does not fail if I try to connect while already connected', async function () {
            await client.connect()
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