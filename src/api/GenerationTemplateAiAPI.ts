import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    status?: any
}
export default class GenerationTemplateAiAPI {
    public static getAllGenerationTemplate(query: QueryParams) {
        return ApiSender.get('/core/admin/ai/get-generation-templates', query)
    }

    public static generateTemplate(payload: object) {
        const route = `/core/admin/ai/generate-generation-template`
        return ApiSender.post(route, payload)
    }

    public static createGenerationTemplate(payload: object) {
        const route = `/core/admin/ai/create-generation-template`
        return ApiSender.post(route, payload)
    }

    public static editGenerationTemplate(payload: object) {
        const route = `/core/admin/ai/update-generation-template`
        return ApiSender.post(route, payload)
    }

    public static removeGenerationTemplate(payload: object) {
        const route = `/core/admin/ai/delete-generation-template`
        return ApiSender.post(route, payload)
    }
}
