import {Card} from "@langfish/go-fish-engine";

export function sortCards(cards: Array<Card>): Array<Card> {
    return cards.concat([]).sort((a,b) => {
        if(a.value === b.value) return 0
        return a.value < b.value
            ? -1
            : 1
    })
}