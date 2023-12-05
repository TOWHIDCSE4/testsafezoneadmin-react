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
    Select,
    Table,
    SelectProps
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { MODAL_TYPE } from 'const'
import { ColumnsType } from 'antd/lib/table'
import Actions from './Action'
import PermissionAPI from 'api/PermissionAPI'
import AdminAPI from 'api/AdminAPI'
import RoleAPI from 'api/RoleAPI'
import { useAuth } from 'contexts/Authenticate'

const { Option } = Select
let options: SelectProps['options'] = []

interface Props {
    visible: any
    toggleModal: any
    refetchData: any
    type: any
    data: any
}
const RoleModal = ({
    visible,
    toggleModal,
    refetchData,
    type,
    data
}: Props) => {
    const { user } = useAuth()

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            isLoadingPermissions: false,
            isLoadingRoles: false,
            permissions: [],
            roles: []
        }
    )

    const [form] = useForm()

    const getRoles = () => {
        setValues({ isLoadingRoles: true })
        RoleAPI.getNamesRoles()
            .then((res) => {
                console.log(res)
                if (res?.data?.length) {
                    setValues({ roles: res.data })
                    options = []
                    for (const iterator of res.data) {
                        options.push({
                            label: iterator.name,
                            value: iterator.id
                        })
                    }
                    console.log('options')
                    console.log(options)
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoadingRoles: false }))
    }

    const getPermissions = () => {
        setValues({ isLoadingPermissions: true })
        PermissionAPI.getPermissions()
            .then((res) => {
                if (res?.data?.length) {
                    setValues({ permissions: res.data })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoadingPermissions: false }))
    }

    useEffect(() => {
        if (visible) {
            const fieldsValue: any = {
                status: 1,
                roles_id: []
            }

            if (type === MODAL_TYPE.EDIT) {
                const rolesId = data.admin_has_roles.map((x: any) => x.role_id)

                fieldsValue.email = data.email
                fieldsValue.first_name = data.first_name
                fieldsValue.last_name = data.last_name
                fieldsValue.password = data.password
                fieldsValue.phone = data.phone
                fieldsValue.roles_id = rolesId
                fieldsValue.status = data.status
                fieldsValue.username = data.username

                for (const iterator of data.admin_has_permissions) {
                    fieldsValue[iterator.permission_id] = true
                }
            }

            form.setFieldsValue(fieldsValue)
            getPermissions()
        }
    }, [visible])

    useEffect(() => {
        getRoles()
    }, [])

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            isLoadingPermissions: false,
            permissions: []
        })
    }

    const onSave = useCallback(
        (formData) => {
            setValues({ isLoading: true })
            const permissionsId = []
            for (const key in formData) {
                if (key !== 'name' && formData[key] === true) {
                    permissionsId.push(key)
                }
            }
            const postData = {
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                password: formData.password,
                phone: formData.phone,
                roles_id: formData.roles_id || [],
                status: formData.status,
                username: formData.username,
                permissions_id: permissionsId
            }

            if (type === MODAL_TYPE.ADD_NEW) {
                AdminAPI.createEmployee(postData)
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
                AdminAPI.updateEmployee({ admin_id: data._id, ...postData })
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
            }
        },
        [form, type, data]
    )

    const columns: ColumnsType = [
        {
            title: 'Module',
            dataIndex: 'module',
            key: 'module',
            width: '250px',
            render: (text, record: any) => text.toUpperCase()
        },
        {
            title: 'Permissions',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (text, record: any) => <Actions record={record} />
        }
    ]

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
                    ? 'Add New Employee'
                    : 'Edit Employee'
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
            width={1000}
        >
            <Row>
                <Col span={24}>
                    <Form
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        form={form}
                        onFinish={onSave}
                    >
                        <Row gutter={[20, 10]}>
                            <Col span={8}>
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
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label='Fist name'
                                    name='first_name'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'This field is required'
                                        }
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label='Last name'
                                    name='last_name'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'This field is required'
                                        }
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[20, 10]}>
                            <Col span={8}>
                                <Form.Item
                                    label='Email'
                                    name='email'
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
                            </Col>
                            <Col span={8}>
                                <Form.Item label='Phone' name='phone'>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label='Status'
                                    name='status'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'This field is required'
                                        }
                                    ]}
                                >
                                    <Select>
                                        <Option value={1}>Active</Option>
                                        <Option value={0}>Inactive</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={[20, 10]}>
                            <Col span={8}>
                                <Form.Item
                                    label='Password'
                                    name='password'
                                    extra={
                                        type === MODAL_TYPE.EDIT
                                            ? 'Enter password if you want to reset password. Other else leave a blank'
                                            : ''
                                    }
                                    rules={[
                                        {
                                            required:
                                                type === MODAL_TYPE.ADD_NEW,
                                            message: 'Password is required'
                                        }
                                    ]}
                                >
                                    <Input.Password
                                        autoComplete={null}
                                        autoCorrect={null}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item label='Role' name='roles_id'>
                                    <Select
                                        mode='multiple'
                                        allowClear
                                        style={{ width: '100%' }}
                                        placeholder='--Choose Role--'
                                        defaultValue={[]}
                                        options={options}
                                        loading={values.isLoadingRoles}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Table
                            dataSource={values.permissions || []}
                            rowKey={(v: any) => v?._id}
                            columns={columns}
                            bordered
                            loading={values.isLoadingPermissions}
                            style={{
                                height: 'calc(100vh - 250px)'
                            }}
                            scroll={{
                                y: 'calc(100vh - 250px)',
                                x: 800
                            }}
                            pagination={false}
                        />
                    </Form>
                </Col>
            </Row>
        </Modal>
    )
}

export default RoleModal
