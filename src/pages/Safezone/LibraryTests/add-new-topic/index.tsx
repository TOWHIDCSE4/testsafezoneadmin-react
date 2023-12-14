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
    DatePicker
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { MODAL_TYPE } from 'const'
import LibraryTestApi from 'api/LibraryTestApiNew'

const { Option } = Select

interface Props {
    visible: any
    toggleModal: any
    refetchData: any
    type: any
    data: any
}
const AddNewTopicModal = ({
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
            folder: [],
            type: [],
            level: [],
            status: []
        }
    )
    const [form] = useForm()

    const getAllFolders = () => {
        LibraryTestApi.getFolders({})
            .then((res) => {
                if (res) {
                    setValues({ folder: res })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getAllStatus = () => {
        LibraryTestApi.getStatus({})
            .then((res) => {
                if (res) {
                    setValues({ status: res })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getAllLevel = () => {
        LibraryTestApi.getLevels({})
            .then((res) => {
                if (res) {
                    setValues({ level: res })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getAllType = () => {
        LibraryTestApi.getTypes({})
            .then((res) => {
                if (res) {
                    setValues({ type: res })
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
            folder: [],
            type: [],
            level: [],
            status: []
        })
    }

    const onSave = useCallback(
        (formData) => {
            setValues({ isLoading: true })
            const postData = {
                topic: formData.topic,
                folder_id: formData.folder_id,
                status_id: formData.status_id,
                level_id: formData.level_id,
                type_id: formData.type_id,
                test_time: formData.test_time
            }

            if (type === MODAL_TYPE.ADD_NEW) {
                LibraryTestApi.createTopic(postData)
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
                LibraryTestApi.updateTopic({
                    test_id: data._id,
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
                topic: '',
                folder_id: '',
                status_id: '',
                level_id: '',
                type_id: '',
                test_time: ''
            }

            if (type === MODAL_TYPE.EDIT) {
                fieldsValue.topic = data.topic
                fieldsValue.folder_id = data.folder[0]._id
                fieldsValue.status_id = data.status[0]._id
                fieldsValue.level_id = data.level[0]._id
                fieldsValue.type_id = data.type[0]._id
                fieldsValue.test_time = data.test_time
            }

            form.setFieldsValue(fieldsValue)
            getAllFolders()
            getAllStatus()
            getAllLevel()
            getAllType()
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
            title={type === MODAL_TYPE.ADD_NEW ? 'Add New Topic' : 'Edit Topic'}
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
                            label='Topic'
                            name='topic'
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
                            name='folder_id'
                            label='Folder'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <Select>
                                {values.folder.map((item) => {
                                    return (
                                        <Option value={item.id} key={item.id}>
                                            {item.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name='type_id'
                            label='Type'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <Select>
                                {values.type.map((item) => {
                                    return (
                                        <Option value={item.id} key={item.id}>
                                            {item.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name='level_id'
                            label='Level'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <Select>
                                {values.level.map((item) => {
                                    return (
                                        <Option value={item.id} key={item.id}>
                                            {item.name}
                                        </Option>
                                    )
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label='Test Time'
                            name='test_time'
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
                            name='status_id'
                            label='Publish Status'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <Select>
                                {values.status.map((item) => {
                                    return (
                                        <Option value={item.id} key={item.id}>
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

export default AddNewTopicModal
