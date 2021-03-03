import React, {useRef, useState} from "react";
import {Card} from "@langfish/go-fish-engine";
import {sortCards} from "./sortCards";
import {ScoredSet} from "./ScoredSet";

export function MyPlayArea(
    { playerInfo, selectedCards, updateSelectedCards, score, renamePlayer, currentTurn }: {
        playerInfo: { hand: Array<Card>, sets: Array<Array<Card>>, name?: string },
        selectedCards: Array<number>,
        updateSelectedCards: (cardIds: Array<number>) => void,
        score: (cardIds: Array<number>) => void,
        renamePlayer: (name: string) => void,
        currentTurn: boolean
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

    return <section aria-labelledby="myName" className={`play-area ${currentTurn ? 'current-turn' : ''}`}>
        <PlayerName playerName={playerInfo.name} renamePlayer={renamePlayer} handSize={playerInfo.hand.length}/>
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

function PlayerName(
    { playerName, renamePlayer, handSize }: {
        playerName: string | undefined,
        renamePlayer: (name: string) => void,
        handSize: number
    }
) {
    const [ editMode, updateEditMode ] = useState(false)
    const handleRename = (newName: string) => {
        renamePlayer(newName)
        updateEditMode(false)
    }

    return editMode || !playerName
        ? <PlayerNameForm name={playerName} renamePlayer={handleRename} handSize={handSize}/>
        : <PlayerNameHeader name={playerName} editPlayerName={() => updateEditMode(true)} handSize={handSize}/>
}

function PlayerNameForm({ name, renamePlayer, handSize }: {
    name: string | undefined,
    renamePlayer: (name: string) => void,
    handSize: number
}) {
    const [ enteredName, updateEnteredName ] = useState(name || "")

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        updateEnteredName(e.target.value)
    }
    const saveName = (e: React.FormEvent) => {
        e.preventDefault()
        renamePlayer(enteredName)
    }
    return <form id="myName" onSubmit={saveName}>
        {handSize}
        <input
            autoFocus={true}
            className="name"
            name={"playerName"}
            aria-label="your name"
            placeholder="Alex"
            value={enteredName}
            onChange={handleNameChange}
        />
        <button aria-label="save name">✅</button>
    </form>
}

function PlayerNameHeader({ name, editPlayerName, handSize }: {
    name: string | undefined,
    editPlayerName: () => void,
    handSize: number
}) {
    return <h1 id="myName">
        {handSize}
        <span onClick={editPlayerName} className={`name ${name ? '' : 'highlight'}`}>{name || "???"}</span>
        <button className={name ? '' : 'highlight'} aria-label="edit name" onClick={editPlayerName}>✍️</button>
    </h1>
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
                onMouseDown={selectCard(card.id)}
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