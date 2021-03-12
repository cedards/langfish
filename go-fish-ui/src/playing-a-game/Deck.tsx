import React from "react/index";
import {Card} from "@langfish/go-fish-engine";

export const Deck: React.FunctionComponent<{
    draw: () => void,
    deck: Card[],
    highlight: boolean
}> = ({draw, deck, highlight}) => {
    const onClick = (e: React.MouseEvent) => {
        e.preventDefault()
        draw()
    }
    return <button aria-label="deck" className={`deck ${highlight ? 'highlight' : ''}`} onClick={onClick}>{deck.length}</button>;
};