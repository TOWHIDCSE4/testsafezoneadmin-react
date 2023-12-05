import { useEffect, useState, useCallback } from 'react'
import {
    Table,
    Card,
    Button,
    Tag,
    Input,
    Select,
    Menu,
    Dropdown,
    notification,
    Modal
} from 'antd'
import {
    EditOutlined,
    DeleteOutlined,
    EllipsisOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import EmployeeModal from './employee-modal'
import AdminAPI from 'api/AdminAPI'
import { useAuth } from 'contexts/Authenticate'

const { Search } = Input

const Employees = () => {
    const { user } = useAuth()

    const [employees, setEmployees] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [roleInfo, setRoleInfo] = useState({})

    const getListEmployee = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        setLoading(true)
        AdminAPI.getListEmployee(query)
            .then((res) => {
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setEmployees(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const refetchData = () => {
        setPageNumber(1)
        getListEmployee({
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
            getListEmployee({
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
            getListEmployee({
                page_number: pageNumber,
                page_size: _pageSize,
                search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getListEmployee({
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

    const addNewEmployee = () => {
        setVisible(true)
        setModalType(MODAL_TYPE.ADD_NEW)
        setRoleInfo({})
    }

    const editEmployee = (selected) => {
        setVisible(true)
        setModalType(MODAL_TYPE.EDIT)
        setRoleInfo(selected)
    }

    const deleteEmployee = (record) => {
        setLoading(true)
        AdminAPI.deleteEmployee({ employee_id: record._id })
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

    const confirmDeleteEmployee = (record) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Bạn chắc chắn muốn xóa?`,
            onOk() {
                deleteEmployee(record)
            }
        })
    }

    const menuActions = (record: any) => (
        <Menu>
            {checkPermission(PERMISSIONS.s_e_edit) ? (
                <Menu.Item key='0' onClick={() => editEmployee(record)}>
                    <EditOutlined className='mr-2' />
                    Edit
                </Menu.Item>
            ) : (
                <></>
            )}
            {checkPermission(PERMISSIONS.s_e_delete) ? (
                <Menu.Item
                    key='1'
                    onClick={() => confirmDeleteEmployee(record)}
                >
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
            title: 'User',
            dataIndex: 'username',
            key: 'username',
            width: 150,
            render: (text, record: any) => {
                return (
                    <>
                        {record?.full_name} <br />{' '}
                        <span
                            style={{ color: '#a1acb8 ' }}
                        >{`@${record?.username}`}</span>
                    </>
                )
            }
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 250
        },
        {
            title: 'Phone number',
            dataIndex: 'phone',
            key: 'phone',
            width: 200
        },
        {
            title: 'Role',
            dataIndex: 'admin_has_roles',
            key: 'admin_has_roles',
            render: (text) => {
                return text.map((item, index) => (
                    <Tag color='#696cff '>{item?.role?.[0]?.name}</Tag>
                ))
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            width: 100,
            render: (text) =>
                text === 1 ? (
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
        <Card title='Employees'>
            <FilterDataWrapper
                extensionOut={
                    checkPermission(PERMISSIONS.s_e_create)
                        ? [
                              <Button
                                  type='primary'
                                  onClick={() => addNewEmployee()}
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
                dataSource={employees}
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
            <EmployeeModal
                visible={visibleModal}
                toggleModal={toggleModal}
                refetchData={refetchData}
                type={modalType}
                data={roleInfo}
            />
        </Card>
    )
}
export default Employees
