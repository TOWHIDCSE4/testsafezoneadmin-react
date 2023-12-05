export interface ITemplate {
    id: string
    code: string
    title: string
    content: string
    type: EnumTemplateType
    createdAt?: Date
    updatedAt?: Date
}

export enum EnumTemplateType {
    EMAIL = 1
}
