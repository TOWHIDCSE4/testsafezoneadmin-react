import { useEffect, useState } from 'react'
import {
    Table,
    Card,
    Button,
    Input,
    Menu,
    Dropdown,
    notification,
    Tag,
    DatePicker
} from 'antd'
import { EditOutlined, EllipsisOutlined } from '@ant-design/icons'
import { notify } from 'utils/notify'
import { MODAL_TYPE } from 'const/status'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import SubscriptionModal from './subscription-modal'
import SubscriptionAPI from 'api/SubscriptionAPI'
import moment from 'moment'
import { DATE_FORMAT } from 'const'

const { RangePicker } = DatePicker

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState({
        start_date: null,
        end_date: null
    })
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [subscriptionInfo, setSubscriptionInfo] = useState({})

    const getSubscriptions = (query: {
        page_size: number
        page_number: number
        search: any
    }) => {
        setLoading(true)
        const param = {
            page_size: query.page_size,
            page_number: query.page_number,
            start_date: query.search?.start_date,
            end_date: query.search?.end_date
        }

        SubscriptionAPI.getSubscriptions(param)
            .then((res) => {
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setSubscriptions(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const refetchData = () => {
        setPageNumber(1)
        getSubscriptions({
            page_number: 1,
            page_size: pageSize,
            search
        })
    }

    useEffect(() => {
        refetchData()
    }, [])

    const handleRangePicker = (value) => {
        if (value[0] && value[1] && value[0] < value[1]) {
            const objDate = {
                start_date: value[0],
                end_date: value[1]
            }

            setPageNumber(1)
            setSearch(objDate)
            getSubscriptions({
                page_number: 1,
                page_size: pageSize,
                search: objDate
            })
        }
    }

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getSubscriptions({
                page_number: pageNumber,
                page_size: _pageSize,
                search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getSubscriptions({
                page_number: _pageNumber,
                page_size: pageSize,
                search
            })
        }
    }

    const addNewSubscription = () => {
        setVisible(true)
        setModalType(MODAL_TYPE.ADD_NEW)
        setSubscriptionInfo({})
    }

    const editSubscription = (selected) => {
        setVisible(true)
        setModalType(MODAL_TYPE.EDIT)
        setSubscriptionInfo(selected)
    }

    const approve = (record) => {
        setLoading(true)
        const postData = {
            _id: record._id,
            active: true
        }
        SubscriptionAPI.updateSubscriptionStatus(postData)
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

    const menuActions = (record: any) => (
        <Menu>
            {checkPermission(PERMISSIONS.sz_s_edit) ? (
                <Menu.Item key='0' onClick={() => editSubscription(record)}>
                    <EditOutlined className='mr-2' />
                    Edit
                </Menu.Item>
            ) : (
                <></>
            )}
            {checkPermission(PERMISSIONS.sz_s_approve) ? (
                <Menu.Item
                    disabled={record.active}
                    key='1'
                    onClick={() => approve(record)}
                >
                    <EditOutlined className='mr-2' />
                    Approve
                </Menu.Item>
            ) : (
                <></>
            )}
        </Menu>
    )

    const displayPeriod = (value: any) => {
        switch (value) {
            case '6_MONTH':
                return '6 tháng'

            case 'YEARLY':
                return 'Hàng năm'
            default:
                return ''
        }
    }

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
            title: 'User name',
            dataIndex: 'user',
            key: 'user',
            render: (text, record, index) => text?.[0]?.displayName || ''
        },
        {
            title: 'Period',
            dataIndex: 'subscriptionPeriod',
            key: 'subscriptionPeriod',
            align: 'center',
            width: 150,
            render: (text, record, index) => displayPeriod(text)
        },
        {
            title: 'Start date',
            dataIndex: 'startDate',
            key: 'startDate',
            align: 'center',
            width: 180,
            render: (text) =>
                text ? moment(text).format('DD/MM/YYYY HH:mm') : ''
        },
        {
            title: 'End date',
            dataIndex: 'endDate',
            key: 'endDate',
            align: 'center',
            width: 180,
            render: (text) =>
                text ? moment(text).format('DD/MM/YYYY HH:mm') : ''
        },
        {
            title: 'Status',
            dataIndex: 'active',
            key: 'active',
            width: 100,
            align: 'center',
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
            title: 'Plan name',
            dataIndex: 'subscriptionPlan',
            key: 'subscriptionPlan',
            align: 'center',
            render: (text, record, index) => text?.[0]?.name || ''
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
            label: 'Date',
            engine: (
                <RangePicker
                    onChange={handleRangePicker}
                    format={DATE_FORMAT}
                    value={[search.start_date, search.end_date]}
                />
            )
        }
    ]

    return (
        <Card title='Subscriptions'>
            <FilterDataWrapper
                extensionOut={
                    checkPermission(PERMISSIONS.sz_s_create)
                        ? [
                              <Button
                                  type='primary'
                                  onClick={() => addNewSubscription()}
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
                dataSource={subscriptions}
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
            <SubscriptionModal
                visible={visibleModal}
                toggleModal={setVisible}
                refetchData={refetchData}
                type={modalType}
                data={subscriptionInfo}
            />
        </Card>
    )
}
export default Subscriptions
