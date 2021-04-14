import React, {useState} from "react";
import {Card} from "@langfish/go-fish-engine";

export const ScoredSet: React.FunctionComponent<{
    set: Array<Card>
}> = ({ set }) => {
    return <li
        className="scored-set magnify"
        aria-label={`set: ${set[0].value}`}
    >
        {
            set[0].image
                ? <img src={set[0].image} alt={set[0].value}/>
                : set[0].value
        }
    </li>;
}