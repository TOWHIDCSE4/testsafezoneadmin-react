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
import SubscriptionAPI from 'api/SubscriptionAPI'
import CategoryDomainAPI from 'api/CategoryDomainAPI'

const { Option } = Select

interface Props {
    visible: any
    toggleModal: any
    refetchData: any
    type: any
    data: any
}
const AddNewHostModal = ({
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
            isLoadingCategories: false,
            categories: []
        }
    )
    const [form] = useForm()
    const getAllCategories = () => {
        setValues({ isLoadingCategories: true })
        CategoryDomainAPI.getAllCategories({})
            .then((res) => {
                if (res) {
                    setValues({ categories: res })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoadingCategories: false }))
    }

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            isLoadingCategories: false,
            categories: []
        })
    }

    const onSave = useCallback(
        (formData) => {
            setValues({ isLoading: true })
            const postData = {
                host: formData.host,
                category_id: formData.category_id
            }

            if (type === MODAL_TYPE.ADD_NEW) {
                CategoryDomainAPI.createDomain(postData)
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
                CategoryDomainAPI.updateDomain({
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
                host: '',
                category_id: ''
            }

            if (type === MODAL_TYPE.EDIT) {
                fieldsValue.host = data.host
                fieldsValue.category_id = data.category_id
            }

            form.setFieldsValue(fieldsValue)
            getAllCategories()
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
            title={
                type === MODAL_TYPE.ADD_NEW
                    ? 'Add New Domain'
                    : 'Edit Subscription'
            }
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
                            label='Host'
                            name='host'
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
                            name='category_id'
                            label='Category'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <Select loading={values.isLoadingCategories}>
                                {values.categories.map((item) => {
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

export default AddNewHostModal
