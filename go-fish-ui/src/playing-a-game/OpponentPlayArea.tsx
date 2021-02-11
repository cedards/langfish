import React from "react";
import {Card} from "@langfish/go-fish-engine";
import {sortCards} from "./sortCards";
import {ScoredSet} from "./ScoredSet";

export function OpponentPlayArea(
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