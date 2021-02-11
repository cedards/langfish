import React from "react/index";

export function Deck({draw, deck}: { draw: () => void, deck: any }) {
    const onClick = (e: React.MouseEvent) => {
        e.preventDefault()
        draw()
    }
    return <button aria-label="deck" className="deck" onClick={onClick}>{deck.length}</button>;
}