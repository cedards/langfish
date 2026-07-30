import React from 'react'
import {act, render, screen} from '@testing-library/preact'
import userEvent, { UserEvent } from '@testing-library/user-event'
import App from './App'
import {GoFishManagingGamesClientInterface} from "@langfish/managing-games-api-client"
import {TemplatesClientInterface} from "./creating-a-game/TemplatesClientInterface";

describe('Go Fish Managing Games UI', function () {
    let fakeClient: GoFishManagingGamesClientInterface
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

function FakeTemplatesClient(templates: { template: { value: string }[]; name: string }[]) {
    return {
        getTemplates: () => Promise.resolve(templates)
    }
}

function FakeGoFishWebsocketClient(): GoFishManagingGamesClientInterface {
    return {
        createGame: jest.fn(() => Promise.resolve("game1")),
    }
}

async function promisesToResolve() {
    await act(async () => { await Promise.resolve() })
}
