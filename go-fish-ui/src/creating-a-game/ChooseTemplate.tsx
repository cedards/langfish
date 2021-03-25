import React, {useState} from "react/index";
import {Link} from "react-router-dom";
import {GoFishGameplayClientInterface} from "@langfish/go-fish-gameplay-client";
import {ConfirmationModal} from "../utility-screens/ConfirmationModal";
import {Modal} from "../utility-screens/Modal";

export const ChooseTemplate: React.FunctionComponent<{
    templates: Array<{ name: string, template: Array<{ value: string, image?: string }> }>,
    gameplayClient: GoFishGameplayClientInterface,
}> = ({templates, gameplayClient}) => {
    const [showGameCreatedModal, updateShowGameCreatedModal] = useState(false)
    const [gameId, updateGameId] = useState<string | null>(null)

    const onSelect = (template: Array<{ value: string, image?: string }>) => {
        updateShowGameCreatedModal(true)
        updateGameId(null)
        gameplayClient
            .createGame(template)
            .then(updateGameId)
    }

    return <div className="choose-template">
        <h1>Choose the deck template for your game.</h1>
        <Modal show={showGameCreatedModal} close={() => updateShowGameCreatedModal(false)}>
            {
                gameId
                    ? <>
                        <p>Your game has been created!</p>
                        <p>Send your players to <Link to={`/play/${gameId}`}>
                            {`${window.location.protocol}//${window.location.host}${window.location.pathname}play/${gameId}`}
                        </Link></p>
                    </>
                    : <p>Creating game...</p>
            }
        </Modal>
        <ul className="template-list">{
            templates.map(templateInfo => <Template
                key={templateInfo.name}
                templateInfo={templateInfo}
                onSelect={onSelect}
            />)
        }</ul>
    </div>
};

function Template({templateInfo, onSelect}: {
    templateInfo: { name: string, template: Array<{ value: string, image?: string }> },
    onSelect: (template: Array<{ value: string, image?: string }>) => void,
}) {
    const [expanded, updateExpanded] = useState(false)
    const [selectedCards, updateSelectedCards] = useState(templateInfo.template.map(({value}) => value))

    const handleExpand = (e: React.MouseEvent) => {
        e.preventDefault()
        updateExpanded(old => !old)
    }

    const handleToggleCard = (cardValue: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        updateSelectedCards(e.target.checked
            ? Array.from(new Set(selectedCards.concat([cardValue])))
            : selectedCards.filter(v => v !== cardValue)
        )
    }

    const createGame = (e: React.MouseEvent) => {
        e.preventDefault()
        onSelect(templateInfo.template.filter(cardInfo => selectedCards.includes(cardInfo.value)))
        updateExpanded(false)
    }

    return <li className={`template ${expanded ? 'expanded' : ''}`}>
        <button className="choose-template-button" onClick={handleExpand}>{templateInfo.name}</button>
        {expanded
            ? <div>
                <p>Which cards do you want to include?</p>
                <ul className="card-list">
                    {templateInfo.template.map(({value, image}) => <li key={value}>
                        <label>
                            <input
                                type="checkbox"
                                onChange={handleToggleCard(value)}
                                checked={selectedCards.includes(value)}
                            />
                            {image
                                ? <img src={image} alt=""/>
                                : null}
                            <span>{value}</span>
                        </label>
                    </li>)}
                </ul>
                <button className="create-game-button" onClick={createGame}>Create Game</button>
            </div>
            : null}
    </li>
}