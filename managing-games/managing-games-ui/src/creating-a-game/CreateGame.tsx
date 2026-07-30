import React, {useEffect, useState} from "react";
import {LoadingScreen} from "@langfish/common-ui-components";
import { GoFishManagingGamesClientInterface } from "@langfish/managing-games-api-client";
import {TemplatesClientInterface} from "./TemplatesClientInterface";
import {ChooseTemplate} from "./ChooseTemplate";

export const CreateGame: React.FunctionComponent<{
    templatesClient: TemplatesClientInterface,
    managingGamesClient: GoFishManagingGamesClientInterface
}> = ({templatesClient, managingGamesClient}) => {
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
    }, [templatesClient])

    if(fetchingTemplatesFailed) return <div><LoadingScreen>Something went wrong while trying to fetch templates. You should ask the web master to look at the application logs.</LoadingScreen></div>

    return <div>
        {
            templates
                ? <ChooseTemplate templates={templates || []} managingGamesClient={managingGamesClient}/>
                : <LoadingScreen>Fetching templates...</LoadingScreen>
        }
    </div>
};