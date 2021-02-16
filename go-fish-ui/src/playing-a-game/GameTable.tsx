import React, {useState} from "react/index";
import {GoFishGameState} from "@langfish/go-fish-engine";
import {Deck} from "./Deck";
import {MyPlayArea} from "./MyPlayArea";
import {OpponentPlayArea} from "./OpponentPlayArea";

export function GameTable(
    {playerId, game, draw, give, score, renamePlayer}: {
        playerId: string,
        game: GoFishGameState,
        draw: () => void,
        give: (cards: Array<number>, recipient: string) => void,
        score: (cards: Array<number>) => void,
        renamePlayer: (name: string) => void
    }
) {
    const [selectedCards, updateSelectedCards] = useState<Array<number>>([])
    const me = game.players[playerId]
    const opponents = Object.keys(game.players).filter(player => player !== playerId);

    return <div className="game-table">
        <Deck draw={draw} deck={game.deck}/>
        <div className="play-areas">
            <MyPlayArea
                playerInfo={me}
                selectedCards={selectedCards}
                updateSelectedCards={updateSelectedCards}
                score={score}
                renamePlayer={renamePlayer}
            />
            {
                opponents.map(playerId =>
                    <OpponentPlayArea
                        key={playerId}
                        playerId={playerId}
                        playerInfo={game.players[playerId]}
                        selectedCards={selectedCards}
                        updateSelectedCards={updateSelectedCards}
                        give={give}
                    />
                )
            }
        </div>
    </div>
}