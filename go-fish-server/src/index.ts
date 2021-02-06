import { Server } from "@hapi/hapi"
import * as Nes from "@hapi/nes"
import {GoFishGame} from "@langfish/go-fish-engine"

const server = new Server({ port: 5000 })

interface MessagePayload {
    type: string,
    player: string
}

const playerNames = [
    "Alex",
    "Bailey",
    "Charlie",
    "Drew",
    "Elliott",
    "Frankie",
    "Harley",
    "Jordan",
    "Kendall",
    "Lindsey",
    "Morgan",
]

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

    await server.register(Nes)

    async function publishNewGameState() {
        await server.publish("/game", {
            type: 'UPDATE_GAME_STATE',
            state: game.currentState()
        });
    }

    server.route({
        method: 'POST',
        path: '/game',
        options: {
            id: 'game',
            handler: (request, h) => {
                const payload = request.payload as MessagePayload
                switch (payload.type) {
                    case "DRAW":
                        game.draw(payload.player)
                        publishNewGameState()
                        break
                }
                return true;
            }
        }
    })

    server.subscription('/game', {
        onSubscribe: async function(socket, path, params) {
            const playerName = playerNames.find(name => !Object.keys(game.currentState().players).includes(name))
            game.addPlayer(playerName)
            await socket.publish(path, {
                type: 'SET_NAME',
                name: playerName
            })
            await socket.publish(path, {
                type: 'UPDATE_GAME_STATE',
                state: game.currentState()
            });
            await publishNewGameState()
        }
    })

    await server.start()
    console.log('Server running on %s', server.info.uri);
};
start()

