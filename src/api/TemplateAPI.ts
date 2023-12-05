import ApiSender from './config'

export default class RoleAPI {
    public static getTemplates(query?: any) {
        const route = `/core/admin/list-template`
        return ApiSender.get(route, query)
    }

    public static createTemplate(payload: object) {
        const route = `/core/admin/create-template`
        return ApiSender.post(route, payload)
    }

    public static editTemplate(payload: object) {
        const route = `/core/admin/update-template`
        return ApiSender.post(route, payload)
    }

    public static getTemplateCodes() {
        const route = `/core/admin/get-template-codes`
        return ApiSender.get(route)
    }

    public static removeTemplate(payload: object) {
        const route = `/core/admin/remove-template`
        return ApiSender.post(route, payload)
    }
}
