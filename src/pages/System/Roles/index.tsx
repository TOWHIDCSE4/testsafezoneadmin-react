import { useEffect, useState } from 'react'
import { Table, Card, Button, Menu, Dropdown, notification, Modal } from 'antd'
import {
    EditOutlined,
    EllipsisOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import RoleAPI from 'api/RoleAPI'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import RoleModal from './role-modal'

const Roles = () => {
    const [roles, setRoles] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [roleInfo, setRoleInfo] = useState({})

    const getListRole = (query: { page_size: number; page_number: number }) => {
        setLoading(true)
        RoleAPI.getListRole(query)
            .then((res) => {
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setRoles(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const refetchData = () => {
        setPageNumber(1)
        getListRole({
            page_number: 1,
            page_size: pageSize
        })
    }

    useEffect(() => {
        refetchData()
    }, [])

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getListRole({
                page_number: pageNumber,
                page_size: _pageSize
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getListRole({
                page_number: _pageNumber,
                page_size: pageSize
            })
        }
    }

    const addNewRole = () => {
        setVisible(true)
        setModalType(MODAL_TYPE.ADD_NEW)
        setRoleInfo({})
    }

    const editRole = (selected) => {
        setVisible(true)
        setModalType(MODAL_TYPE.EDIT)
        setRoleInfo(selected)
    }

    const deleteRole = (record) => {
        setLoading(true)
        RoleAPI.deleteRole({ role_id: record._id })
            .then((data) => {
                refetchData()
                notification.success({
                    message: 'Xóa thành công'
                })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setLoading(false))
    }

    const confirmDeleteRole = (record) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Bạn chắc chắn muốn xóa?`,
            onOk() {
                deleteRole(record)
            }
        })
    }

    const menuActions = (record: any) => (
        <Menu>
            {checkPermission(PERMISSIONS.s_r_edit) ? (
                <Menu.Item key='0' onClick={() => editRole(record)}>
                    <EditOutlined className='mr-2' />
                    Edit
                </Menu.Item>
            ) : (
                <></>
            )}
            {checkPermission(PERMISSIONS.s_r_delete) ? (
                <Menu.Item key='1' onClick={() => confirmDeleteRole(record)}>
                    <DeleteOutlined className='mr-2' />
                    Delete
                </Menu.Item>
            ) : (
                <></>
            )}
        </Menu>
    )

    const columns: ColumnsType = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            width: 80,
            align: 'center',
            render: (text, record, index) =>
                pageSize * (pageNumber - 1) + index + 1
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Total users',
            dataIndex: 'admin_has_roles',
            key: 'admin_has_roles',
            align: 'center',
            width: 150,
            render: (text, record, index) => text.length
        },
        {
            title: 'Action',
            key: 'action',
            align: 'center',
            width: 80,
            fixed: 'right',
            render: (text, record) => (
                <Dropdown overlay={menuActions(record)} trigger={['click']}>
                    <EllipsisOutlined />
                </Dropdown>
            )
        }
    ]

    return (
        <Card title='Roles'>
            <FilterDataWrapper
                extensionOut={
                    checkPermission(PERMISSIONS.s_r_create)
                        ? [
                              <Button
                                  type='primary'
                                  onClick={() => addNewRole()}
                              >
                                  Add New
                              </Button>
                          ]
                        : []
                }
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={roles}
                columns={columns}
                loading={isLoading}
                pagination={{
                    defaultCurrent: pageNumber,
                    current: pageNumber,
                    pageSize,
                    total,
                    onChange: handleChangePagination
                }}
                rowKey={(record: any) => record?._id}
                scroll={{
                    x: 500
                }}
                sticky
            />
            <RoleModal
                visible={visibleModal}
                toggleModal={setVisible}
                refetchData={refetchData}
                type={modalType}
                data={roleInfo}
            />
        </Card>
    )
}
export default Roles
