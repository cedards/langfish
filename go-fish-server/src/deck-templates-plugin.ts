import {ResponseToolkit, Server} from "@hapi/hapi";

export interface DeckTemplateSource {
    getTemplates(): Promise<Array<{ name: string, template: Array<{ value: string, image?: string }>}>>
}

export const DeckTemplatesPlugin = {
    name: "go-fish-deck-templates",
    register: async function (server: Server, options: {deckTemplateSource: DeckTemplateSource}) {
        server.route({
            method: 'GET',
            path: '/templates',
            handler: (request, h: ResponseToolkit) => {
                try {
                    return options.deckTemplateSource.getTemplates()
                } catch (e) {
                    console.error(e)
                    throw e
                }
            }
        })
    }
}