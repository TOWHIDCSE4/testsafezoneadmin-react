import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    status?: any
    category?: any
}
export default class PromptTemplateAiAPI {
    public static getAllPromptTemplate(query: QueryParams) {
        return ApiSender.get('/core/admin/ai/get-prompts', query)
    }

    public static createPromptTemplate(payload: object) {
        const route = `/core/admin/ai/create-prompt`
        return ApiSender.post(route, payload)
    }

    public static editPromptTemplate(payload: object) {
        const route = `/core/admin/ai/update-prompt`
        return ApiSender.post(route, payload)
    }

    public static removePromptTemplate(payload: object) {
        const route = `/core/admin/ai/delete-prompt`
        return ApiSender.post(route, payload)
    }
}
