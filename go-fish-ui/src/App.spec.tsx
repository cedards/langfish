import React from 'react'
import {act, render, screen} from '@testing-library/react'
import { within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import App from './App'
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client"
import {GoFishGameState} from "@langfish/go-fish-engine"

interface FakeGoFishWebsocketClientInterface extends GoFishGameplayClientInterface {
    isConnected(): boolean;
    joinedGame(): string | null;
    setPlayerId(name: string): void;
    setGameState(gameState: GoFishGameState): void;
}

function FakeTemplatesClient() {
    return {
        getTemplates: () => Promise.resolve([
            {
                name: 'Template A',
                template: [{ value: 'A' }]
            }, {
                name: 'Template B',
                template: [{ value: 'B' }]
            },
        ])
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
    }
}

async function promisesToResolve() {
    await act(async () => {
        await Promise.resolve()
    })
}

test('playing a game', async () => {
    const fakeClient = FakeGoFishWebsocketClient()
    const templatesClient = FakeTemplatesClient()

    expect(fakeClient.isConnected()).toBeFalsy()
    const { unmount } = render(<App templatesClient={templatesClient} client={fakeClient}/>)
    expect(fakeClient.isConnected()).toBeTruthy()

    await promisesToResolve()

    expect(screen.queryByText(/Template A/)).toBeInTheDocument()
    expect(screen.queryByText(/Template B/)).toBeInTheDocument()

    act(() => {
        screen.getByText(/Template A/).click()
    })

    expect(fakeClient.createGame).toHaveBeenCalledWith([{ value: 'A' }])

    await promisesToResolve()

    expect(screen.queryByText(/Send your players to/)).toBeInTheDocument()
    expect(screen.queryByText(/game1/)).toBeInTheDocument()

    act(() => {
        screen.getByText(/game1/).click()
    })
    await promisesToResolve()

    expect(fakeClient.joinedGame()).toEqual("game1")

    expect(screen.getByText(/Connecting.../)).toBeInTheDocument()

    act(() => {
        fakeClient.setPlayerId("TALAPAS")
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
                "TALAPAS": {
                    name: "talapas",
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
                "LILU": {
                    name: "lilu",
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
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[1])
    })
    act(() => {
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0])
    })
    act(() => {
        userEvent.click(screen.getByText("lilu"))
    })

    expect(fakeClient.give).toHaveBeenCalledWith([9,8], "LILU")

    act(() => {
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[0])
    })
    act(() => {
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0])
    })
    act(() => {
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0])
    })
    act(() => {
        userEvent.click(screen.getByText("lilu"))
    })
    expect(fakeClient.give).toHaveBeenCalledWith([7], "LILU")

    act(() => {
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[0])
    })
    expect(screen.queryByText("+1")).not.toBeInTheDocument()
    act(() => {
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[1])
    })
    expect(screen.queryByText("+1")).not.toBeInTheDocument()
    act(() => {
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0])
    })
    expect(screen.queryByText("+1")).not.toBeInTheDocument()
    act(() => {
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: A")[2])
    })
    expect(screen.queryByText("+1")).not.toBeInTheDocument()
    act(() => {
        userEvent.click(within(screen.getByLabelText(/talapas/)).queryAllByLabelText("hidden card: B")[0])
    })
    expect(screen.queryByText("+1")).toBeInTheDocument()

    act(() => {
        userEvent.click(screen.getByText("+1"))
    })
    expect(fakeClient.score).toHaveBeenCalledWith([7,9,11])
    expect(screen.queryByText("+1")).not.toBeInTheDocument()

    unmount()

    expect(fakeClient.isConnected()).toBeFalsy()
});
