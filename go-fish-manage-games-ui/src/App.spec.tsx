import React from 'react'
import {act, render, screen} from '@testing-library/preact'
import userEvent, { UserEvent } from '@testing-library/user-event'
import App from './App'
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client"
import {GoFishGameState} from "@langfish/go-fish-engine"
import {TemplatesClientInterface} from "./creating-a-game/TemplatesClientInterface";

describe('Go Fish Managing Games UI', function () {
    let fakeClient: FakeGoFishWebsocketClientInterface
    let templatesClient: TemplatesClientInterface
    let user: UserEvent;

    function renderApp() {
        return render(<App templatesClient={templatesClient} client={fakeClient}/>);
    }

    beforeEach(function () {
        user = userEvent.setup();
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
        await visit("/")

        expect_to_see_available_templates(['Template A', 'Template B'])

        await select_template_without_some_cards(/Template A/, ['C']);
        expect(fakeClient.createGame).toHaveBeenCalledWith([{ value: 'A' }])

        expect_to_see_game_link_for(/game1/);
    })

    async function visit(path: string) {
        window.history.pushState({}, path, path)
        await promisesToResolve()
    }

    async function select_template_without_some_cards(templateName: RegExp, cardsToExclude: string[]) {
        await user.click(screen.getByText(templateName))

        for (let i = 0; i < cardsToExclude.length; i++) {
            await user.click(screen.getByLabelText(cardsToExclude[i]))
        }

        await user.click(screen.getByText('Create Game'))
    }

    function expect_to_see_game_link_for(gameId: RegExp) {
        expect(screen.queryByText(/Send your players to/)).toBeInTheDocument()
        expect(screen.queryByText(gameId)).toBeInTheDocument()
    }

    function expect_to_see_available_templates(templates: Array<string>) {
        templates.forEach(template => {
            expect(screen.queryByText(template)).toBeInTheDocument()
        })
    }
})

interface FakeGoFishWebsocketClientInterface extends GoFishGameplayClientInterface {
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
