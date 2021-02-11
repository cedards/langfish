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

    return (
        <div className="App">
            {
                (playerName && gameState)
                    ? <Game
                        playerName={playerName}
                        game={gameState}
                        draw={client.draw}
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

function Deck({ draw, deck }: { draw: () => void, deck: any }) {
    const onClick = (e: React.MouseEvent) => {
        e.preventDefault()
        draw()
    }
    return <button aria-label="deck" className="deck" onClick={onClick}>{deck.length}</button>;
}

function ScoredSet({ set }: { set: Array<Card> }) {
    return <li
        className="scored-set"
        aria-label={`set: ${set[0].value}`}
    >
        {
            set[0].image
                ? <img src={set[0].image} alt={set[0].value} />
                : set[0].value
        }
    </li>
}

function MyHand(
    { hand, selectedCards, updateSelectedCards, readyToScore }: {
        hand: Array<Card>,
        selectedCards: Array<number>,
        updateSelectedCards: (cards: Array<number>) => void,
        readyToScore: boolean
    }
) {

    const selectCard = (cardId: number) => () => {
        if(selectedCards.includes(cardId)) {
            updateSelectedCards(selectedCards.filter(id => id !== cardId))
        } else {
            updateSelectedCards(selectedCards.concat(cardId))
        }
    }

    return <ul className={`my-hand ${readyToScore ? "ready-to-score" : ""}`} aria-label="my hand">
        {sortCards(hand).map(card =>
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
                        ? <img src={card.image} alt={card.value}/>
                        : card.value
                }
            </li>
        )}
    </ul>
}

function MyScoredSets(
    { sets, readyToScore, score}: {
        sets: Array<Array<Card>>,
        readyToScore: boolean,
        score: () => void
    }
) {
    const handleScore = (e: React.MouseEvent) => {
        e.preventDefault()
        score()
    }

    return <ul className="sets" aria-label="my sets">
        {sets.map((set, setNumber) =>
            <ScoredSet
                key={`my-${set[0].value}-set-${setNumber}`}
                set={set}
            />
        )}
        {
            readyToScore
                ? <li className="score-button">
                    <button onClick={handleScore}>+1</button>
                </li>
                : null
        }
    </ul>
}

function MyPlayArea(
    { playerName, playerInfo, selectedCards, updateSelectedCards, score }: {
        playerName: string,
        playerInfo: { hand: Array<Card>, sets: Array<Array<Card>> },
        selectedCards: Array<number>,
        updateSelectedCards: (cardIds: Array<number>) => void,
        score: (cardIds: Array<number>) => void
    }
) {
    const readyToScore: () => boolean = () => {
        if(selectedCards.length !== 3) return false
        const selectedCardValues = playerInfo.hand
            .filter(card => selectedCards.includes(card.id))
            .map(card => card.value)
        return selectedCardValues.every(value => value === selectedCardValues[0])
    }

    const handleScore = () => {
        score(selectedCards)
        updateSelectedCards([])
    }

    return <section aria-labelledby="myName" className="play-area">
        <h1 id="myName">😀 {playerName}</h1>
        <MyHand
            hand={playerInfo.hand}
            readyToScore={readyToScore()}
            selectedCards={selectedCards}
            updateSelectedCards={updateSelectedCards}
        />
        <MyScoredSets
            readyToScore={readyToScore()}
            score={handleScore}
            sets={playerInfo.sets}
        />
    </section>
}

function OpponentPlayArea(
    { playerName, playerInfo, selectedCards, updateSelectedCards, give }: {
        playerName: string,
        playerInfo: { hand: Array<Card>, sets: Array<Array<Card>> },
        selectedCards: Array<number>,
        updateSelectedCards: (cardIds: Array<number>) => void,
        give: (cards: Array<number>, recipient: string) => void,
    }
) {
    const giveTo = (recipient: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        give(selectedCards, recipient)
        updateSelectedCards([])
    }

    return <section aria-labelledby={playerName} className="play-area">
        <h3 id={playerName}>{
            <button onClick={giveTo(playerName)} disabled={selectedCards.length === 0}>{playerName}</button>
        }</h3>
        <ul className="other-player-hand">
            {sortCards(playerInfo.hand).map(card =>
                <li className="hidden-card" aria-label="hidden card" key={card.id}/>
            )}
        </ul>
        <ul className="sets" aria-label={`sets for ${playerName}`}>
            {playerInfo.sets.map((set, setNumber) =>
                <ScoredSet
                    key={`${playerName}-${set[0].value}-set-${setNumber}`}
                    set={set}
                />
            )}
        </ul>
    </section>
}

function Game(
    {playerName, game, draw, give, score}: {
        playerName: string,
        game: GoFishGameState,
        draw: () => void,
        give: (cards: Array<number>, recipient: string) => void,
        score: (cards: Array<number>) => void
    }
) {
    const [selectedCards, updateSelectedCards] = useState<Array<number>>([])
    const me = game.players[playerName]
    const opponents = Object.keys(game.players).filter(player => player !== playerName);

    return <div className="game-table">
        <Deck draw={draw} deck={game.deck}/>
        <div className="play-areas">
            <MyPlayArea
                playerName={playerName}
                playerInfo={me}
                selectedCards={selectedCards}
                updateSelectedCards={updateSelectedCards}
                score={score}
            />
            {
                opponents.map(playerName =>
                    <OpponentPlayArea
                        key={playerName}
                        playerName={playerName}
                        playerInfo={game.players[playerName]}
                        selectedCards={selectedCards}
                        updateSelectedCards={updateSelectedCards}
                        give={give}
                    />
                )
            }
        </div>
    </div>
}

export default App;
