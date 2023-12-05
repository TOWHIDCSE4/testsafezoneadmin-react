import { useEffect, useState, useCallback } from 'react'
import {
    Table,
    Card,
    Button,
    Tag,
    Input,
    Menu,
    Dropdown,
    notification,
    Modal,
    Select
} from 'antd'
import {
    EditOutlined,
    EllipsisOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import UserAPI from 'api/UserAPI'
import { notify } from 'utils/notify'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import AddNewUserModal from './add-new-user'
import SubscriptionAPI from 'api/SubscriptionAPI'
import moment from 'moment'
import { EnumTypeAccount, MODAL_TYPE } from 'const'

const { Option } = Select
const { Search } = Input

const Users = () => {
    const [users, setUsers] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [userInfo, setUserInfo] = useState({})

    const getListUser = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        setLoading(true)
        UserAPI.getListUser(query)
            .then((res) => {
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setUsers(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const refetchData = () => {
        setPageNumber(1)
        getListUser({
            page_number: 1,
            page_size: pageSize,
            search
        })
    }

    useEffect(() => {
        refetchData()
    }, [])

    const onSearch = useCallback(
        (value) => {
            console.log(value)
            setPageNumber(1)
            setSearch(value)
            getListUser({
                search: value,
                page_number: 1,
                page_size: pageSize
            })
        },
        [search, pageSize, pageNumber]
    )

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getListUser({
                page_number: pageNumber,
                page_size: _pageSize,
                search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getListUser({
                page_number: _pageNumber,
                page_size: pageSize,
                search
            })
        }
    }

    const toggleModal = useCallback(
        (value: boolean) => {
            setVisible(value)
        },
        [visibleModal]
    )

    const addNewUser = () => {
        setVisible(true)
        setModalType(MODAL_TYPE.ADD_NEW)
        setUserInfo({})
    }

    const editUser = (selected) => {
        setVisible(true)
        setModalType(MODAL_TYPE.EDIT)
        setUserInfo(selected)
    }

    const userActivityUpdate = (record) => {
        setLoading(true)
        const postData = {
            user_id: record?._id,
            active: !record?.active
        }
        UserAPI.userActivityUpdate(postData)
            .then((data) => {
                refetchData()
                notification.success({
                    message: 'Sửa thành công'
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

    const typeUpdate = (val: any, record: any) => {
        setLoading(true)
        const postData = {
            user_id: record?._id,
            type: val
        }
        UserAPI.updateUserByAdmin(postData)
            .then((data) => {
                refetchData()
                notification.success({
                    message: 'Sửa thành công'
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

    const deleteUser = (record) => {
        setLoading(true)
        UserAPI.deleteUserByAdmin({ user_id: record._id })
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

    const confirmDeleteUser = (record) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Bạn chắc chắn muốn xóa?`,
            onOk() {
                deleteUser(record)
            }
        })
    }

    const menuActions = (record: any) => (
        <Menu>
            {checkPermission(PERMISSIONS.sz_u_edit) ? (
                <>
                    <Menu.Item
                        key='0'
                        onClick={() => userActivityUpdate(record)}
                    >
                        <EditOutlined className='mr-2' />
                        Status change
                    </Menu.Item>
                    <Menu.Item key='1' onClick={() => editUser(record)}>
                        <EditOutlined className='mr-2' />
                        Change password
                    </Menu.Item>
                </>
            ) : (
                <></>
            )}
            {/* {checkPermission(PERMISSIONS.sz_u_delete) ? (
                <>
                    <Menu.Item
                        key='2'
                        onClick={() => confirmDeleteUser(record)}
                    >
                        <DeleteOutlined className='mr-2' />
                        Delete
                    </Menu.Item>
                </>
            ) : (
                <></>
            )} */}
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
            title: 'Display name',
            dataIndex: 'displayName',
            key: 'displayName',
            width: 150
        },
        {
            title: 'Childrens',
            dataIndex: 'childrens',
            key: 'childrens',
            width: 350,
            render: (text) => {
                return text.map((item, index) => (
                    <Tag color='#696cff '>{item.fullname}</Tag>
                ))
            }
        },
        {
            title: 'Devices',
            dataIndex: 'devices',
            key: 'devices',
            width: 350,
            render: (text) => {
                return text.map((item, index) => (
                    <Tag color='#03c3ec'>{item.name}</Tag>
                ))
            }
        },
        {
            title: 'Subscriptions',
            dataIndex: 'subscriptionPlans',
            key: 'subscriptionPlans',
            align: 'center',
            width: 120,
            render: (text) => {
                return <Tag color='#03c3ec'>{text?.[0]?.name}</Tag>
            }
        },
        {
            title: 'Expiration date',
            dataIndex: 'subscriptions',
            key: 'subscriptions',
            align: 'center',
            width: 180,
            render: (text) =>
                text?.[0]?.endDate
                    ? moment(text?.[0]?.endDate).format('DD/MM/YYYY HH:mm')
                    : ''
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            width: 120,
            render: (e, record: any) => {
                return (
                    <Select
                        style={{ width: '100%' }}
                        defaultValue={e}
                        onChange={(value) => typeUpdate(value, record)}
                    >
                        {Object.keys(EnumTypeAccount)
                            .filter(
                                (key: any) =>
                                    !isNaN(Number(EnumTypeAccount[key]))
                            )
                            .map((key: any) => (
                                <Option
                                    value={EnumTypeAccount[key]}
                                    key={EnumTypeAccount[key]}
                                >
                                    {key}
                                </Option>
                            ))}
                    </Select>
                )
            }
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            align: 'center',
            width: 100,
            render: (text) =>
                text ? (
                    <Tag color='#50C878' className='mr-0'>
                        Active
                    </Tag>
                ) : (
                    <Tag color='grey' className='mr-0'>
                        Inactive
                    </Tag>
                )
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

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Search',
            engine: (
                <Search
                    placeholder='By name'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Users'>
            <FilterDataWrapper
                extensionOut={
                    checkPermission(PERMISSIONS.sz_u_create)
                        ? [
                              <Button
                                  type='primary'
                                  onClick={() => addNewUser()}
                              >
                                  Add New
                              </Button>
                          ]
                        : []
                }
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={users}
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
            <AddNewUserModal
                visible={visibleModal}
                toggleModal={toggleModal}
                refetchData={refetchData}
                type={modalType}
                data={userInfo}
            />
        </Card>
    )
}
export default Users
