import React, {useEffect, useState} from "react/index";
import { GoFishGameplayClientInterface } from "@langfish/go-fish-gameplay-client";
import {TemplatesClientInterface} from "./TemplatesClientInterface";
import {ChooseTemplate} from "./ChooseTemplate";
import {LoadingScreen} from "../utility-screens/LoadingScreen";

export const CreateGame: React.FunctionComponent<{
    templatesClient: TemplatesClientInterface,
    gameplayClient: GoFishGameplayClientInterface
}> = ({templatesClient, gameplayClient}) => {
    const [fetchingTemplatesFailed, updateFetchingTemplatesFailed] = useState(false)
    const [templates, updateTemplates] = useState<Array<{ name: string, template: Array<{ value: string, image?: string }> }> | null>(null)

    useEffect(() => {
        templatesClient.getTemplates()
            .then(templates => templates.concat([]).sort((a,b) => {
                if(a.name === b.name) return 0
                return a.name < b.name
                    ? -1
                    : 1
            }))
            .then(updateTemplates)
            .catch(() => { updateFetchingTemplatesFailed(true) })
    }, [])

    if(fetchingTemplatesFailed) return <div><LoadingScreen>Something went wrong while trying to fetch templates. You should ask the web master to look at the application logs.</LoadingScreen></div>

    return <div>
        {
            templates
                ? <ChooseTemplate templates={templates || []} gameplayClient={gameplayClient}/>
                : <LoadingScreen>Fetching templates...</LoadingScreen>
        }
    </div>
};