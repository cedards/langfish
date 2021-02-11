export interface Card {
    id: number
    value: string
}

export interface PlayerState {
    hand: Array<Card>,
    sets: Array<Array<Card>>,
}

export interface GoFishGameState {
    deck: Array<Card>,
    players: { [key: string]: PlayerState }
}

export interface GoFishGame {
    currentState: () => GoFishGameState
    setDeck: (deck: Array<Card>) => void
    addPlayer: (playerName: string) => void
    draw: (playerName: string) => void
    give: (donor: string, recipient: string, cardId: number) => void
    score: (playerName: string, cardIds: number[]) => void;
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

        score(playerName: string, cardIds: number[]): void {
            if(cardIds.length !== 3) return
            const cards = cardIds.map(cardId =>
                _players[playerName].hand.find(card => card.id === cardId)
            )
            if(cards.some(card => !card)) return
            if(!cards.every(card => card.value === cards[0].value)) return

            _players[playerName].sets.push(cards)
            _players[playerName].hand = _players[playerName].hand.filter(card =>
                !cardIds.includes(card.id)
            )
        },
    }
}
