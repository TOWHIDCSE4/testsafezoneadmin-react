import ApiSender from './config'

export default class SubscriptionAPI {
    public static getSubscriptions(payload: object) {
        const route = `/core/admin/get-subscriptions`
        return ApiSender.get(route, payload)
    }

    public static updateSubscriptionStatus(payload: object) {
        const route = `/core/admin/update-subscription-status`
        return ApiSender.post(route, payload)
    }

    public static createSubscription(payload: object) {
        const route = `/core/admin/create-subscription`
        return ApiSender.post(route, payload)
    }

    public static updateSubscription(payload: object) {
        const route = `/core/admin/update-subscription`
        return ApiSender.post(route, payload)
    }
}
