import React from "react";
import {Card} from "@langfish/go-fish-engine";

export function ScoredSet({ set }: { set: Array<Card> }) {
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