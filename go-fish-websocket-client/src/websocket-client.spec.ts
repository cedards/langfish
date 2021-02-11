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
        let namesSpy: jest.Mock
        let gameStatesSpy: jest.Mock

        beforeEach(function () {
            namesSpy = jest.fn()
            gameStatesSpy = jest.fn()
            client.onSetPlayerName(namesSpy)
            client.onUpdateGameState(gameStatesSpy)
            client.joinGame("existing-game")
        })

        it('receives an assigned name for the game', function () {
            return eventually(() => {
                expect(namesSpy).toHaveBeenCalled()
            })
        })

        it('receives the current game state', function () {
            return eventually(() => {
                expect(gameStatesSpy).toHaveBeenCalledWith(games["existing-game"].currentState())
            })
        })

        describe('and someone else joins', function () {
            let otherClient: GoFishGameplayClientInterface
            let otherClientNamesSpy: jest.Mock

            beforeEach(async function () {
                otherClientNamesSpy = jest.fn()

                otherClient = GoFishGameplayClient(`ws://localhost:${server.info.port}`)
                await otherClient.connect()

                otherClient.onSetPlayerName(otherClientNamesSpy)
                otherClient.joinGame("existing-game")
            })

            afterEach(async () => {
                await otherClient.disconnect()
            })

            it('assigns a different name to the other player', function () {
                return eventually(() => {
                    expect(namesSpy).toHaveBeenCalled()
                    expect(otherClientNamesSpy).toHaveBeenCalled()
                    expect(namesSpy.mock.calls[0][0])
                        .not.toEqual(otherClientNamesSpy.mock.calls[0][0])
                })
            })

            it('receives updated game state with the new player', function () {
                return eventually(() => {
                    const playerName = latestCallTo(namesSpy)[0]
                    const otherPlayerName = latestCallTo(otherClientNamesSpy)[0]
                    const gameState = latestCallTo(gameStatesSpy)[0]

                    expect(gameState.players[playerName]).toBeTruthy()
                    expect(gameState.players[otherPlayerName]).toBeTruthy()
                })
            })

            describe('and the other player draws a card', function () {
                let otherClientGameStatesSpy: jest.Mock

                beforeEach(async function () {
                    otherClientGameStatesSpy = jest.fn()
                    otherClient.onUpdateGameState(otherClientGameStatesSpy)
                    await eventually(() => {
                        expect(otherClientNamesSpy).toHaveBeenCalled()
                    })
                    otherClient.draw()
                })

                it('receives updated game state on all clients in the game', function () {
                    return eventually(() => {
                        const otherPlayerName = latestCallTo(otherClientNamesSpy)[0]
                        const myState = latestCallTo(gameStatesSpy)[0]
                        const otherPlayerState = latestCallTo(otherClientGameStatesSpy)[0]

                        expect(myState.players[otherPlayerName].hand.length).toEqual(1)
                        expect(otherPlayerState.players[otherPlayerName].hand.length).toEqual(1)
                    })
                })

                describe('and then gives me a card', function () {
                    let myName = null
                    let otherPlayerName = null
                    let cardsToGive = null

                    beforeEach(async function () {
                        await eventually(() => {
                            myName = latestCallTo(namesSpy)[0]
                            otherPlayerName = latestCallTo(otherClientNamesSpy)[0]
                        })
                        otherClient.draw()
                        await eventually(() => {
                            const otherPlayerHand = latestCallTo(otherClientGameStatesSpy)[0].players[otherPlayerName].hand
                            expect(otherPlayerHand.length).toEqual(2)

                            cardsToGive = otherPlayerHand
                            otherClient.give(cardsToGive.map(card => card.id), myName)
                        })
                    })

                    it('updates all clients with the new game state', function () {
                        return eventually(() => {
                            expect(latestCallTo(otherClientGameStatesSpy)[0].players[otherPlayerName].hand.length).toEqual(0)
                            expect(latestCallTo(otherClientGameStatesSpy)[0].players[myName].hand).toEqual(cardsToGive)

                            expect(latestCallTo(gameStatesSpy)[0].players[otherPlayerName].hand.length).toEqual(0)
                            expect(latestCallTo(gameStatesSpy)[0].players[myName].hand).toEqual(cardsToGive)
                        })
                    })
                })
            })
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