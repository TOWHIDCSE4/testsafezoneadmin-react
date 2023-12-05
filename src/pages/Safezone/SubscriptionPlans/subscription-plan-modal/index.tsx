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
    InputNumber,
    Checkbox,
    Select
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { EnumTypePlan, MODAL_TYPE } from 'const'
import SubscriptionPlanAPI from 'api/SubscriptionPlanAPI'

const { Option } = Select
interface Props {
    visible: any
    toggleModal: any
    refetchData: any
    type: any
    data: any
}
const SubscriptionPlanModal = ({
    visible,
    toggleModal,
    refetchData,
    type,
    data
}: Props) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false
        }
    )
    const [form] = useForm()

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false
        })
    }

    const onSave = useCallback(
        (formData) => {
            setValues({ isLoading: true })

            if (type === MODAL_TYPE.ADD_NEW) {
                SubscriptionPlanAPI.createPlan(formData)
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
                SubscriptionPlanAPI.updatePlan({
                    plan_id: data.id,
                    ...formData
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
            if (type === MODAL_TYPE.EDIT) {
                const result: any = {
                    name: data.name,
                    code: data.code,
                    type: data.type,
                    total_use_days: data.totalUseDays,
                    total_devices: data.totalDevices,
                    yearly_price: data.yearlyPrice,
                    monthly_price: data.monthlyPrice,
                    is_free: data.isFree
                }
                form.setFieldsValue(result)
            }
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
            title={type === MODAL_TYPE.ADD_NEW ? 'Add New Plan' : 'Edit Plan'}
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
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        form={form}
                        onFinish={onSave}
                    >
                        <Form.Item
                            label='Name'
                            name='name'
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
                            label='Code'
                            name='code'
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
                                {Object.keys(EnumTypePlan)
                                    .filter(
                                        (key: any) =>
                                            !isNaN(Number(EnumTypePlan[key]))
                                    )
                                    .map((key) => {
                                        return (
                                            <Option
                                                value={EnumTypePlan[key]}
                                                key={key}
                                            >
                                                {key}
                                            </Option>
                                        )
                                    })}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            label='Total Use Days'
                            name='total_use_days'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label='Total Devices'
                            name='total_devices'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            label='Yearly Price'
                            name='yearly_price'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>

                        <Form.Item
                            label='Monthly Price'
                            name='monthly_price'
                            rules={[
                                {
                                    required: true,
                                    message: 'This field is required'
                                }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>

                        <Form.Item
                            name='is_free'
                            label='Is Free'
                            valuePropName='checked'
                        >
                            <Checkbox
                                name='is_free'
                                defaultChecked={false}
                            ></Checkbox>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </Modal>
    )
}

export default SubscriptionPlanModal
