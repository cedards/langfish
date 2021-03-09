import React, {useState} from "react/index";
import {GoFishGameState} from "@langfish/go-fish-engine";
import {Deck} from "./Deck";
import {MyPlayArea} from "./MyPlayArea";
import {OpponentPlayArea} from "./OpponentPlayArea";

export function GameTable(
    {playerId, game, draw, give, score, hideOrShowCard, renamePlayer, endTurn, removePlayer}: {
        playerId: string,
        game: GoFishGameState,
        draw: () => void,
        give: (cards: Array<number>, recipient: string) => void,
        score: (cards: Array<number>) => void,
        hideOrShowCard: (id: number) => void,
        renamePlayer: (name: string) => void,
        endTurn: () => void,
        removePlayer: (playerId: string) => void,
    }
) {
    const [selectedCards, updateSelectedCards] = useState<Array<number>>([])
    const me = game.players[playerId]
    const opponents = Object.keys(game.players).filter(player => player !== playerId);
    const encourageDraw = !!me.name && me.hand.length === 0 && game.deck.length > 0;

    return <div className="game-table">
        <div className="sidepanel">
            <ul className="player-list">
                {Object.keys(game.players).map(id => id === game.currentTurn
                    ? <li key={`player-list-${id}`} className="current-turn" onClick={endTurn}>{game.players[id].name || '???'}</li>
                    : <li key={`player-list-${id}`}>{game.players[id].name || '???'}</li>
                )}
            </ul>
            <Deck draw={draw} deck={game.deck} highlight={encourageDraw}/>
        </div>
        <div className="play-areas" aria-label="play areas">
            {
                opponents.map(playerId =>
                    <OpponentPlayArea
                        key={playerId}
                        currentTurn={playerId === game.currentTurn}
                        playerId={playerId}
                        playerInfo={game.players[playerId]}
                        selectedCards={selectedCards}
                        updateSelectedCards={updateSelectedCards}
                        give={give}
                        kickPlayer={() => removePlayer(playerId)}
                    />
                )
            }
            <MyPlayArea
                playerInfo={me}
                currentTurn={playerId === game.currentTurn}
                selectedCards={selectedCards}
                updateSelectedCards={updateSelectedCards}
                score={score}
                hideOrShowCard={hideOrShowCard}
                renamePlayer={renamePlayer}
                leaveGame={() => removePlayer(playerId)}
            />
        </div>
    </div>
}