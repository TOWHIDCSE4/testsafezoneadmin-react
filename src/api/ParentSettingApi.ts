import ApiSender from './config'

export default class ParentSettingApi {
    public static getAllSettings(payload: object) {
        const route = `/core/admin/list-parent-setting`
        return ApiSender.get(route, payload)
    }

    public static deleteSetting(payload: object) {
        const route = `/core/admin/delete-parents-setting`
        return ApiSender.post(route, payload)
    }

    public static createSetting(payload: object) {
        const route = `/core/admin/create-parents-setting`
        return ApiSender.post(route, payload)
    }

    public static UpdateSetting(payload: object) {
        const route = `/core/admin/update-parents-setting`
        return ApiSender.post(route, payload)
    }
}
