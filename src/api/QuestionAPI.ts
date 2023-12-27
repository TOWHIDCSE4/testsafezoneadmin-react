import ApiSender from './config'

type QueryParams = {
    page_size?: number
    page_number?: number
    search?: string
    idSearch?: any
}
export default class QuestionAPI {
    public static getQuestions(query?: QueryParams) {
        return ApiSender.get('/core/admin/list-all-question', query)
    }

    public static getLibraryQuestions(query?: QueryParams) {
        return ApiSender.get('/core/admin/list-all-library-question', query)
    }

    public static createQuestion(payload: object) {
        const route = `/core/admin/create-question`
        return ApiSender.post(route, payload)
    }

    public static updateQuestion(payload: object) {
        const route = `/core/admin/update-question`
        return ApiSender.post(route, payload)
    }

    public static deleteQuestion(payload: object) {
        const route = `/core/admin/delete-question`
        return ApiSender.post(route, payload)
    }

    public static deleteLibraryQuestion(payload: object) {
        const route = `/core/admin/delete-library-question`
        return ApiSender.post(route, payload)
    }

    public static generateQuestion(payload: object) {
        const route = `/core/admin/generate-question`
        return ApiSender.post(route, payload)
    }

    public static createLibraryQuestion(payload: object) {
        const route = `/core/admin/create-library-question`
        return ApiSender.post(route, payload)
    }
}
