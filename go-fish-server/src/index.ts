import { Server } from "@hapi/hapi"
import {
    GoFishGameplayPlugin,
    InMemoryGameRepository,
} from "@langfish/go-fish-gameplay-server-plugin"
import {FrontendPlugin} from "./frontend-plugin"
import {DeckTemplatesPlugin} from "./deck-templates-plugin";

const server = new Server({ port: process.env.PORT || 5000 })

const start = async () => {
    const gameRepository = InMemoryGameRepository()

    await server.register({
        plugin: GoFishGameplayPlugin,
        options: { gameRepository: gameRepository }
    })
    await server.register(DeckTemplatesPlugin)
    await server.register(FrontendPlugin)

    await server.start()
    console.log('Server running on %s', server.info.uri);
};
start()