import { useEffect, useReducer, useCallback } from 'react'
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
import UserAPI from 'api/UserAPI'
import SubscriptionPlanAPI from 'api/SubscriptionPlanAPI'
import { EnumTypeAccount, MODAL_TYPE } from 'const'

const { Option } = Select

interface Props {
    visible: any
    toggleModal: any
    refetchData: any
    type: any
    data: any
}
const AddNewUser = ({
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
            isLoadingPlans: false,
            plans: []
        }
    )
    const [form] = useForm()
    const getPlans = () => {
        setValues({ isLoadingPlans: true })
        SubscriptionPlanAPI.getNamesPlans()
            .then((res) => {
                if (res?.data?.length) {
                    setValues({ plans: res.data })

                    if (type === MODAL_TYPE.ADD_NEW) {
                        const freePlan = res.data.find(
                            (x: any) => x.code === 'FR22'
                        )
                        const fieldsValue: any = {
                            plan: freePlan?.id
                        }

                        form.setFieldsValue(fieldsValue)
                    }
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoadingPlans: false }))
    }

    useEffect(() => {
        if (visible) {
            const fieldsValue: any = {
                period: 'YEARLY'
            }

            if (type === MODAL_TYPE.EDIT) {
                fieldsValue.username = data.username
                fieldsValue.email = data.email
                fieldsValue.plan = data.subscriptions?.[0]?.plan
                fieldsValue.period = data.subscriptions?.[0]?.subscriptionPeriod
            }

            form.setFieldsValue(fieldsValue)
            getPlans()
        }
    }, [visible])

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            isLoadingPlans: false,
            plans: []
        })
    }

    const onSave = useCallback(
        (formData) => {
            setValues({ isLoading: true })

            if (type === MODAL_TYPE.ADD_NEW) {
                UserAPI.createUserByAdmin(formData)
                    .then((res) => {
                        console.log(res)
                        reset()
                        refetchData()
                        toggleModal(false)
                        notification.success({
                            message: 'Success',
                            description: 'Thêm thành công'
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
                UserAPI.updateUserByAdmin({ user_id: data._id, ...formData })
                    .then((res) => {
                        console.log(res)
                        reset()
                        refetchData()
                        toggleModal(false)
                        notification.success({
                            message: 'Success',
                            description: 'Sửa thành công'
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
            title={type === MODAL_TYPE.EDIT ? 'Edit User' : 'Add New User'}
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
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        form={form}
                        onFinish={onSave}
                    >
                        {type === MODAL_TYPE.ADD_NEW ? (
                            <>
                                <Form.Item
                                    label='Username'
                                    name='username'
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
                                    name='email'
                                    label='Email'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'This field is required'
                                        },
                                        {
                                            type: 'email',
                                            message: 'Enter email invalid'
                                        }
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </>
                        ) : (
                            <></>
                        )}
                        <Form.Item
                            label='Type'
                            name='type'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <Select placeholder='Choose type'>
                                {Object.keys(EnumTypeAccount)
                                    .filter(
                                        (key: any) =>
                                            !isNaN(Number(EnumTypeAccount[key]))
                                    )
                                    .map((key) => {
                                        return (
                                            <Option
                                                value={EnumTypeAccount[key]}
                                                key={key}
                                            >
                                                {key}
                                            </Option>
                                        )
                                    })}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name='password'
                            label='Password'
                            extra={
                                type === MODAL_TYPE.EDIT
                                    ? 'Enter password if you want to reset password. Other else leave a blank'
                                    : ''
                            }
                            rules={[
                                {
                                    required: type === MODAL_TYPE.ADD_NEW,
                                    message: 'Password is required'
                                }
                            ]}
                        >
                            <Input.Password
                                autoComplete={null}
                                autoCorrect={null}
                            />
                        </Form.Item>

                        {/* {type === MODAL_TYPE.ADD_NEW ? (
                            <>
                                <Form.Item
                                    name='plan'
                                    label='Plan'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'This field is required'
                                        }
                                    ]}
                                >
                                    <Select loading={values.isLoadingPlans}>
                                        {values.plans.map((item) => {
                                            return (
                                                <Option
                                                    value={item.id}
                                                    key={item.id}
                                                >
                                                    {item.name}
                                                </Option>
                                            )
                                        })}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name='period'
                                    label='Period'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'This field is required'
                                        }
                                    ]}
                                >
                                    <Select>
                                        <Option value='6_MONTH'>6 tháng</Option>
                                        <Option value='YEARLY'>Hàng năm</Option>
                                    </Select>
                                </Form.Item>
                            </>
                        ) : (
                            <></>
                        )} */}
                    </Form>
                </Col>
            </Row>
        </Modal>
    )
}

export default AddNewUser
