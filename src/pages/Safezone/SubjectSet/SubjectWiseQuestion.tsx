import React, { useEffect, useState, useCallback, FC } from 'react'
import {
    Row,
    Col,
    Form,
    Radio,
    Space,
    Input,
    Checkbox,
    Button,
    Image,
    notification
} from 'antd'
import { notify } from 'utils/notify'
import {
    IQuestion,
    EnumQuestionType,
    IAnswers,
    IStudentAnswers
} from 'types/IQuestion'
import * as store from 'utils/storage'
import SubjectSetAPI from 'api/SubjectSetAPI'
import ShowNotification from './modals'

type Props = {
    data?: IQuestion[]
    subject_id: string
    setQuestionPage: any
}

const SubjectWiseQuestion: FC<Props> = ({
    data,
    subject_id,
    setQuestionPage
}) => {
    const userId = store.get('user')?._id
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const [correct, setCorrect] = useState(0)
    const [timer, setTimer] = useState(30 * 60)

    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60)
        const seconds = timeInSeconds % 60
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
            2,
            '0'
        )}`
    }

    useEffect(() => {
        const timerId = setInterval(() => {
            setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0))
        }, 1000)

        return () => clearInterval(timerId)
    }, [])

    const onFinish = useCallback(
        async (values) => {
            console.log(values)
            const studentAnswer = values.answers.map(
                (selectedAnswer, index) => {
                    const question = data[index]
                    let ans: IAnswers[] = []
                    let is_correct: Boolean
                    if (typeof selectedAnswer === 'string') {
                        const find = question.answers.find(
                            (i) => i.text === selectedAnswer
                        )
                        if (typeof find !== 'undefined') {
                            is_correct = find.is_correct
                            ans.push(find)
                        }
                    } else {
                        const find = question.answers.reduce((acc, cur) => {
                            const match = selectedAnswer.find(
                                (i) => i === cur.text
                            )
                            if (typeof match !== 'undefined') {
                                if (!cur.is_correct) {
                                    is_correct = false
                                }
                                acc.push(cur)
                            }
                            return acc
                        }, [])

                        ans = find
                    }
                    return {
                        question_id: question.id,
                        question_level: question.question_level,
                        question_type: question.question_type,
                        selected_answer: ans,
                        user_id: userId,
                        subject_id,
                        is_correct
                    }
                }
            )

            const correctAns = studentAnswer.reduce((count, cur) => {
                if (cur.is_correct) {
                    count++
                }
                return count
            }, 0)
            SubjectSetAPI.saveStudentQuestion({ studentAnswers: studentAnswer })
                .then((res) => {
                    console.log(res)
                    setCorrect(correctAns)
                    setIsModalVisible(true)
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))

            // Now `selectedAnswers` contains an array of objects with questionId and selectedAnswer
            console.log('Selected Answers:', studentAnswer)
        },
        [form, data]
    )

    return (
        <Form
            name='basic'
            layout='vertical'
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
        >
            <Row>
                <Col span={24}>
                    <p style={{ float: 'right' }}>
                        Time Remaining: {formatTime(timer)}
                    </p>
                </Col>
            </Row>

            {data.map((item, index) => (
                <Row key={index}>
                    <Col span={24}>
                        <Row>
                            <Col span={12}>
                                <h1>{item.name}</h1>
                                <h4>{item.description}</h4>
                            </Col>
                            <Col span={12}>
                                <Image
                                    width={50}
                                    src={item.image}
                                    onError={() => true}
                                />
                            </Col>
                        </Row>
                    </Col>

                    <Col span={24}>
                        {EnumQuestionType[item.question_type] ===
                            'MULTI_CHOICE' && (
                            <Form.Item
                                label='Answer'
                                labelAlign='left'
                                name={['answers', index]}
                            >
                                <Radio.Group>
                                    {item.answers.map((ans) => (
                                        <Space
                                            direction='horizontal'
                                            key={ans.text}
                                        >
                                            <Radio
                                                value={ans.text}
                                                style={{ padding: '8px' }}
                                            >
                                                <Input
                                                    disabled
                                                    value={ans.label}
                                                    style={{ padding: '5px' }}
                                                />
                                                <Input
                                                    disabled
                                                    value={ans.text}
                                                />
                                            </Radio>
                                        </Space>
                                    ))}
                                </Radio.Group>
                            </Form.Item>
                        )}

                        {EnumQuestionType[item.question_type] !==
                            'MULTI_CHOICE' && (
                            <Form.Item label='Answer' name={['answers', index]}>
                                <Checkbox.Group style={{ width: '100%' }}>
                                    <Row>
                                        {item.answers.map((ans) => (
                                            <Col span={8} key={ans.text}>
                                                <Checkbox
                                                    value={ans.text}
                                                    style={{ padding: '8px' }}
                                                >
                                                    <Input
                                                        disabled
                                                        value={ans.label}
                                                        style={{
                                                            padding: '5px'
                                                        }}
                                                    />
                                                    <Input
                                                        disabled
                                                        value={ans.text}
                                                    />
                                                </Checkbox>
                                            </Col>
                                        ))}
                                    </Row>
                                </Checkbox.Group>
                            </Form.Item>
                        )}
                    </Col>
                </Row>
            ))}
            <Button
                key='submit'
                type='primary'
                htmlType='submit'
                loading={loading}
            >
                Submit
            </Button>
            <ShowNotification
                visible={isModalVisible}
                toggleModal={setQuestionPage}
                total={data.length}
                correct={0}
            />
        </Form>
    )
}

export default SubjectWiseQuestion
