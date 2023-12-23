import ApiSender from './config'

export default class SubjectSetAPI {
    public static getQuestionForStudent(query?: any) {
        const route = `/core/admin/get-question-for-student`
        return ApiSender.get(route, query)
    }

    public static saveStudentQuestion(payload: object) {
        const route = `/core/admin/save-student-question`
        return ApiSender.post(route, payload)
    }
}
