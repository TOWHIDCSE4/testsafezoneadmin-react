import ApiSender from './config'

export default class RoleAPI {
    public static getListRole(query?: any) {
        const route = `/core/admin/list-role`
        return ApiSender.get(route, query)
    }

    public static createRoleByAdmin(payload: object) {
        const route = `/core/admin/create-role`
        return ApiSender.post(route, payload)
    }

    public static updateRoleByAdmin(payload: object) {
        const route = `/core/admin/update-role`
        return ApiSender.post(route, payload)
    }

    public static getNamesRoles() {
        const route = `/core/admin/get-names-roles`
        return ApiSender.get(route)
    }

    public static deleteRole(payload: object) {
        const route = `/core/admin/delete-role`
        return ApiSender.post(route, payload)
    }
}
