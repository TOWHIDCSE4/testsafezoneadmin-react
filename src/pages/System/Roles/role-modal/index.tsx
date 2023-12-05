import { useEffect, useReducer, useCallback } from 'react'
import _ from 'lodash'
import { Modal, Button, Row, Col, Form, Input, notification, Table } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { MODAL_TYPE } from 'const'
import { ColumnsType } from 'antd/lib/table'
import Actions from './Action'
import RoleAPI from 'api/RoleAPI'
import PermissionAPI from 'api/PermissionAPI'

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
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            isLoadingPermission: false,
            permissions: []
        }
    )
    const [form] = useForm()
    const getPermissions = () => {
        setValues({ isLoadingPermission: true })
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
            .finally(() => setValues({ isLoadingPermission: false }))
    }

    useEffect(() => {
        if (visible) {
            if (type === MODAL_TYPE.EDIT) {
                const result: any = {
                    name: data.name
                }
                for (const iterator of data.role_has_permissions) {
                    result[iterator.permission_id] = true
                }
                form.setFieldsValue(result)
            }
            getPermissions()
        }
    }, [visible])

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            isLoadingPermission: false,
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
                name: formData.name,
                permissions_id: permissionsId
            }

            if (type === MODAL_TYPE.ADD_NEW) {
                RoleAPI.createRoleByAdmin(postData)
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
                RoleAPI.updateRoleByAdmin({ role_id: data._id, ...postData })
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
            title={type === MODAL_TYPE.ADD_NEW ? 'Add New Role' : 'Edit Role'}
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
                        <Form.Item
                            label='name'
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

                        <Table
                            dataSource={values.permissions || []}
                            rowKey={(v: any) => v?._id}
                            columns={columns}
                            bordered
                            loading={values.isLoadingPermission}
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
