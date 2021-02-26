import {DeckTemplateSource} from "./deck-templates-plugin";

export function EnvironmentVariableDeckTemplateSource(variableName: string): DeckTemplateSource {
    return {
        getTemplates(): Promise<Array<{ name: string; template: Array<{ value: string; image?: string }> }>> {
            const serializedTemplates = process.env[variableName]
            if(!serializedTemplates) throw new Error(`No templates found in environment variable ${variableName}`)
            return Promise.resolve(JSON.parse(serializedTemplates))
        }
    }
}