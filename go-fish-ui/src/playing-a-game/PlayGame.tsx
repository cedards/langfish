import React, {useEffect, useState} from "react";
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client";
import { GoFishGameState } from "@langfish/go-fish-engine";
import {GameTable} from "./GameTable";
import {LoadingScreen} from "@langfish/common-ui-components";

export const PlayGame: React.FunctionComponent<{
    client: GoFishGameplayClientInterface,
    gameId: string,
}> = ({client, gameId}) => {
    const [playerId, updatePlayerId] = useState<string | null>(null)
    const [gameState, updateGameState] = useState<GoFishGameState | null>(null)

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
            hideOrShowCard={client.hideOrShowCard}
            renamePlayer={client.renamePlayer}
            endTurn={client.endTurn}
            removePlayer={client.removePlayer}
        />
        : <LoadingScreen/>
};