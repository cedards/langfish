import React, {useEffect, useState} from 'react';
import {GoFishGameState} from "@langfish/go-fish-engine";
import {GoFishGameplayClientInterface} from "@langfish/go-fish-websocket-client"
import './App.css';
import {LoadingScreen} from "./playing-a-game/LoadingScreen";
import {GameTable} from "./playing-a-game/GameTable";

interface AppProps {
    client: GoFishGameplayClientInterface
}

function App({ client }: AppProps) {
    const [playerName, updatePlayerName] = useState<string | null>(null)
    const [gameState, updateGameState] = useState<GoFishGameState | null>(null)

    useEffect(() => {
        client.connect().then(() => {
            client.joinGame("game1")
            client.onSetPlayerName(updatePlayerName)
            client.onUpdateGameState(updateGameState)
        })
        return () => { client.disconnect() }
    }, [])

    return (
        <div className="App">
            {
                (playerName && gameState)
                    ? <GameTable
                        playerName={playerName}
                        game={gameState}
                        draw={client.draw}
                        give={client.give}
                        score={client.score}
                    />
                    : <LoadingScreen/>
            }
        </div>
    );
}

export default App;
