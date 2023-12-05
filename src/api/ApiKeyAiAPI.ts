import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    status?: any
}
export default class ApiKeyAiAPI {
    public static getAllApiKey(query: QueryParams) {
        return ApiSender.get('/core/admin/ai/get-api-keys', query)
    }

    public static createApiKey(payload: object) {
        const route = `/core/admin/ai/create-api-key`
        return ApiSender.post(route, payload)
    }

    public static editApiKey(payload: object) {
        const route = `/core/admin/ai/update-api-key`
        return ApiSender.post(route, payload)
    }

    public static removeApiKey(payload: object) {
        const route = `/core/admin/ai/delete-api-key`
        return ApiSender.post(route, payload)
    }
}
