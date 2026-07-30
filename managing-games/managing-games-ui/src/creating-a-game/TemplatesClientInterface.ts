export interface TemplatesClientInterface {
    getTemplates(): Promise<Array<{ name: string, template: Array<{ value: string, image?: string }> }>>;
}