import React, {useState} from "react";
import {Card} from "@langfish/go-fish-engine";
import {sortCards} from "./sortCards";
import {ScoredSet} from "./ScoredSet";
import {ConfirmationModal} from "../ConfirmationModal";

export function OpponentPlayArea(
    { playerId, playerInfo, selectedCards, updateSelectedCards, give, currentTurn, kickPlayer }: {
        playerId: string,
        playerInfo: { hand: Array<Card>, sets: Array<Array<Card>>, name?: string },
        selectedCards: Array<number>,
        updateSelectedCards: (cardIds: Array<number>) => void,
        give: (cards: Array<number>, recipient: string) => void,
        currentTurn: boolean,
        kickPlayer: () => void,
    }
) {
    const [showKickModal, updateShowKickModal] = useState(false)

    const giveTo = (recipient: string) => (e: React.MouseEvent) => {
        e.preventDefault()
        give(selectedCards, recipient)
        updateSelectedCards([])
    }

    const cardsToShow = playerInfo.hand.slice(0, 7)

    return <section aria-labelledby={playerId} className={`play-area opponent-play-area ${currentTurn ? 'current-turn' : ''}`}>
        <h3>
            <button id={playerId} className="opponent-name-button" onClick={giveTo(playerId)} disabled={selectedCards.length === 0}>{playerInfo.name || '???'}</button>
            <button className="player-name-form-button leave-button" aria-label="leave game" onClick={() => updateShowKickModal(true)}>🥾️</button>
            <ConfirmationModal show={showKickModal} confirm={kickPlayer} cancel={() => updateShowKickModal(false)}>
                🥾 {playerInfo.name || '???'} 🚪️ ?
            </ConfirmationModal>
        </h3>
        <ul className="other-player-hand">
            {sortCards(cardsToShow).map((card, index) =>
                <li className="hidden-card" aria-label="hidden card" key={card.id}>
                    {index === cardsToShow.length-1 ? playerInfo.hand.length : ''}
                </li>
            )}
        </ul>
        <ul className="sets" aria-label={`sets for ${playerId}`}>
            {playerInfo.sets.map((set, setNumber) =>
                <ScoredSet
                    key={`${playerId}-${set[0].value}-set-${setNumber}`}
                    set={set}
                />
            )}
        </ul>
    </section>
}