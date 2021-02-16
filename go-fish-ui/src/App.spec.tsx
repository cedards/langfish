import React from 'react';
import {act, render, screen} from '@testing-library/react';
import { within } from '@testing-library/dom'
import App from './App';
import {GoFishGameplayClientInterface} from "@langfish/go-fish-websocket-client";
import {GoFishGameState} from "@langfish/go-fish-engine";

interface FakeGoFishWebsocketClientInterface extends GoFishGameplayClientInterface {
    isConnected(): boolean;
    joinedGame(): string | null;
    setPlayerId(name: string): void;

    setGameState(gameState: GoFishGameState): void;
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
        joinGame: (gameId: string) => {
            _joinedGame = gameId
        },
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
        fakeClient.setPlayerId("talapas")
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
                        { id: 11, value: 'A' },
                    ],
                    sets: [
                        [
                            { id: 12, value: 'C' },
                            { id: 13, value: 'C' },
                            { id: 14, value: 'C' },
                        ]
                    ]
                },
                "lilu": {
                    hand: [
                        { id: 5, value: 'E' },
                        { id: 6, value: 'F' },
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

    expect(screen.getByText(/talapas/)).toBeInTheDocument()
    expect(screen.getByText(/lilu/)).toBeInTheDocument()
    expect(screen.getByLabelText("deck")).toHaveTextContent("4")

    const talapasHand = within(screen.getByLabelText(/talapas/)).queryAllByRole("checkbox");
    expect(talapasHand.length).toEqual(5)
    expect(talapasHand.map(element => element.textContent)).toEqual(['A','A','A','B','B'])
    expect(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("set: C").length).toEqual(1)

    expect(within(screen.getByLabelText("lilu")).queryAllByLabelText("hidden card").length).toEqual(2)
    expect(within(screen.getByLabelText("lilu")).queryAllByLabelText("set: D").length).toEqual(1)

    act(() => {
        screen.getByLabelText("deck").click()
    })
    expect(fakeClient.draw).toHaveBeenCalled()

    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[1].click()
    })
    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0].click()
    })
    act(() => {
        screen.getByText("lilu").click()
    })

    expect(fakeClient.give).toHaveBeenCalledWith([9,8], "lilu")

    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[0].click()
    })
    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0].click()
    })
    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0].click()
    })
    act(() => {
        screen.getByText("lilu").click()
    })
    expect(fakeClient.give).toHaveBeenCalledWith([7], "lilu")

    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[0].click()
    })
    expect(screen.queryByText("+1")).not.toBeInTheDocument()
    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[1].click()
    })
    expect(screen.queryByText("+1")).not.toBeInTheDocument()
    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0].click()
    })
    expect(screen.queryByText("+1")).not.toBeInTheDocument()
    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[2].click()
    })
    expect(screen.queryByText("+1")).not.toBeInTheDocument()
    act(() => {
        within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0].click()
    })
    expect(screen.queryByText("+1")).toBeInTheDocument()

    act(() => {
        screen.getByText("+1").click()
    })
    expect(fakeClient.score).toHaveBeenCalledWith([7,9,11])
    expect(screen.queryByText("+1")).not.toBeInTheDocument()

    unmount()

    expect(fakeClient.isConnected()).toBeFalsy()
});
