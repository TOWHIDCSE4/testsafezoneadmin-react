import ApiSender from './config'

export default class SubscriptionPlanAPI {
    public static getSubscriptionPlans(payload: object) {
        const route = `/core/admin/get-subscription-plans`
        return ApiSender.get(route, payload)
    }

    public static createPlan(payload: object) {
        const route = `/core/admin/create-plan`
        return ApiSender.post(route, payload)
    }

    public static updatePlan(payload: object) {
        const route = `/core/admin/update-plan`
        return ApiSender.post(route, payload)
    }

    public static getNamesPlans(query?: any) {
        const route = `/core/admin/get-names-plans`
        return ApiSender.get(route, query)
    }

    public static deletePlan(payload: object) {
        const route = `/core/admin/delete-plan`
        return ApiSender.post(route, payload)
    }
}
