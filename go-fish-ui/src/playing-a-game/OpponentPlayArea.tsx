import React from "react";
import {Card} from "@langfish/go-fish-engine";
import {sortCards} from "./sortCards";
import {ScoredSet} from "./ScoredSet";

export function OpponentPlayArea(
    { playerId, playerInfo, selectedCards, updateSelectedCards, give }: {
        playerId: string,
        playerInfo: { hand: Array<Card>, sets: Array<Array<Card>>, name?: string },
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

    return <section aria-labelledby={playerId} className="play-area opponent-play-area">
        <h3 id={playerId}>{
            <button onClick={giveTo(playerId)} disabled={selectedCards.length === 0}>{playerInfo.name || '???'}</button>
        }</h3>
        <ul className="other-player-hand">
            {sortCards(playerInfo.hand).map(card =>
                <li className="hidden-card" aria-label="hidden card" key={card.id}/>
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