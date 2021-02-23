import React, {useEffect, useState} from 'react';
import {GoFishGameState} from "@langfish/go-fish-engine";
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client"
import './App.css';
import {LoadingScreen} from "./playing-a-game/LoadingScreen";
import {GameTable} from "./playing-a-game/GameTable";

interface AppProps {
    client: GoFishGameplayClientInterface
}

function App({ client }: AppProps) {
    const [playerId, updatePlayerId] = useState<string | null>(null)
    const [gameState, updateGameState] = useState<GoFishGameState | null>(null)

    useEffect(() => {
        client.connect().then(() => {
            client.joinGame("game1")
            client.onSetPlayerId(updatePlayerId)
            client.onUpdateGameState(updateGameState)
        })
        return () => { client.disconnect() }
    }, [])

    return (
        <div className="App">
            {
                (playerId && gameState)
                    ? <GameTable
                        playerId={playerId}
                        game={gameState}
                        draw={client.draw}
                        give={client.give}
                        score={client.score}
                        renamePlayer={client.renamePlayer}
                    />
                    : <LoadingScreen/>
            }
        </div>
    );
}

export default App;
