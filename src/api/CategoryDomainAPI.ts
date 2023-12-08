import ApiSender from './config'

export default class CategoryDomainAPI {
    public static getDomains(payload: object) {
        const route = `/core/admin/list-category-domain`
        return ApiSender.get(route, payload)
    }

    public static getAllCategories(payload: object) {
        const route = `/core/admin/list-web-categories`
        return ApiSender.get(route, payload)
    }

    public static deleteDomain(payload: object) {
        const route = `/core/admin/delete-category-domain`
        return ApiSender.post(route, payload)
    }

    public static createDomain(payload: object) {
        const route = `/core/admin/create-category-domain`
        return ApiSender.post(route, payload)
    }

    public static updateDomain(payload: object) {
        const route = `/core/admin/update-category-domain`
        return ApiSender.post(route, payload)
    }
}
