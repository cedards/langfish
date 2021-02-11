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
        { value: "saqul'aaq", image: "https://drive.google.com/uc?id=1Qlxh332AYYHt1FhfDbeQ13EowLzr7q1f" },
        { value: "kaaRaq", image: "https://drive.google.com/uc?id=1p1hwwpKGuHGaYCAilflxuErcZxENRG6g" },
        { value: "paRag'autaq (N) / paRag'uutaq (S)", image: "https://drive.google.com/uc?id=1gXwZlQm7aDt-49D-hRVad-oXgDGjosfB" },
        { value: "wiil'kaaq (N) / wiiR'kaaq (S)", image: "https://drive.google.com/uc?id=1r2VHyeglXucwDn9n6Nr33BI_OJRFYcPn" },
        { value: "kalikaq", image: "https://drive.google.com/uc?id=1lbiJPNKIdp7c4YpAc5QJN1AtCpY1mDXb" },
        { value: "kaRtuugaaq", image: "https://drive.google.com/uc?id=1LSr0X7_it2Kqah2BIdhHz0x_F4JznDPJ" },
        { value: "kluucaq", image: "https://drive.google.com/uc?id=1rrAUndFt7kPbN55ep1TCbz2Squa40He0" },
        { value: "yaamaq", image: "https://drive.google.com/uc?id=1Tcj5v8dRm_knzPr1KLBs76Sm2NCrIu0k" },
        { value: "qatayaq", image: "https://drive.google.com/uc?id=101BBjeKrEySQ4QqUxdG8EFUIuLq-xzlV" },
        { value: "laus'kaaq (N) / luus'kaaq (S)", image: "https://drive.google.com/uc?id=1GHYrznVodYCTL_l6QE4ho0584cT1zNVy" },
        { value: "taquka'aq", image: "https://drive.google.com/uc?id=1j3v3uU_M4pIENy43oEqcwmrngFYnGfDa" },
        { value: "yaaplakaaq", image: "https://drive.google.com/uc?id=1swG6hxLvxO8H73A2Up47zsAV_P3VcWTI" },
        { value: "wiinaq", image: "https://drive.google.com/uc?id=1FuuklanvsC2u6g0pi5wNR8bidHE5aCb2" },
        { value: "caskaq", image: "https://drive.google.com/uc?id=1DyxoU7QuOOqrZvvDYgWeKeOAeEnFRMRB" },
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