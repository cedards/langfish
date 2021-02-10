import { Server } from "@hapi/hapi"
import {GoFishGame} from "@langfish/go-fish-engine"
import {GoFishGameplayPlugin} from "@langfish/go-fish-websocket-server-plugin"
import {FrontendPlugin} from "./frontend-plugin";

const server = new Server({ port: process.env.PORT || 5000 })

function shuffleDeck(deck) {
    const shuffledDeck = []
    while(deck.length > 0) {
        const choice = Math.floor(Math.random() * deck.length)
        shuffledDeck.push(deck[choice])
        deck = deck.slice(0,choice).concat(deck.slice(choice+1))
    }
    return shuffledDeck
}

function populateDeck(items) {
    const deck = []
    items.forEach(item => {
        deck.push(item)
        deck.push(item)
        deck.push(item)
        deck.push(item)
        deck.push(item)
        deck.push(item)
    })
    return deck.map((item, index) => ({
        id: index+1,
        value: item
    }))
}

function buildDeck() {
    return shuffleDeck(populateDeck([
        "🦆",
        "🏎️",
        "📃",
        "🥔",
        "🔑",
        "🥄",
        "🐻",
        "🍎",
    ]))
}

const start = async () => {
    const game = GoFishGame()
    game.setDeck(buildDeck())
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