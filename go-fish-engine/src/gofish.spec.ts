import { GoFishGame } from "."

describe("A new Go Fish game", function () {
    let game: GoFishGame
    beforeEach(function () {
        game = GoFishGame()
    })

    it("has empty game state", function () {
        expect(game.currentState().deck).toEqual([])
        expect(game.currentState().players).toEqual({})
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

    describe("after adding players", function () {
        beforeEach(function () {
            game.addPlayer("alex")
            game.addPlayer("bailey")
        })

        it('includes starting state for the new players', function () {
            expect(game.currentState().players["alex"]).toEqual({
                hand: [],
                sets: [],
            })
            expect(game.currentState().players["bailey"]).toEqual({
                hand: [],
                sets: [],
            })
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
            game.addPlayer("alex")
        })

        it('moves the top card of the deck to the given player\'s hand', function () {
            game.draw("alex")
            expect(game.currentState().deck).toEqual([
                {id: 9, value: "banana"},
                {id: 13, value: "cherry"},
            ])
            expect(game.currentState().players["alex"].hand).toEqual([
                {id: 7, value: "apple"},
            ])

            game.draw("alex")
            expect(game.currentState().deck).toEqual([
                {id: 13, value: "cherry"},
            ])
            expect(game.currentState().players["alex"].hand).toEqual([
                {id: 7, value: "apple"},
                {id: 9, value: "banana"},
            ])
        })

        describe('when the deck is empty', function () {
            beforeEach(function () {
                game.setDeck([])
            })

            it('does nothing', function () {
                game.draw("alex")
                expect(game.currentState().deck).toEqual([])
                expect(game.currentState().players["alex"].hand).toEqual([])
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
            game.addPlayer("alex")
            game.addPlayer("bailey")

            game.draw("alex")
            game.draw("alex")
            game.draw("bailey")
            game.give("alex", "bailey", 7)
        })

        it('transfers the given card from one player\'s hand to the other', function () {
            expect(game.currentState().players["alex"].hand).toEqual([
                {id: 9, value: "banana"},
            ])
            expect(game.currentState().players["bailey"].hand).toEqual([
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
            game.addPlayer("alex")

            game.draw("alex")
            game.draw("alex")
            game.draw("alex")
            game.draw("alex")

            expect(game.currentState().players["alex"].hand.map(card => card.value))
                .toEqual(["apple", "apple", "apple", "banana"])
            expect(game.currentState().players["alex"].sets).toEqual([])
        })

        it('allows scoring a set of three of a kind', function () {
            game.score("alex", [1,2,3])
            expect(game.currentState().players["alex"].sets).toEqual([
                [
                    {id: 1, value: "apple"},
                    {id: 2, value: "apple"},
                    {id: 3, value: "apple"},
                ]
            ])
            expect(game.currentState().players["alex"].hand).toEqual([
                {id: 4, value: "banana"}
            ])
        })

        it('does not allow scoring a set of less than three', function () {
            game.score("alex", [1,2])
            expect(game.currentState().players["alex"].sets).toEqual([])
            expect(game.currentState().players["alex"].hand).toEqual([
                {id: 1, value: "apple"},
                {id: 2, value: "apple"},
                {id: 3, value: "apple"},
                {id: 4, value: "banana"}
            ])
        })

        it('does not allow scoring a set of mixed cards', function () {
            game.score("alex", [2,3,4])
            expect(game.currentState().players["alex"].sets).toEqual([])
            expect(game.currentState().players["alex"].hand).toEqual([
                {id: 1, value: "apple"},
                {id: 2, value: "apple"},
                {id: 3, value: "apple"},
                {id: 4, value: "banana"}
            ])
        })

        it('does not allow scoring cards the player does not own', function () {
            game.score("alex", [5,6,7])
            expect(game.currentState().players["alex"].sets).toEqual([])
            expect(game.currentState().players["alex"].hand).toEqual([
                {id: 1, value: "apple"},
                {id: 2, value: "apple"},
                {id: 3, value: "apple"},
                {id: 4, value: "banana"}
            ])
        })
    })
})