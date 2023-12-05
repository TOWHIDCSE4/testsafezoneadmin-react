import ApiSender from './config'

export default class PermissionAPI {
    public static getPermissions(query?: any) {
        const route = `/core/admin/list-permission`
        return ApiSender.get(route, query)
    }
}
