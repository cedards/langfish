import React from 'react'
import {act, render, screen} from '@testing-library/react'
import {within} from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import App from './App'
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client"
import {GoFishGameState} from "@langfish/go-fish-engine"
import {TemplatesClientInterface} from "./creating-a-game/TemplatesClientInterface";

describe('Go Fish UI', function () {
    let fakeClient: FakeGoFishWebsocketClientInterface
    let templatesClient: TemplatesClientInterface

    function renderApp() {
        return render(<App templatesClient={templatesClient} client={fakeClient}/>);
    }

    beforeEach(function () {
        fakeClient = FakeGoFishWebsocketClient()
        templatesClient = FakeTemplatesClient([
            {
                name: 'Template A',
                template: [{ value: 'A' }, { value: 'C' }]
            }, {
                name: 'Template B',
                template: [{ value: 'B' }]
            },
        ])
    })

    it('connects to the server on load', async function () {
        expect(fakeClient.isConnected()).toBeFalsy()

        const { unmount } = renderApp()
        expect(fakeClient.isConnected()).toBeTruthy()

        await promisesToResolve() // this avoids "action not wrapped in act()" warnings; I think a component is missing some cleanup.

        unmount()
        expect(fakeClient.isConnected()).toBeFalsy()
    })

    test('creating a game', async function () {
        renderApp()
        await visit("/");

        expect_to_see_available_templates(['Template A', 'Template B'])

        select_template_without_some_cards(/Template A/, ['C']);
        expect(fakeClient.createGame).toHaveBeenCalledWith([{ value: 'A' }])
        await promisesToResolve()

        expect_to_see_game_link_for(/game1/);
        follow_game_link_for(/game1/);
        await promisesToResolve()
        expect(fakeClient.joinedGame()).toEqual("game1")
    })

    test('playing a game', async () => {
        renderApp()
        await visit("/play/game1")
        expect(fakeClient.joinedGame()).toEqual("game1")

        expect_to_see_loading_screen();
        when_the_server_assigns_me_a_player_id(fakeClient);
        expect_to_see_loading_screen();

        act(() => {
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

        draw_a_card();
        expect(fakeClient.draw).toHaveBeenCalled()

        reveal_nth_card_with_value('A', 0)
        expect(fakeClient.hideOrShowCard).toHaveBeenCalledWith(7)

        select_nth_card_with_value('A', 1)
        select_nth_card_with_value('B', 0)
        give_cards_to("lilu")

        expect(fakeClient.give).toHaveBeenCalledWith([9,8], "LILU")

        select_nth_card_with_value('A', 0)
        select_nth_card_with_value('B', 0)
        select_nth_card_with_value('B', 0) // deselect
        give_cards_to("lilu");
        expect(fakeClient.give).toHaveBeenCalledWith([7], "LILU")

        select_nth_card_with_value('A', 0)
        expect_score_button_not_to_be_available()

        select_nth_card_with_value('A', 1)
        expect_score_button_not_to_be_available()

        select_nth_card_with_value('B', 0)
        expect_score_button_not_to_be_available() // three cards, but don't all match

        select_nth_card_with_value('A', 2)
        expect_score_button_not_to_be_available() // three A's, but one B selected

        select_nth_card_with_value('B', 0)
        expect_score_button_to_be_available() // only three A's selected

        score_set()
        expect(fakeClient.score).toHaveBeenCalledWith([7,9,11])
        expect_score_button_not_to_be_available()
    });
})

async function visit(path: string) {
    window.history.pushState({}, path, path)
    await promisesToResolve()
}

function select_template_without_some_cards(templateName: RegExp, cardsToExclude: string[]) {
    userEvent.click(screen.getByText(templateName))
    cardsToExclude.forEach(cardValue => {
        userEvent.click(screen.getByLabelText(cardValue))
    })
    userEvent.click(screen.getByText('Create Game'))
}

function expect_to_see_game_link_for(gameId: RegExp) {
    expect(screen.queryByText(/Send your players to/)).toBeInTheDocument()
    expect(screen.queryByText(gameId)).toBeInTheDocument()
}

function follow_game_link_for(gameLink: RegExp) {
    userEvent.click(screen.getByText(gameLink))
}

function select_nth_card_with_value(cardValue: string, cardIndex: number) {
    userEvent.click(
        within(screen.getByLabelText(/talapas/))
            .queryAllByLabelText(new RegExp(`card: ${cardValue}`))
            [cardIndex]
    )
}

function expect_score_button_not_to_be_available() {
    expect(screen.queryByText("+1")).not.toBeInTheDocument()
}

function expect_score_button_to_be_available() {
    expect(screen.queryByText("+1")).toBeInTheDocument()
}

function reveal_nth_card_with_value(cardValue: string, cardIndex: number) {
    userEvent.click(
        within(screen.getByLabelText(/talapas/))
            .queryAllByLabelText(`reveal this ${cardValue} card`)
            [cardIndex]
    )
}

function score_set() {
    userEvent.click(screen.getByText("+1"))
}

function give_cards_to(recipientName: string) {
    userEvent.click(within(screen.getByLabelText("play areas")).getByText(recipientName))
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
    expect(screen.getByLabelText(opponentName)).toHaveTextContent(numberOfCards)
}

function expect_opponent_to_have_revealed_cards(playerName: string, cardValues: string[]) {
    expect(
        within(screen.getByLabelText(playerName))
            .queryAllByLabelText(/revealed card/)
            .map(element => element.textContent)
    ).toEqual(cardValues)
}

function draw_a_card() {
    userEvent.click(screen.getByLabelText("deck"))
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

function expect_to_see_available_templates(templates: Array<string>) {
    templates.forEach(template => {
        expect(screen.queryByText(template)).toBeInTheDocument()
    })
}

interface FakeGoFishWebsocketClientInterface extends GoFishGameplayClientInterface {
    isConnected(): boolean;
    joinedGame(): string | null;
    setPlayerId(name: string): void;
    setGameState(gameState: GoFishGameState): void;
}

function FakeTemplatesClient(templates: { template: { value: string }[]; name: string }[]) {
    return {
        getTemplates: () => Promise.resolve(templates)
    }
}

function FakeGoFishWebsocketClient(): FakeGoFishWebsocketClientInterface {
    let _isConnected = false
    let _joinedGame: string | null = null
    const _setPlayerIdCallbacks: Array<(name: string) => void> = []
    const _setGameStateCallbacks: Array<(gameState: GoFishGameState) => void> = []

    return {
        connect: () => {
            _isConnected = true
            return Promise.resolve()
        },
        disconnect: () => {
            _isConnected = false
            return Promise.resolve()
        },
        createGame: jest.fn(() => Promise.resolve("game1")),
        joinGame: (gameId: string) => {
            _joinedGame = gameId
        },
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
