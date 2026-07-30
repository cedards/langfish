import {Server} from "@hapi/hapi"
import {GoFishGameplayPlugin} from "@langfish/gameplay-server-plugin"
import {GoFishManagingGamesPlugin} from "@langfish/managing-games-server-plugin"
import {InMemoryGameRepository} from "@langfish/managing-games-gameplay-adapter"
import {FrontendPlugin} from "./frontend-plugin"
import {DeckTemplateSource, DeckTemplatesPlugin} from "./deck-templates-plugin";
import {EnvironmentVariableDeckTemplateSource} from "./environment-variable-deck-template-source";
import {CsvDeckTemplateSource} from "@langfish/managing-games-csv-plugin";

const server = new Server({port: process.env.PORT || 5000})

const start = async () => {
    let gameRepository = InMemoryGameRepository()

    await server.register({
        plugin: GoFishGameplayPlugin,
        options: {gameRepository: gameRepository}
    })
    await server.register({
        plugin: GoFishManagingGamesPlugin,
        options: {gameRepository: gameRepository}
    })
    await server.register({
        plugin: DeckTemplatesPlugin,
        options: {deckTemplateSource: chooseTemplateSource()}
    })
    await server.register(FrontendPlugin)

    server.ext('onPreResponse', (request, reply) => {
        const response: any = request.response;
        if (response.isBoom) { // if not error then continue :)
            console.log("BOOM");
            console.log(response);
        }
        return response;
    });

    await server.start()
};

function chooseTemplateSource(): DeckTemplateSource {
    if (process.env.LANGFISH_DECK_TEMPLATE_CSV_URL)
        return CsvDeckTemplateSource(process.env.LANGFISH_DECK_TEMPLATE_CSV_URL)

    if (process.env.LANGFISH_DECK_TEMPLATES)
        return EnvironmentVariableDeckTemplateSource("LANGFISH_DECK_TEMPLATES")

    throw new Error(`I couldn't configure the source for deck templates.
    You should check the environment variables where the server is running. You can:
    - set LANGFISH_DECK_TEMPLATE_CSV_URL to a url pointing to a csv file, or
    - set LANGFISH_DECK_TEMPLATES to a json string containing serialized templates.
    `)
}

start()
    .then(() => console.log('Server running on %s', server.info.uri))
    .catch((reason) => console.error(reason))