import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    template_id?: any
}
export default class GenerationResultAiAPI {
    public static getAllGenerationResult(query: QueryParams) {
        return ApiSender.get('/core/admin/ai/get-results', query)
    }

    public static createGenerationResult(payload: object) {
        const route = `/core/admin/ai/create-result`
        return ApiSender.post(route, payload)
    }

    public static editGenerationResult(payload: object) {
        const route = `/core/admin/ai/update-result`
        return ApiSender.post(route, payload)
    }

    public static removeGenerationResult(payload: object) {
        const route = `/core/admin/ai/delete-result`
        return ApiSender.post(route, payload)
    }
}
