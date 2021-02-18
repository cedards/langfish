import React from "react/index";

export function Deck({draw, deck, highlight}: {
    draw: () => void,
    deck: any,
    highlight: boolean
}) {
    const onClick = (e: React.MouseEvent) => {
        e.preventDefault()
        draw()
    }
    return <button aria-label="deck" className={`deck ${highlight ? 'highlight' : ''}`} onClick={onClick}>{deck.length}</button>;
}