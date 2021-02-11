import React from 'react';
import {act, render, screen} from '@testing-library/react';
import { within } from '@testing-library/dom'
import App from './App';
import {GoFishGameplayClientInterface} from "@langfish/go-fish-websocket-client";
import {GoFishGameState} from "@langfish/go-fish-engine";

interface FakeGoFishWebsocketClientInterface extends GoFishGameplayClientInterface {
    isConnected(): boolean;
    joinedGame(): string | null;
    setPlayerName(name: string): void;

    setGameState(gameState: GoFishGameState): void;
}

function FakeGoFishWebsocketClient(): FakeGoFishWebsocketClientInterface {
    let _isConnected = false
    let _joinedGame: string | null = null
    const _setPlayerNameCallbacks: Array<(name: string) => void> = []
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
        joinGame: (gameId: string) => {
            _joinedGame = gameId
        },
        draw: jest.fn(),
        give: jest.fn(),
        onSetPlayerName: (callback) => {
            _setPlayerNameCallbacks.push(callback)
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
        setPlayerName(name: string): void {
            _setPlayerNameCallbacks.forEach(callback => callback(name))
        },
        setGameState(gameState): void {
            _setGameStateCallbacks.forEach(callback => callback(gameState))
        },
    }
}

async function promisesToResolve() {
    return Promise.resolve()
}

test('playing a game', async () => {
    const fakeClient = FakeGoFishWebsocketClient()

    expect(fakeClient.isConnected()).toBeFalsy()
    const { unmount } = render(<App client={fakeClient}/>)
    expect(fakeClient.isConnected()).toBeTruthy()

    await promisesToResolve()
    expect(fakeClient.joinedGame()).toEqual("game1")

    expect(screen.getByText(/Connecting.../)).toBeInTheDocument()

    act(() => {
        fakeClient.setPlayerName("talapas")
    })

    expect(screen.getByText(/Connecting.../)).toBeInTheDocument()

    act(() => {
        fakeClient.setGameState({
            deck: [
                { id: 1, value: 'A' },
                { id: 2, value: 'B' },
                { id: 3, value: 'C' },
                { id: 4, value: 'D' },
            ],
            players: {
                "talapas": {
                    hand: [
                        { id: 7, value: 'A' },
                        { id: 8, value: 'B' },
                        { id: 9, value: 'A' },
                        { id: 10, value: 'B' },
                    ],
                    sets: []
                },
                "lilu": {
                    hand: [
                        { id: 5, value: 'E' },
                        { id: 6, value: 'F' },
                    ],
                    sets: []
                },
            }
        })
    })

    expect(screen.getByText(/talapas/)).toBeInTheDocument()
    expect(screen.getByText(/lilu/)).toBeInTheDocument()
    expect(screen.getByText(/There are 4 cards left in the deck/)).toBeInTheDocument()

    const talapasHand = within(screen.getByLabelText("😀 talapas")).queryAllByRole("checkbox");
    expect(talapasHand.length).toEqual(4)
    expect(talapasHand.map(element => element.textContent)).toEqual(['A','A','B','B'])
    expect(within(screen.getByLabelText("lilu")).queryAllByLabelText("hidden card").length).toEqual(2)

    act(() => {
        screen.getByText("Draw a card").click()
    })
    expect(fakeClient.draw).toHaveBeenCalled()

    act(() => {
        within(screen.getByLabelText("😀 talapas")).queryAllByLabelText("hidden card: A")[1].click()
    })
    act(() => {
        within(screen.getByLabelText("😀 talapas")).queryAllByLabelText("hidden card: B")[0].click()
    })
    act(() => {
        screen.getByText("lilu").click()
    })

    expect(fakeClient.give).toHaveBeenCalledWith([9,8], "lilu")

    act(() => {
        within(screen.getByLabelText("😀 talapas")).queryAllByLabelText("hidden card: A")[0].click()
    })
    act(() => {
        within(screen.getByLabelText("😀 talapas")).queryAllByLabelText("hidden card: B")[0].click()
    })
    act(() => {
        within(screen.getByLabelText("😀 talapas")).queryAllByLabelText("hidden card: B")[0].click()
    })
    act(() => {
        screen.getByText("lilu").click()
    })
    expect(fakeClient.give).toHaveBeenCalledWith([7], "lilu")

    unmount()

    expect(fakeClient.isConnected()).toBeFalsy()
});
