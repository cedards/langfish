export interface Card {
    id: number
    value: string
}

export interface PlayerState {
    hand: Array<Card>,
    sets: Array<Array<Card>>,
}

export interface GoFishGame {
    currentState: () => { deck: Array<Card>, players: { [key: string]: PlayerState } }
    setDeck: (deck: Array<Card>) => void
    addPlayer: (playerName: string) => void

    draw(playerName: string): void

    give(alex: string, bailey: string, number: number): void
}

export function GoFishGame(): GoFishGame {
    let _deck: Array<Card> = []
    const _players: { [key: string]: PlayerState } = {}

    return {
        currentState() {
            return {
                deck: _deck,
                players: _players
            };
        },

        setDeck(deck) {
            _deck = deck
        },

        addPlayer(playerName: string) {
            _players[playerName] = {
                hand: [],
                sets: [],
            }
        },

        draw(playerName: string): void {
            if (_deck.length === 0) return;
            _players[playerName].hand.push(_deck[0])
            _deck = _deck.slice(1)
        },

        give(fromPlayer: string, toPlayer: string, cardId: number): void {
            const card = _players[fromPlayer].hand.find(card => card.id === cardId)
            _players[fromPlayer].hand = _players[fromPlayer].hand.filter(card => card.id !== cardId)
            _players[toPlayer].hand.push(card)
        },
    }
}