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
    Select
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { MODAL_TYPE } from 'const'
import ParentSettingApi from 'api/ParentSettingApi'


const { Option } = Select

const Subjects = [
    {
        id: 1,
        value: 'English'
    },
    {
        id: 2,
        value: 'Mathematics'
    },
    {
        id: 3,
        value: 'Quizzes'
    }
]

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
            quizes: []
        }
    )
    const [form] = useForm()

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            categories: []
        })
    }

    const onSave = useCallback(
        (formData) => {
            setValues({ isLoading: true })
            const postData = {
                time: formData.time,
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
                    category_domain_id: data._id,
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
                time: '',
                subject: ''
            }

            if (type === MODAL_TYPE.EDIT) {
                fieldsValue.time = data.time
                fieldsValue.subject = data.subject
            }

            form.setFieldsValue(fieldsValue)
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
                            <Input />
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
                                {Subjects.map((item) => {
                                    return (
                                        <Option
                                            value={item.value}
                                            key={item.id}
                                        >
                                            {item.value}
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
