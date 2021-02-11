import React, {useState} from "react/index";
import {GoFishGameState} from "@langfish/go-fish-engine";
import {Deck} from "./Deck";
import {MyPlayArea} from "./MyPlayArea";
import {OpponentPlayArea} from "./OpponentPlayArea";

export function GameTable(
    {playerName, game, draw, give, score}: {
        playerName: string,
        game: GoFishGameState,
        draw: () => void,
        give: (cards: Array<number>, recipient: string) => void,
        score: (cards: Array<number>) => void
    }
) {
    const [selectedCards, updateSelectedCards] = useState<Array<number>>([])
    const me = game.players[playerName]
    const opponents = Object.keys(game.players).filter(player => player !== playerName);

    return <div className="game-table">
        <Deck draw={draw} deck={game.deck}/>
        <div className="play-areas">
            <MyPlayArea
                playerName={playerName}
                playerInfo={me}
                selectedCards={selectedCards}
                updateSelectedCards={updateSelectedCards}
                score={score}
            />
            {
                opponents.map(playerName =>
                    <OpponentPlayArea
                        key={playerName}
                        playerName={playerName}
                        playerInfo={game.players[playerName]}
                        selectedCards={selectedCards}
                        updateSelectedCards={updateSelectedCards}
                        give={give}
                    />
                )
            }
        </div>
    </div>
}