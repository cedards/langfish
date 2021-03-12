import React, {useEffect, useState} from "react/index";
import { GoFishGameplayClientInterface } from "@langfish/go-fish-gameplay-client";
import {TemplatesClientInterface} from "./TemplatesClientInterface";
import {ChooseTemplate} from "./ChooseTemplate";
import {LoadingScreen} from "../LoadingScreen";

export const CreateGame: React.FunctionComponent<{
    templatesClient: TemplatesClientInterface,
    gameplayClient: GoFishGameplayClientInterface
}> = ({templatesClient, gameplayClient}) => {
    const [templates, updateTemplates] = useState<Array<{ name: string, template: Array<{ value: string, image?: string }> }> | null>(null)

    useEffect(() => {
        templatesClient.getTemplates().then(updateTemplates)
    }, [])

    return <div>
        {
            templates
                ? <ChooseTemplate templates={templates || []} gameplayClient={gameplayClient}/>
                : <LoadingScreen>Fetching templates...</LoadingScreen>
        }
    </div>
};