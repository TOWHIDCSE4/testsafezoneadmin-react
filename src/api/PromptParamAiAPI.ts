import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    type?: number
    status?: any
}
export default class PromptParamAiAPI {
    public static getAllPromptParams(query: QueryParams) {
        return ApiSender.get('/core/admin/ai/get-prompt-params', query)
    }

    public static createPromptParam(payload: object) {
        const route = `/core/admin/ai/create-prompt-param`
        return ApiSender.post(route, payload)
    }

    public static editPromptParam(payload: object) {
        const route = `/core/admin/ai/update-prompt-param`
        return ApiSender.post(route, payload)
    }

    public static removePromptParam(payload: object) {
        const route = `/core/admin/ai/delete-prompt-param`
        return ApiSender.post(route, payload)
    }
}
