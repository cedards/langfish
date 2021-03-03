import React, {useEffect, useState} from "react/index";
import {useParams} from "react-router-dom";
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client";
import { GoFishGameState } from "@langfish/go-fish-engine";
import {GameTable} from "./GameTable";
import {LoadingScreen} from "../LoadingScreen";

export function PlayGame({client}: { client: GoFishGameplayClientInterface }) {
    const [playerId, updatePlayerId] = useState<string | null>(null)
    const [gameState, updateGameState] = useState<GoFishGameState | null>(null)
    let {gameId} = useParams<{ gameId: string }>();

    useEffect(() => {
        client.connect().then(() => {
            client.joinGame(gameId)
            client.onSetPlayerId(updatePlayerId)
            client.onUpdateGameState(updateGameState)
        })
    }, [])

    return (playerId && gameState && gameState.players[playerId])
        ? <GameTable
            playerId={playerId}
            game={gameState}
            draw={client.draw}
            give={client.give}
            score={client.score}
            renamePlayer={client.renamePlayer}
            endTurn={client.endTurn}
        />
        : <LoadingScreen/>
}