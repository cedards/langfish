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
        ...item,
        id: index+1,
    }))
}

function buildDeck() {
    return shuffleDeck(populateDeck([
        { value: "saqul'aaq", image: "https://drive.google.com/uc?id=1N8FWetDVpGq7SyMZnkeq0Rs_AnkZSxxu" },
        { value: "kaaRaq", image: "https://drive.google.com/uc?id=1X_1l6jVdYExDwcJ4hK06INB6MfkQT3AG" },
        { value: "paRag'autaq (N) / paRag'uutaq (S)", image: "https://drive.google.com/uc?id=1zYn03jp_3JemEy44Iryw9XXwnHWDUZS4" },
        { value: "wiil'kaaq (N) / wiiR'kaaq (S)", image: "https://drive.google.com/uc?id=1LwoyYDRYSSC7ylONv_DJKvM9kHWd1y3s" },
        { value: "kalikaq", image: "https://drive.google.com/uc?id=1b1KMLAuS9dwNv_mlfDRppAqOVtduhFGq" },
        { value: "kaRtuugaaq", image: "https://drive.google.com/uc?id=11PS0Ux_RpidiwxQjZvRTJ8Z7BeFeu_eT" },
        { value: "kluucaq", image: "https://drive.google.com/uc?id=17Yq4B7rl0Oyy90gzF70xeJvurEm3Rt1l" },
        { value: "yaamaq", image: "https://drive.google.com/uc?id=1cwjbp3VGRCFMBbkadwR4BqqhyijpOTNn" },
        { value: "qatayaq", image: "https://drive.google.com/uc?id=1dEFxnIFrAPTeqSrk-swhGr4tyM5Oqd2h" },
        { value: "laus'kaaq (N) / luus'kaaq (S)", image: "https://drive.google.com/uc?id=1UKlqb75pYWRIHIFtmWm0xDGsCn-YHCTJ  " },
        { value: "taquka'aq", image: "https://drive.google.com/uc?id=1grf1RjprlpkkwgHJNrBRd3ntdzHtbytG" },
        { value: "yaaplakaaq", image: "https://drive.google.com/uc?id=1vIx334SjSFDsm0JT0aIjoJo8sE8pyr7p" },
        { value: "wiinaq", image: "https://drive.google.com/uc?id=1rMfTMxMGfB2WiQMc7NaeBqgPsxCQcsfz" },
        { value: "caskaq", image: "https://drive.google.com/uc?id=1poY_6S4x1sJbj1oMP5teiDFQLlqJ83t-" },
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