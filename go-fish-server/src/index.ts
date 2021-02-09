import { Server } from "@hapi/hapi"
import {GoFishGame} from "@langfish/go-fish-engine"
import {GoFishGameplayPlugin} from "@langfish/go-fish-websocket-client"
import {FrontendPlugin} from "./frontend-plugin";

const server = new Server({ port: 5000 })

const start = async () => {
    const game = GoFishGame()
    game.setDeck([
        { id: 1, value: "🍎" },
        { id: 2, value: "🐺" },
        { id: 3, value: "🥔" },
        { id: 4, value: "🥄" },
        { id: 5, value: "🔪" },
        { id: 6, value: "🦅" },
        { id: 7, value: "🍎" },
        { id: 8, value: "🐺" },
        { id: 9, value: "🥔" },
        { id: 10, value: "🥄" },
        { id: 11, value: "🔪" },
        { id: 12, value: "🦅" },
        { id: 13, value: "🍎" },
        { id: 14, value: "🐺" },
        { id: 15, value: "🥔" },
        { id: 16, value: "🥄" },
        { id: 17, value: "🔪" },
        { id: 18, value: "🦅" },
        { id: 19, value: "🍎" },
        { id: 20, value: "🐺" },
        { id: 21, value: "🥔" },
        { id: 22, value: "🥄" },
        { id: 23, value: "🔪" },
        { id: 24, value: "🦅" },
    ])
    const gameRepository = {
        getGame(gameId) {
            if(gameId === "game1") return game
            return null
        }
    }

    await server.register({
        plugin: GoFishGameplayPlugin,
        options: { gameRepository: gameRepository }
    })
    await server.register(FrontendPlugin)

    await server.start()
    console.log('Server running on %s', server.info.uri);
};
start()

