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
                    ? <Game playerName={playerName} game={gameState} draw={draw} give={client.give}/>
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
    {playerName, game, draw, give}: {
        playerName: string,
        game: GoFishGameState,
        draw: React.MouseEventHandler,
        give: (cards: Array<number>, recipient: string) => void
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

    return <div>
        <section aria-labelledby="myName">
            <h1 id="myName">😀 {playerName}</h1>
            <ul className="my-hand" aria-label="my hand">
                { sortCards(game.players[playerName].hand).map(card =>
                    <li
                        className="card"
                        key={card.id}
                        aria-label={`hidden card: ${card.value}`}
                        role="checkbox"
                        aria-selected={selectedCards.includes(card.id)}
                        onClick={selectCard(card.id)}
                    >
                        {card.value}
                    </li>
                )}
            </ul>
        </section>
        <p>There are {game.deck.length} cards left in the deck. <button onClick={draw}>Draw a card</button></p>
        {
            Object.keys(game.players).filter(player => player !== playerName).map(player =>
                <section key={player} aria-labelledby={player}>
                    <h3 id={player}>{
                        selectedCards.length > 0
                            ? <button onClick={giveTo(player)}>{player}</button>
                            : player
                    }</h3>
                    <ul className="other-player-hand">
                        {sortCards(game.players[player].hand).map(card =>
                            <li className="hidden-card" aria-label="hidden card" key={card.id} />
                        )}
                    </ul>
                </section>
            )
        }
    </div>
}

export default App;
