import { useEffect, useState, useCallback } from 'react'
import {
    Table,
    Card,
    Button,
    Input,
    Menu,
    Dropdown,
    notification,
    Modal,
    Tag,
    Select
} from 'antd'
import {
    EditOutlined,
    EllipsisOutlined,
    DeleteOutlined,
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
import SubscriptionPlanModal from './subscription-plan-modal'
import SubscriptionPlanAPI from 'api/SubscriptionPlanAPI'
import { EnumTypePlan } from 'const'

const { Search } = Input
const { Option } = Select

const SubscriptionPlans = () => {
    const [subscriptionPlans, setSubscriptionPlans] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [planInfo, setPlanInfo] = useState({})

    const getSubscriptionPlans = (query: {
        page_size: number
        page_number: number
        search?: string
    }) => {
        setLoading(true)
        SubscriptionPlanAPI.getSubscriptionPlans(query)
            .then((res) => {
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setSubscriptionPlans(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const refetchData = () => {
        setPageNumber(1)
        getSubscriptionPlans({
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
            getSubscriptionPlans({
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
            getSubscriptionPlans({
                page_number: pageNumber,
                page_size: _pageSize,
                search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getSubscriptionPlans({
                page_number: _pageNumber,
                page_size: pageSize,
                search
            })
        }
    }

    const addNewPlan = () => {
        setVisible(true)
        setModalType(MODAL_TYPE.ADD_NEW)
        setPlanInfo({})
    }

    const editPlan = (selected) => {
        setVisible(true)
        setModalType(MODAL_TYPE.EDIT)
        setPlanInfo(selected)
    }

    const deletePlan = (record) => {
        setLoading(true)
        SubscriptionPlanAPI.deletePlan({ plan_id: record.id })
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

    const confirmDeletePlan = (record) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Bạn chắc chắn muốn xóa?`,
            onOk() {
                deletePlan(record)
            }
        })
    }

    const menuActions = (record: any) => (
        <Menu>
            {checkPermission(PERMISSIONS.sz_sp_edit) ? (
                <Menu.Item key='0' onClick={() => editPlan(record)}>
                    <EditOutlined className='mr-2' />
                    Edit
                </Menu.Item>
            ) : (
                <></>
            )}
            {checkPermission(PERMISSIONS.sz_sp_delete) ? (
                <Menu.Item key='1' onClick={() => confirmDeletePlan(record)}>
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
            key: 'name',
            width: 150
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            width: 150
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            width: 120,
            render: (val, record: any) => EnumTypePlan[Number(val)]
        },
        {
            title: 'Total Use Days',
            dataIndex: 'totalUseDays',
            key: 'totalUseDays',
            align: 'center',
            width: 150
        },
        {
            title: 'Total Devices',
            dataIndex: 'totalDevices',
            key: 'totalDevices',
            align: 'center',
            width: 150
        },
        {
            title: 'Yearly Price',
            dataIndex: 'yearlyPrice',
            key: 'yearlyPrice',
            align: 'center'
        },
        {
            title: 'Monthly Price',
            dataIndex: 'monthlyPrice',
            key: 'monthlyPrice',
            align: 'center'
        },
        {
            title: 'Is Free',
            dataIndex: 'isFree',
            key: 'isFree',
            align: 'center',
            width: 100,
            render: (text) =>
                text ? (
                    <Tag color='#50C878' className='mr-0'>
                        Yes
                    </Tag>
                ) : (
                    <Tag color='grey' className='mr-0'>
                        No
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
        <Card title='Subscription Plans'>
            <FilterDataWrapper
                extensionOut={
                    checkPermission(PERMISSIONS.sz_sp_create)
                        ? [
                              <Button
                                  type='primary'
                                  onClick={() => addNewPlan()}
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
                dataSource={subscriptionPlans}
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
            <SubscriptionPlanModal
                visible={visibleModal}
                toggleModal={setVisible}
                refetchData={refetchData}
                type={modalType}
                data={planInfo}
            />
        </Card>
    )
}
export default SubscriptionPlans
