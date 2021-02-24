import React, {useState} from "react/index";
import {Link} from "react-router-dom";
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client";

export function ChooseTemplate({templates, gameplayClient}: {
    templates: Array<{ name: string, template: Array<{ value: string, image?: string }> }>,
    gameplayClient: GoFishGameplayClientInterface,
}) {
    const [gameId, updateGameId] = useState<string | null>(null)

    const handleClick = (template: Array<{ value: string, image?: string }>) => (e: React.MouseEvent) => {
        e.preventDefault()
        gameplayClient
            .createGame(template)
            .then(updateGameId)
    }

    return <div className="choose-template">
        <h1>Choose the deck template for your game.</h1>
        <ul className="template-list">{
            templates.map(templateInfo => <li key={templateInfo.name}>
                <button onClick={handleClick(templateInfo.template)}>{templateInfo.name}</button>
            </li>)
        }</ul>
        {
            gameId
                ? <p>Your game has been created! Send your players to <Link to={`/game/${gameId}`}>
                    {`${window.location.protocol}//${window.location.host}${window.location.pathname}game/${gameId}`}
                </Link></p>
                : ''
        }
    </div>
}