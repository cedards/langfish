import { GoFishGame } from "."

describe("A new Go Fish game", function () {
    let game: GoFishGame
    let player1id: string
    let player2id: string

    beforeEach(function () {
        game = GoFishGame()
        player1id = null
        player2id = null
    })

    it("has empty game state", function () {
        expect(game.currentState().deck).toEqual([])
        expect(game.currentState().players).toEqual({})
        expect(game.currentState().currentTurn).toEqual(undefined)
    })

    describe("after adding a deck", function () {
        const deck = [{id: 7, value: "apple"}]

        beforeEach(function () {
            game.setDeck(deck)
        })

        it('has the given deck in the game state', function () {
            expect(game.currentState().deck).toEqual(deck)
        })
    })

    describe("when adding players", function () {
        beforeEach(function () {
            player1id = game.addPlayer()
            player2id = game.addPlayer()
        })

        it('marks the first player as having the current turn', function () {
            expect(game.currentState().currentTurn).toEqual(player1id)
        })

        it('assigns unique identifiers to each player', function () {
            expect(player1id).not.toEqual(player2id)
        })

        it('includes starting state for the new players', function () {
            expect(game.currentState().players[player1id]).toEqual({
                hand: [],
                sets: [],
            })
            expect(game.currentState().players[player2id]).toEqual({
                hand: [],
                sets: [],
            })
        })
    })

    describe('renaming players', function () {
        beforeEach(function () {
            player1id = game.addPlayer()
        })

        it('assigns the given player the given name', function () {
            expect(game.currentState().players[player1id].name).toBeFalsy()
            game.renamePlayer(player1id, "Alex")
            expect(game.currentState().players[player1id].name).toEqual("Alex")
        })
    })

    describe("drawing from the deck", function () {
        const deck = [
            {id: 7, value: "apple"},
            {id: 9, value: "banana"},
            {id: 13, value: "cherry"},
        ]
        beforeEach(function () {
            game.setDeck(deck)
            player1id = game.addPlayer()
        })

        it('moves the top card of the deck to the given player\'s hand', function () {
            game.draw(player1id)
            expect(game.currentState().deck).toEqual([
                {id: 9, value: "banana"},
                {id: 13, value: "cherry"},
            ])
            expect(game.currentState().players[player1id].hand).toEqual([
                {id: 7, value: "apple"},
            ])

            game.draw(player1id)
            expect(game.currentState().deck).toEqual([
                {id: 13, value: "cherry"},
            ])
            expect(game.currentState().players[player1id].hand).toEqual([
                {id: 7, value: "apple"},
                {id: 9, value: "banana"},
            ])
        })

        describe('when the deck is empty', function () {
            beforeEach(function () {
                game.setDeck([])
            })

            it('does nothing', function () {
                game.draw(player1id)
                expect(game.currentState().deck).toEqual([])
                expect(game.currentState().players[player1id].hand).toEqual([])
            })
        })
    })

    describe('giving cards', function () {
        beforeEach(function () {
            game.setDeck([
                {id: 7, value: "apple"},
                {id: 9, value: "banana"},
                {id: 13, value: "cherry"},
            ])
            player1id = game.addPlayer()
            player2id = game.addPlayer()

            game.draw(player1id)
            game.draw(player1id)
            game.draw(player2id)
            game.give(player1id, player2id, 7)
        })

        it('transfers the given card from one player\'s hand to the other', function () {
            expect(game.currentState().players[player1id].hand).toEqual([
                {id: 9, value: "banana"},
            ])
            expect(game.currentState().players[player2id].hand).toEqual([
                {id: 13, value: "cherry"},
                {id: 7, value: "apple"},
            ])
        })
    })

    describe('scoring sets', function () {
        beforeEach(function () {
            game.setDeck([
                {id: 1, value: "apple"},
                {id: 2, value: "apple"},
                {id: 3, value: "apple"},
                {id: 4, value: "banana"},
            ])
            player1id = game.addPlayer()

            game.draw(player1id)
            game.draw(player1id)
            game.draw(player1id)
            game.draw(player1id)

            expect(game.currentState().players[player1id].hand.map(card => card.value))
                .toEqual(["apple", "apple", "apple", "banana"])
            expect(game.currentState().players[player1id].sets).toEqual([])
        })

        it('allows scoring a set of three of a kind', function () {
            game.score(player1id, [1,2,3])
            expect(game.currentState().players[player1id].sets).toEqual([
                [
                    {id: 1, value: "apple"},
                    {id: 2, value: "apple"},
                    {id: 3, value: "apple"},
                ]
            ])
            expect(game.currentState().players[player1id].hand).toEqual([
                {id: 4, value: "banana"}
            ])
        })

        it('does not allow scoring a set of less than three', function () {
            game.score(player1id, [1,2])
            expect(game.currentState().players[player1id].sets).toEqual([])
            expect(game.currentState().players[player1id].hand).toEqual([
                {id: 1, value: "apple"},
                {id: 2, value: "apple"},
                {id: 3, value: "apple"},
                {id: 4, value: "banana"}
            ])
        })

        it('does not allow scoring a set of mixed cards', function () {
            game.score(player1id, [2,3,4])
            expect(game.currentState().players[player1id].sets).toEqual([])
            expect(game.currentState().players[player1id].hand).toEqual([
                {id: 1, value: "apple"},
                {id: 2, value: "apple"},
                {id: 3, value: "apple"},
                {id: 4, value: "banana"}
            ])
        })

        it('does not allow scoring cards the player does not own', function () {
            game.score(player1id, [5,6,7])
            expect(game.currentState().players[player1id].sets).toEqual([])
            expect(game.currentState().players[player1id].hand).toEqual([
                {id: 1, value: "apple"},
                {id: 2, value: "apple"},
                {id: 3, value: "apple"},
                {id: 4, value: "banana"}
            ])
        })
    })

    describe('reconstructing a game from stored state', function () {
        it('recreates the original game', function () {
            const deck = [
                {id: 1, value: "apple"},
                {id: 2, value: "apple"},
            ]
            const players = {
                "TALAPAS": {
                    name: "talapas",
                    hand: [
                        {id: 3, value: "apple"},
                    ],
                    sets: [
                        [
                            {id: 4, value: "apple"},
                            {id: 5, value: "apple"},
                            {id: 6, value: "apple"},
                        ]
                    ]
                }
            }

            game = GoFishGame(deck, players, "TALAPAS")

            expect(game.currentState()).toEqual({
                deck,
                players,
                currentTurn: "TALAPAS"
            })
        })
    })

    test('ending the turn', function () {
        const players = {
            "player1": {
                name: "Player 1",
                hand: [],
                sets: []
            },
            "player0": {
                name: "Player 0",
                hand: [],
                sets: []
            },
            "player2": {
                name: "Player 2",
                hand: [],
                sets: []
            }
        }

        game = GoFishGame([], players)

        expect(game.currentState().currentTurn).toEqual("player0")
        game.endTurn()
        expect(game.currentState().currentTurn).toEqual("player1")
        game.endTurn()
        expect(game.currentState().currentTurn).toEqual("player2")
        game.endTurn()
        expect(game.currentState().currentTurn).toEqual("player0")
    })
})