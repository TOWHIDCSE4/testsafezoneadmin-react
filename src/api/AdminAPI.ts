import ApiSender from './config'

export default class AdminAPI {
    public static getListEmployee(query?: any) {
        const route = `/core/admin/list-employee`
        return ApiSender.get(route, query)
    }

    public static createEmployee(payload: object) {
        const route = `/core/admin/create-employee`
        return ApiSender.post(route, payload)
    }

    public static updateEmployee(payload: object) {
        const route = `/core/admin/update-employee`
        return ApiSender.post(route, payload)
    }

    public static deleteEmployee(payload: object) {
        const route = `/core/admin/delete-employee`
        return ApiSender.post(route, payload)
    }
}
