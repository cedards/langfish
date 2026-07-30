import React from 'react'
import { act, render, screen } from '@testing-library/preact'
import { within } from '@testing-library/dom'
import userEvent, { UserEvent } from '@testing-library/user-event'
import App from './App'
import { GoFishGameplayClientInterface } from "@langfish/gameplay-api-client"
import { GoFishGameState } from "@langfish/go-fish-engine"

describe('Go Fish Gameplay UI', function () {
    let fakeClient: FakeGoFishWebsocketClientInterface
    let unmount: null | (() => void)
    let user: UserEvent;

    function renderApp() {
        unmount = render(<App client={fakeClient} gameId={"game1"}/>).unmount;
    }

    beforeEach(function () {
        user = userEvent.setup();
        fakeClient = FakeGoFishWebsocketClient()
    })

    it('connects to the server on load', async function () {
        expect(fakeClient.isConnected()).toBeFalsy()

        renderApp()
        expect(fakeClient.isConnected()).toBeTruthy()

        await promisesToResolve() // this avoids "action not wrapped in act()" warnings; I think a component is missing some cleanup.

        unmount!()
        unmount = null
        expect(fakeClient.isConnected()).toBeFalsy()
    })

    test('playing a game', async () => {
        renderApp()
        await promisesToResolve()
        expect_to_see_loading_screen();
        expect(fakeClient.joinedGame()).toEqual("game1")

        when_the_server_assigns_me_a_player_id(fakeClient);
        expect_to_see_loading_screen();

        await act(() => {
            fakeClient.setGameState({
                deck: [
                    { id: 1, value: 'A' },
                    { id: 2, value: 'B' },
                    { id: 3, value: 'C' },
                    { id: 4, value: 'D' },
                ],
                players: {
                    "TALAPAS": {
                        name: "talapas",
                        hand: [
                            { id: 7, value: 'A' },
                            { id: 8, value: 'B' },
                            { id: 9, value: 'A' },
                            { id: 10, value: 'B' },
                            { id: 11, value: 'A', revealed: true },
                        ],
                        sets: [
                            [
                                { id: 12, value: 'C' },
                                { id: 13, value: 'C' },
                                { id: 14, value: 'C' },
                            ]
                        ]
                    },
                    "LILU": {
                        name: "lilu",
                        hand: [
                            { id: 5, value: 'E' },
                            { id: 6, value: 'F', revealed: true },
                        ],
                        sets: [
                            [
                                { id: 15, value: 'D' },
                                { id: 16, value: 'D' },
                                { id: 17, value: 'D' },
                            ]
                        ]
                    },
                }
            })
        })

        expect_to_see_play_areas_for([/talapas/, /lilu/])
        expect_deck_to_have_number_of_cards("4");

        expect_player_hand_to_equal(['A', 'A', 'A', 'B', 'B']);
        expect_player_to_have_revealed_cards(['A'])
        expect_player_to_have_number_of_sets("C", 1);

        expect_opponent_to_have_number_of_cards("lilu", 2);
        expect_opponent_to_have_revealed_cards("lilu", ["F"])
        expect_opponent_to_have_number_of_sets("lilu", "D", 1)

        await draw_a_card();
        expect(fakeClient.draw).toHaveBeenCalled()

        await reveal_nth_card_with_value('A', 0)
        expect(fakeClient.hideOrShowCard).toHaveBeenCalledWith(7)

        await select_nth_card_with_value('A', 1)
        await select_nth_card_with_value('B', 0)
        await give_cards_to("lilu")
        expect(fakeClient.give).toHaveBeenCalledWith([9,8], "LILU")

        await select_nth_card_with_value('A', 0)
        await select_nth_card_with_value('B', 0)
        await select_nth_card_with_value('B', 0) // deselect
        await give_cards_to("lilu");
        expect(fakeClient.give).toHaveBeenCalledWith([7], "LILU")

        await select_nth_card_with_value('A', 0)
        expect_score_button_not_to_be_available()

        await select_nth_card_with_value('A', 1)
        expect_score_button_not_to_be_available()

        await select_nth_card_with_value('B', 0)
        expect_score_button_not_to_be_available() // three cards, but don't all match

        await select_nth_card_with_value('A', 2)
        expect_score_button_not_to_be_available() // three A's, but one B selected

        await select_nth_card_with_value('B', 0)
        expect_score_button_to_be_available() // only three A's selected

        await score_set()
        expect(fakeClient.score).toHaveBeenCalledWith([7,9,11])
        expect_score_button_not_to_be_available()
    });

    async function select_nth_card_with_value(cardValue: string, cardIndex: number) {
        await user.click(
            within(screen.getByLabelText(/talapas/))
                .queryAllByLabelText(new RegExp(`card: ${cardValue}`))[cardIndex]
        )
    }

    function expect_score_button_not_to_be_available() {
        expect(screen.queryByText("+1")).not.toBeInTheDocument()
    }

    function expect_score_button_to_be_available() {
        expect(screen.queryByText("+1")).toBeInTheDocument()
    }

    async function reveal_nth_card_with_value(cardValue: string, cardIndex: number) {
        await user.click(
            within(screen.getByLabelText(/talapas/))
                .queryAllByLabelText(`reveal this ${cardValue} card`)[cardIndex]
        )
    }

    async function score_set() {
        await user.click(screen.getByText("+1"))
    }

    async function give_cards_to(recipientName: string) {
      await user.click(within(screen.getByLabelText("play areas")).getByText(recipientName))
    }

    function expect_opponent_to_have_number_of_sets(opponentName: string, cardValue: string, numberOfSets: number) {
        expect(
            within(screen.getByLabelText(opponentName))
                .queryAllByLabelText(`set: ${cardValue}`)
                .length
        ).toEqual(numberOfSets)
    }

    function expect_player_to_have_number_of_sets(cardValue: string, numberOfSets: number) {
        expect(
            within(screen.getByLabelText(/talapas/))
                .queryAllByLabelText(`set: ${cardValue}`)
                .length
        ).toEqual(numberOfSets)
    }

    function expect_player_hand_to_equal(hand: string[]) {
        expect(
            within(screen.getByLabelText(/talapas/))
                .queryAllByRole("checkbox")
                .map(element => element.textContent)
        ).toEqual(hand)
    }

    function expect_player_to_have_revealed_cards(cardValues: string[]) {
        expect(
            within(screen.getByLabelText(/talapas/))
                .queryAllByLabelText(/revealed card/)
                .map(element => element.textContent)
        ).toEqual(cardValues)
    }

    function expect_opponent_to_have_number_of_cards(opponentName: string, numberOfCards: number) {
        expect(screen.getByLabelText(opponentName)).toHaveTextContent(`${numberOfCards}`)
    }

    function expect_opponent_to_have_revealed_cards(playerName: string, cardValues: string[]) {
        expect(
            within(screen.getByLabelText(playerName))
                .queryAllByLabelText(/revealed card/)
                .map(element => element.textContent)
        ).toEqual(cardValues)
    }

    async function draw_a_card() {
        await user.click(screen.getByLabelText("deck"))
    }

    function expect_deck_to_have_number_of_cards(numberOfCards: string) {
        expect(screen.getByLabelText("deck")).toHaveTextContent(numberOfCards)
    }

    function expect_to_see_play_areas_for(playerNames: RegExp[]) {
        playerNames.forEach(playerName => {
            expect(within(screen.getByLabelText("play areas")).getByText(playerName)).toBeInTheDocument()
        })
    }

    function expect_to_see_loading_screen() {
        expect(screen.getByText(/Connecting.../)).toBeInTheDocument()
    }

    function when_the_server_assigns_me_a_player_id(fakeClient: FakeGoFishWebsocketClientInterface) {
        act(() => {
            fakeClient.setPlayerId("TALAPAS")
        })
    }
})

