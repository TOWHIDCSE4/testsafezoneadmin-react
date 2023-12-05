import { useEffect, useReducer, useCallback } from 'react'
import _ from 'lodash'
import {
    Modal,
    Button,
    Row,
    Col,
    Form,
    notification,
    Select,
    DatePicker
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { DATE_FORMAT, MODAL_TYPE } from 'const'
import SubscriptionPlanAPI from 'api/SubscriptionPlanAPI'
import moment from 'moment'
import UserAPI from 'api/UserAPI'
import SubscriptionAPI from 'api/SubscriptionAPI'

const { Option } = Select
const { RangePicker } = DatePicker

interface Props {
    visible: any
    toggleModal: any
    refetchData: any
    type: any
    data: any
}
const SubscriptionModal = ({
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
            isLoadingUsers: false,
            plans: [],
            users: []
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

    const getUsers = useCallback(
        (search?: any) => {
            setValues({ isLoadingUsers: true })
            UserAPI.unregisteredUsersList({
                search
            })
                .then((res) => {
                    if (res?.data?.length) {
                        setValues({ users: res.data })
                    }
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValues({ isLoadingUsers: false }))
        },
        [values]
    )

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            isLoadingPlans: false,
            isLoadingUsers: false,
            plans: [],
            users: []
        })
    }

    const onSave = useCallback(
        (formData) => {
            setValues({ isLoading: true })
            const postData = {
                active: false,
                plan: formData.plan,
                user: formData.user || null,
                period: formData.period,
                startDate: formData.date?.[0],
                endDate: formData.date?.[1]
            }

            if (type === MODAL_TYPE.ADD_NEW) {
                SubscriptionAPI.createSubscription(postData)
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
                SubscriptionAPI.updateSubscription({
                    subscription_id: data._id,
                    ...postData
                })
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

    useEffect(() => {
        if (visible) {
            const fieldsValue: any = {
                period: 'YEARLY',
                date: [moment(), moment().add(1, 'year')]
            }

            if (type === MODAL_TYPE.EDIT) {
                fieldsValue.plan = data.plan
                fieldsValue.period = data.subscriptionPeriod
                fieldsValue.date = [
                    moment(data.startDate),
                    moment(data.endDate)
                ]
            }

            form.setFieldsValue(fieldsValue)
            getPlans()
            getUsers()
        }
    }, [visible])

    const onchangePeriod = (v) => {
        switch (v) {
            case '6_MONTH':
                form.setFieldsValue({
                    date: [moment(), moment().add(6, 'month')]
                })
                break

            default:
                form.setFieldsValue({
                    date: [moment(), moment().add(1, 'year')]
                })
                break
        }
    }

    const renderUser = () =>
        values.users.map((item) => {
            return (
                <Option value={item.id} key={item.id}>
                    {item.displayName}
                </Option>
            )
        })

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
                    ? 'Add New Subscription'
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
                        {type === MODAL_TYPE.ADD_NEW ? (
                            <Form.Item
                                name='user'
                                label='User'
                                rules={[
                                    {
                                        required: true,
                                        message: 'This field is required'
                                    }
                                ]}
                            >
                                <Select
                                    disabled={type === MODAL_TYPE.EDIT}
                                    showSearch
                                    allowClear
                                    autoClearSearchValue
                                    filterOption={false}
                                    onSearch={_.debounce(
                                        (val) => getUsers(val),
                                        300
                                    )}
                                    loading={values.isLoadingUsers}
                                >
                                    {renderUser()}
                                </Select>
                            </Form.Item>
                        ) : (
                            <></>
                        )}

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
                                        <Option value={item.id} key={item.id}>
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
                            <Select onChange={onchangePeriod}>
                                <Option value='6_MONTH'>6 tháng</Option>
                                <Option value='YEARLY'>Hàng năm</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label='Date'
                            name='date'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <RangePicker
                                allowClear={false}
                                format={DATE_FORMAT}
                            />
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Modal>
    )
}

export default SubscriptionModal
