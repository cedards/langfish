export interface Card {
    id: number
    value: string
    image?: string
    revealed?: boolean;
}

export interface PlayerState {
    name?: string,
    hand: Array<Card>,
    sets: Array<Array<Card>>,
}

export interface GoFishGameState {
    currentTurn?: string;
    deck: Array<Card>,
    players: { [key: string]: PlayerState }
}

export interface GoFishGame {
    currentState: () => GoFishGameState
    setDeck: (deck: Array<Card>) => void
    addPlayer: () => string
    draw: (playerName: string) => void
    give: (donor: string, recipient: string, cardId: number) => void
    score: (playerName: string, cardIds: number[]) => void
    renamePlayer: (playerId: string, name: string) => void
    endTurn: () => void;
    removePlayer: (playerId: string) => void;
    showOrHideCard: (cardId: number) => void;
}

export function GoFishGame(
    deck?: Array<Card>,
    players?: { [key: string]: PlayerState },
    currentTurn?: string
): GoFishGame {
    let _nextPlayerId = 0
    let _deck: Array<Card> = deck || []
    const _players: { [key: string]: PlayerState } = players || {}
    const sortedPlayerIds = () => Object.keys(_players).sort()
    let _currentTurn: string | undefined = currentTurn || sortedPlayerIds()[0]

    function currentState() {
        return {
            deck: _deck,
            players: _players,
            currentTurn: _currentTurn
        };
    }

    function setDeck(deck) {
        _deck = deck
    }

    function addPlayer(): string {
        while(_players[`player-${_nextPlayerId}`]) {
            _nextPlayerId++
        }
        const playerId = `player-${_nextPlayerId}`

        _players[playerId] = {
            hand: [],
            sets: [],
        }

        if(!_currentTurn) _currentTurn = playerId

        return playerId
    }

    function renamePlayer(playerId: string, name: string): void {
        _players[playerId].name = name
    }

    function draw(playerName: string): void {
        if (_deck.length === 0) return;
        _players[playerName].hand.push(_deck[0])
        _deck = _deck.slice(1)
    }

    function give(fromPlayer: string, toPlayer: string, cardId: number): void {
        const card = _players[fromPlayer].hand.find(card => card.id === cardId)
        _players[fromPlayer].hand = _players[fromPlayer].hand.filter(card => card.id !== cardId)
        _players[toPlayer].hand.push(card)
    }

    function score(playerName: string, cardIds: number[]): void {
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
    }

    function showOrHideCard(cardId: number): void {
        for(let playerId in _players) {
            _players[playerId].hand.forEach(card => {
                if(card.id === cardId) card.revealed = !card.revealed
            })
        }
    }

    function endTurn(): void {
        const playerList = sortedPlayerIds()
        const currentPlayerIndex = playerList.indexOf(_currentTurn)
        const nextPlayerIndex = currentPlayerIndex === playerList.length - 1
            ? 0
            : currentPlayerIndex + 1
        _currentTurn = playerList[nextPlayerIndex]
    }

    function removePlayer(playerId: string): void {
        const playerInfo = _players[playerId]
        if(!playerInfo) return

        if(_currentTurn === playerId) endTurn()

        const recoveredCards = playerInfo.sets
            .reduce((cards, set) => cards.concat(set), [])
            .concat(playerInfo.hand)
            .map(card => ({...card, revealed: false}))
        _deck = _deck.concat(recoveredCards)

        delete _players[playerId]
    }

    return {
        currentState,
        setDeck,
        addPlayer,
        renamePlayer,
        draw,
        give,
        score,
        showOrHideCard,
        endTurn,
        removePlayer
    }
}
