import React from "react";
import {Card} from "@langfish/go-fish-engine";

export const ScoredSet: React.FunctionComponent<{
    set: Array<Card>
}> = ({ set }) => <li
    className="scored-set"
    aria-label={`set: ${set[0].value}`}
>
    {
        set[0].image
            ? <img src={set[0].image} alt={set[0].value}/>
            : set[0].value
    }
</li>;