import ApiSender from './config'

export default class UserAPI {
    public static getListUser(query: any) {
        const route = `/core/admin/list-user`
        return ApiSender.get(route, query)
    }

    public static createUserByAdmin(payload: object) {
        const route = `/core/admin/create-user-by-admin`
        return ApiSender.post(route, payload)
    }

    public static updateUserByAdmin(payload: object) {
        const route = `/core/admin/update-user-by-admin`
        return ApiSender.post(route, payload)
    }

    public static deleteUserByAdmin(payload: object) {
        const route = `/core/admin/delete-user-by-admin`
        return ApiSender.post(route, payload)
    }

    public static unregisteredUsersList(query?: any) {
        const route = `/core/admin/unregistered-users-list`
        return ApiSender.get(route, query)
    }

    public static userActivityUpdate(payload: object) {
        const route = `/core/admin/user-activity-update`
        return ApiSender.post(route, payload)
    }
}
