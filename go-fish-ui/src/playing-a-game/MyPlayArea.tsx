import React from "react";
import {Card} from "@langfish/go-fish-engine";
import {sortCards} from "./sortCards";
import {ScoredSet} from "./ScoredSet";

export function MyPlayArea(
    { playerId, playerInfo, selectedCards, updateSelectedCards, score }: {
        playerId: string,
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
        <h1 id="myName">😀 {playerId}</h1>
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