import { useEffect, useReducer, useCallback, useState } from 'react'
import _ from 'lodash'
import {
    Modal,
    Button,
    Row,
    Col,
    Form,
    Checkbox,
    notification,
    Select,
    TimePicker
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { MODAL_TYPE } from 'const'
import ParentSettingApi from 'api/ParentSettingApi'
import moment from 'moment'
import AddQuizModal from './add-quiz'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'

const { Option } = Select

interface Props {
    visible: any
    toggleModal: any
    refetchData: any
    type: any
    data: any
}
const AddNewTimeModal = ({
    visible,
    toggleModal,
    refetchData,
    type,
    data
}: Props) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            quizes: [],
            subjects: [],
            selectedQuizes: []
        }
    )
    const [form] = useForm()

    const [quizVisible, setQuizVisible] = useState(false)

    const getAllSubjects = () => {
        ParentSettingApi.getAllSubjects({})
            .then((res) => {
                if (res) {
                    setValues({ subjects: res })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getAllQuizes = () => {
        ParentSettingApi.getAllQuizes({})
            .then((res) => {
                if (res) {
                    const quiz = res.map((item) => {
                        return item.id
                    })
                    setValues({ selectedQuizes: quiz })
                    setValues({ quizes: res })
                    if (type === MODAL_TYPE.EDIT && data.subject !== 'Quiz') {
                        setQuizVisible(false)
                    } else {
                        setQuizVisible(true)
                    }
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            quizes: [],
            subjects: [],
            selectedQuizes: []
        })
    }

    const onSave = useCallback(
        (formData) => {
            setValues({ isLoading: true })
            const { minutes, seconds } = formData.time.toObject()

            const formattedTime = `${_.padStart(minutes, 2, '0')}:${_.padStart(
                seconds,
                2,
                '0'
            )}`
            const postData = {
                time: formattedTime,
                subject: formData.subject,
                quizes: values.selectedQuizes
            }

            if (type === MODAL_TYPE.ADD_NEW) {
                ParentSettingApi.createSetting(postData)
                    .then((res) => {
                        console.log(res)
                        reset()
                        refetchData()
                        toggleModal(false)
                        notification.success({
                            message: 'Success',
                            description: 'Tên miền được tạo thành công'
                        })
                    })
                    .catch((err) => {
                        notification.error({
                            message: 'Error',
                            description: err.message
                        })
                    })
                    .finally(() => setValues({ isLoading: false }))
            } else if (type === MODAL_TYPE.EDIT) {
                ParentSettingApi.UpdateSetting({
                    parents_setting_id: data._id,
                    ...postData
                })
                    .then((res) => {
                        console.log(res)
                        reset()
                        refetchData()
                        toggleModal(false)
                        notification.success({
                            message: 'Success',
                            description: 'Đã cập nhật tên miền thành công'
                        })
                    })
                    .catch((err) => {
                        notification.error({
                            message: 'Error',
                            description: err.message
                        })
                    })
                    .finally(() => setValues({ isLoading: false }))
            }
        },
        [form, type, data, values.selectedQuizes]
    )

    useEffect(() => {
        if (visible) {
            const fieldsValue: any = {
                time: moment().startOf('day').add(30, 'minutes'),
                subject: 'Quiz',
                quizes: [],
                selectedQuizes: []
            }

            if (type === MODAL_TYPE.EDIT) {
                const [minutes, seconds] = data.time.split(':')
                const momentObject = moment()
                    .startOf('day')
                    .add({ minutes, seconds })
                fieldsValue.time = momentObject
                if (data.subject === 'Quiz') {
                    setQuizVisible(true)
                    setValues({ selectedQuizes: data.quizes })
                } else {
                    setQuizVisible(false)
                }
                fieldsValue.subject = data.subject
            }

            form.setFieldsValue(fieldsValue)
            getAllSubjects()
            getAllQuizes()
        }
    }, [visible])

    const setModalVisible = (val) => {
        if (val === 'Quiz') {
            setQuizVisible(true)
        } else {
            setQuizVisible(false)
        }
    }

    const renderQuiz = (quizes) => {
        const onChange = (checkedValues: CheckboxValueType[]) => {
            setValues({ selectedQuizes: checkedValues })
        }

        return (
            <Checkbox.Group
                style={{ width: '100%' }}
                onChange={onChange}
                defaultValue={values.selectedQuizes}
            >
                <Row>
                    {quizes.map((item) => (
                        <Col span={8} key={item.id}>
                            <Checkbox value={item.id}>{item.name}</Checkbox>
                        </Col>
                    ))}
                </Row>
            </Checkbox.Group>
        )
    }

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            open={visible}
            onCancel={() => {
                reset()
                toggleModal(false)
                refetchData()
                setQuizVisible(true)
            }}
            title={type === MODAL_TYPE.ADD_NEW ? 'Add New Time' : 'Edit Time'}
            footer={[
                <Button
                    key='save'
                    type='primary'
                    onClick={() => form.submit()}
                    loading={values.isLoading}
                >
                    Save
                </Button>
            ]}
            width={500}
        >
            <Row>
                <Col span={24}>
                    <Form
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 20 }}
                        form={form}
                        onFinish={onSave}
                    >
                        <Form.Item
                            label='Time'
                            name='time'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <TimePicker format='mm:ss' />
                        </Form.Item>

                        <Form.Item
                            name='subject'
                            label='Subject'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <Select onChange={(val) => setModalVisible(val)}>
                                {values.subjects.map((item) => {
                                    return (
                                        <Option value={item.name} key={item.id}>
                                            {item.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
            {quizVisible && renderQuiz(values.quizes)}
        </Modal>
    )
}

export default AddNewTimeModal