interface FakeGoFishWebsocketClientInterface extends GoFishGameplayClientInterface {
    id: string,
    joinedGame(): string | null;
    setPlayerId(name: string): void;
    setGameState(gameState: GoFishGameState): void;
}

function FakeGoFishWebsocketClient(): FakeGoFishWebsocketClientInterface {
    let _isConnected = false
    let _joinedGame: string | null = null
    const _setPlayerIdCallbacks: Array<(name: string) => void> = []
    const _setGameStateCallbacks: Array<(gameState: GoFishGameState) => void> = []

    let _id = Math.round(Math.random()*10000).toString();
    return {
        id: _id,
        connect: () => {
            _isConnected = true
            return Promise.resolve()
        },
        disconnect: () => {
            _isConnected = false
            return Promise.resolve()
        },
        joinGame: (gameId: string) => { _joinedGame = gameId },
        renamePlayer: jest.fn(),
        draw: jest.fn(),
        give: jest.fn(),
        score: jest.fn(),
        onSetPlayerId: (callback) => {
            _setPlayerIdCallbacks.push(callback)
        },
        onUpdateGameState: (callback) => {
            _setGameStateCallbacks.push(callback)
        },
        isConnected(): boolean {
            return _isConnected
        },
        joinedGame(): string | null {
            return _joinedGame;
        },
        setPlayerId(name: string): void {
            _setPlayerIdCallbacks.forEach(callback => callback(name))
        },
        setGameState(gameState): void {
            _setGameStateCallbacks.forEach(callback => callback(gameState))
        },
        hideOrShowCard: jest.fn(),
        removePlayer: jest.fn(),
        endTurn: jest.fn()
    }
}

async function promisesToResolve() {
    await act(async () => { await Promise.resolve() })
}
