import { useEffect, useReducer, useCallback, useState } from 'react'
import _ from 'lodash'
import {
    Modal,
    Button,
    Row,
    Col,
    Form,
    Input,
    notification,
    Select,
    TimePicker
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { MODAL_TYPE } from 'const'
import ParentSettingApi from 'api/ParentSettingApi'
import moment from 'moment'

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
            subjects: []
        }
    )
    const [form] = useForm()

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

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            subjects: []
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
                subject: formData.subject
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
        [form, type, data]
    )

    useEffect(() => {
        if (visible) {
            const fieldsValue: any = {
                time: moment().startOf('day').add(30, 'minutes'),
                subject: ''
            }

            if (type === MODAL_TYPE.EDIT) {
                const [minutes, seconds] = data.time.split(':')
                const momentObject = moment()
                    .startOf('day')
                    .add({ minutes, seconds })
                fieldsValue.time = momentObject
                fieldsValue.subject = data.subject
            }

            form.setFieldsValue(fieldsValue)
            getAllSubjects()
        }
    }, [visible])

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            open={visible}
            onCancel={() => {
                reset()
                toggleModal(false)
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
                            <Select>
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
        </Modal>
    )
}

export default AddNewTimeModal
