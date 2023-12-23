import { EnumQuizLevel, IQuiz } from './IQuiz'

export enum EnumQuestionType {
    MULTI_CHOICE = 1,
    FILL_ANSWER = 2,
    ONE_CHOICE = 3
}

export interface IAnswers {
    content?: string
    is_correct?: boolean
    label?: string
    text?: string
}

export interface IStudentAnswers {
    question_id: string
    question_level: number
    question_type: number
    selected_answer: IAnswers[]
    user_id: string
    subject_id: string
    is_correct: boolean
}

export interface IQuestion {
    _id: string
    id: string
    name: string
    description?: string
    answers: IAnswers[]
    question_type: EnumQuestionType
    question_level?: EnumQuizLevel
    subject_id?: string
    quiz_id: number //
    quiz: IQuiz //
    display_order: number
    created_time?: Date
    updated_time?: Date
    image?: string
    video?: string
    audio?: string
}
