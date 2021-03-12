import React, {useState} from "react";
import {useHistory} from "react-router-dom";
import {Card} from "@langfish/go-fish-engine";
import {sortCards} from "./sortCards";
import {ScoredSet} from "./ScoredSet";
import {ConfirmationModal} from "../ConfirmationModal";

export const MyPlayArea: React.FunctionComponent<{
    playerInfo: { hand: Array<Card>, sets: Array<Array<Card>>, name?: string },
    selectedCards: Array<number>,
    updateSelectedCards: (cardIds: Array<number>) => void,
    score: (cardIds: Array<number>) => void,
    renamePlayer: (name: string) => void,
    hideOrShowCard: (id: number) => void
    leaveGame: () => void,
    currentTurn: boolean,
}> = (
    { playerInfo, selectedCards, updateSelectedCards, score, renamePlayer, hideOrShowCard, leaveGame, currentTurn }
) => {
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
        <PlayerName
            playerName={playerInfo.name}
            renamePlayer={renamePlayer}
            handSize={playerInfo.hand.length}
            leaveGame={leaveGame}
        />
        <MyHand
            hand={playerInfo.hand}
            readyToScore={readyToScore()}
            selectedCards={selectedCards}
            updateSelectedCards={updateSelectedCards}
            hideOrShowCard={hideOrShowCard}
        />
        <MyScoredSets
            readyToScore={readyToScore()}
            score={handleScore}
            sets={playerInfo.sets}
        />
    </section>
};

function PlayerName(
    { playerName, renamePlayer, handSize, leaveGame }: {
        playerName: string | undefined,
        renamePlayer: (name: string) => void,
        handSize: number,
        leaveGame: () => void
    }
) {
    const [ editMode, updateEditMode ] = useState(false)
    const handleRename = (newName: string) => {
        renamePlayer(newName)
        updateEditMode(false)
    }

    return editMode || !playerName
        ? <PlayerNameForm name={playerName} renamePlayer={handleRename} handSize={handSize}/>
        : <PlayerNameHeader name={playerName} editPlayerName={() => updateEditMode(true)} handSize={handSize} leaveGame={leaveGame}/>
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
        <button className="player-name-form-button" aria-label="save name">✅</button>
    </form>
}

function PlayerNameHeader({ name, editPlayerName, handSize, leaveGame }: {
    name: string | undefined,
    editPlayerName: () => void,
    handSize: number,
    leaveGame: () => void
}) {
    const history = useHistory()
    const [ showModal, updateShowModal ] = useState(false)

    const handleLeaveGame = () => {
        leaveGame()
        history.push("/")
    }

    return <h1 id="myName">
        {handSize}
        <span onClick={editPlayerName} className={`name ${name ? '' : 'highlight'}`}>{name || "???"}</span>
        <button className={`player-name-form-button ${name ? '' : 'highlight'}`} aria-label="edit name" onClick={editPlayerName}>✍️</button>
        <button className="player-name-form-button leave-button" aria-label="leave game" onClick={() => updateShowModal(true)}>🚪️</button>
        <ConfirmationModal show={showModal} confirm={handleLeaveGame} cancel={() => updateShowModal(false)}>
            {'~~>'} 🚪️ ?
        </ConfirmationModal>
    </h1>
}

function MyHand(
    { hand, selectedCards, updateSelectedCards, readyToScore, hideOrShowCard }: {
        hand: Array<Card>,
        selectedCards: Array<number>,
        updateSelectedCards: (cards: Array<number>) => void,
        readyToScore: boolean,
        hideOrShowCard: (id: number) => void
    }
) {

    const selectCard = (cardId: number) => () => {
        if(selectedCards.includes(cardId)) {
            updateSelectedCards(selectedCards.filter(id => id !== cardId))
        } else {
            updateSelectedCards(selectedCards.concat(cardId))
        }
    }

    const handleHideOrShow = (cardId: number) => (e: React.MouseEvent) => {
        e.preventDefault()
        hideOrShowCard(cardId)
    }

    return <ul className={`my-hand ${readyToScore ? "ready-to-score" : ""}`} aria-label="my hand">
        {sortCards(hand).map(card =>
            <li
                className={`card ${card.revealed ? 'revealed' : ''}`}
                key={card.id}
                aria-label={`${card.revealed ? 'revealed' : 'hidden'} card: ${card.value}`}
                role="checkbox"
                aria-selected={selectedCards.includes(card.id)}
                onMouseDown={selectCard(card.id)}
            >
                {
                    card.image
                        ? <img src={card.image} alt={card.value}/>
                        : card.value
                }
                <button
                    className="hide-or-show-card"
                    aria-label={`${card.revealed ? 'hide' : 'reveal'} this ${card.value} card`}
                    onMouseDown={e => e.stopPropagation()} // don't trigger card selection
                    onClick={handleHideOrShow(card.id)}
                />
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