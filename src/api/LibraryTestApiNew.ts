import ApiSender from './config'

export default class LibraryTestApiNew {
    public static getFolders(payload: object) {
        const route = `/core/admin/list-library-test-folder`
        return ApiSender.get(route, payload)
    }

    public static getLevels(payload: object) {
        const route = `/core/admin/list-library-test-level`
        return ApiSender.get(route, payload)
    }

    public static getTypes(payload: object) {
        const route = `/core/admin/list-library-test-type`
        return ApiSender.get(route, payload)
    }

    public static getTags(payload: object) {
        const route = `/core/admin/list-library-test-tag`
        return ApiSender.get(route, payload)
    }

    public static getStatus(payload: object) {
        const route = `/core/admin/list-library-test-status`
        return ApiSender.get(route, payload)
    }

    public static getAllTopics(payload: object) {
        const route = `/core/admin/list-library-test`
        return ApiSender.get(route, payload)
    }

    public static deleteTopic(payload: object) {
        const route = `/core/admin/delete-library-test`
        return ApiSender.post(route, payload)
    }

    public static createTopic(payload: object) {
        const route = `/core/admin/create-library-test`
        return ApiSender.post(route, payload)
    }

    public static updateTopic(payload: object) {
        const route = `/core/admin/update-library-test`
        return ApiSender.post(route, payload)
    }
}
