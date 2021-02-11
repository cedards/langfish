import React, {useEffect, useState} from 'react';
import {GoFishGameplayClientInterface} from "@langfish/go-fish-websocket-client"
import './App.css';
import {GoFishGameState, Card} from "@langfish/go-fish-engine";

interface AppProps {
    client: GoFishGameplayClientInterface
}

function App({ client }: AppProps) {
    const [playerName, updatePlayerName] = useState<string | null>(null)
    const [gameState, updateGameState] = useState<GoFishGameState | null>(null)

    useEffect(() => {
        client.connect().then(() => {
            client.joinGame("game1")
            client.onSetPlayerName(updatePlayerName)
            client.onUpdateGameState(updateGameState)
        })
        return () => { client.disconnect() }
    }, [])

    const draw = (e: React.MouseEvent) => {
        e.preventDefault()
        client.draw()
    }

    return (
        <div className="App">
            {
                (playerName && gameState)
                    ? <Game
                        playerName={playerName}
                        game={gameState}
                        draw={draw}
                        give={client.give}
                        score={client.score}
                    />
                    : <LoadingScreen/>
            }
        </div>
    );
}

function LoadingScreen() {
    return <h1>Connecting...</h1>
}

function sortCards(cards: Array<Card>): Array<Card> {
    return cards.concat([]).sort((a,b) => {
        if(a.value === b.value) return 0
        return a.value < b.value
            ? -1
            : 1
    })
}

function Game(
    {playerName, game, draw, give, score}: {
        playerName: string,
        game: GoFishGameState,
        draw: React.MouseEventHandler,
        give: (cards: Array<number>, recipient: string) => void,
        score: (cards: Array<number>) => void
    }
) {
    const [selectedCards, updateSelectedCards] = useState<Array<number>>([])

    const selectCard = (cardId: number) => () => {
        if(selectedCards.includes(cardId)) {
            updateSelectedCards(selectedCards.filter(id => id !== cardId))
        } else {
            updateSelectedCards(selectedCards.concat(cardId))
        }
    }

    const giveTo = (recipient: string) => () => {
        give(selectedCards, recipient)
        updateSelectedCards([])
    }

    const handleScore = (e: React.MouseEvent) => {
        e.preventDefault()
        score(selectedCards)
        updateSelectedCards([])
    }

    const readyToScore: () => boolean = () => {
        if(selectedCards.length !== 3) return false
        const selectedCardValues = game.players[playerName].hand
            .filter(card => selectedCards.includes(card.id))
            .map(card => card.value)
        return selectedCardValues.every(value => value === selectedCardValues[0])
    }

    return <div className="game-table">
        <button aria-label="deck" className="deck" onClick={draw}>{game.deck.length}</button>
        <div className="play-areas">
            <section aria-labelledby="myName" className="play-area">
                <h1 id="myName">😀 {playerName}</h1>
                <ul className={`my-hand ${readyToScore() ? "ready-to-score" : ""}`} aria-label="my hand">
                    { sortCards(game.players[playerName].hand).map(card =>
                        <li
                            className="card"
                            key={card.id}
                            aria-label={`hidden card: ${card.value}`}
                            role="checkbox"
                            aria-selected={selectedCards.includes(card.id)}
                            onClick={selectCard(card.id)}
                        >
                            {
                                card.image
                                    ? <img src={card.image} alt={card.value} />
                                    : card.value
                            }
                        </li>
                    )}
                </ul>
                <ul className="sets" aria-label="my sets">
                    { game.players[playerName].sets.map((set, setNumber) =>
                        <li
                            className="scored-set"
                            key={`${playerName}-${set[0].value}-set-${setNumber}`}
                            aria-label={`set: ${set[0].value}`}
                        >
                            {
                                set[0].image
                                    ? <img src={set[0].image} alt={set[0].value} />
                                    : set[0].value
                            }
                        </li>
                    )}
                    {
                        readyToScore()
                            ? <li className="score-button"><button onClick={handleScore}>+1</button></li>
                            : null
                    }
                </ul>
            </section>
            {
                Object.keys(game.players).filter(player => player !== playerName).map(player =>
                    <section key={player} aria-labelledby={player} className="play-area">
                        <h3 id={player}>{
                            <button onClick={giveTo(player)} disabled={selectedCards.length === 0}>{player}</button>
                        }</h3>
                        <ul className="other-player-hand">
                            {sortCards(game.players[player].hand).map(card =>
                                <li className="hidden-card" aria-label="hidden card" key={card.id} />
                            )}
                        </ul>
                        <ul className="sets" aria-label={`sets for ${player}`}>
                            { game.players[player].sets.map((set, setNumber) =>
                                <li
                                    className="scored-set"
                                    key={`${player}-${set[0].value}-set-${setNumber}`}
                                    aria-label={`set: ${set[0].value}`}
                                >
                                    {
                                        set[0].image
                                            ? <img src={set[0].image} alt={set[0].value} />
                                            : set[0].value
                                    }
                                </li>
                            )}
                        </ul>
                    </section>
                )
            }
        </div>
    </div>
}

export default App;
