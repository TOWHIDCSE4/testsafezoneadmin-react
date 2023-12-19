import { useEffect, useState, useCallback } from 'react'
import { Table, Card, Button, Input, Menu, Dropdown, notification } from 'antd'
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
import ParentSettingApi from 'api/ParentSettingApi'
import AddNewTimeModal from './add-new-time-modal'

const { Search } = Input

const ParentsSettingTime = () => {
    const [settingTime, setSettingTime] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState({
        search: null
    })
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [timeInfo, setTimeInfo] = useState({})

    const getSettingTime = (query: {
        page_size: number
        page_number: number
        search: any
    }) => {
        setLoading(true)
        const param = {
            page_size: query.page_size,
            page_number: query.page_number,
            search: query.search?.search
        }

        ParentSettingApi.getAllSettings(param)
            .then((res) => {
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setSettingTime(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const refetchData = () => {
        setPageNumber(1)
        getSettingTime({
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
            const searchVal = {
                search: value
            }
            setSearch(searchVal)
            getSettingTime({
                search: searchVal,
                page_number: 1,
                page_size: pageSize
            })
        },
        [search, pageSize, pageNumber]
    )

    const handleChangePagination = (_pageNumber, _pageSize) => {
        if (pageSize !== _pageSize) {
            setPageSize(_pageSize)
            getSettingTime({
                page_number: pageNumber,
                page_size: _pageSize,
                search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getSettingTime({
                page_number: _pageNumber,
                page_size: pageSize,
                search
            })
        }
    }

    const addNewTime = () => {
        setVisible(true)
        setModalType(MODAL_TYPE.ADD_NEW)
        setTimeInfo({})
    }

    const editTime = (selected) => {
        setVisible(true)
        setModalType(MODAL_TYPE.EDIT)
        setTimeInfo(selected)
    }

    const deleteTime = (record) => {
        setLoading(true)
        const postData = {
            parent_setting_id: record._id
        }
        ParentSettingApi.deleteSetting(postData)
            .then((data) => {
                refetchData()
                notification.success({
                    message: 'Đã xóa tên miền thành công'
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
            <Menu.Item key='0' onClick={() => editTime(record)}>
                <EditOutlined className='mr-2' />
                Edit
            </Menu.Item>
            <Menu.Item
                disabled={record.active}
                key='1'
                onClick={() => deleteTime(record)}
            >
                <EditOutlined className='mr-2' />
                Delete
            </Menu.Item>
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
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            render: (text) => text
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            align: 'center',
            render: (text) => text
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
                    placeholder='By subject'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Time Setting'>
            <FilterDataWrapper
                extensionOut={
                    checkPermission(PERMISSIONS.sz_s_create)
                        ? [
                              <Button
                                  type='primary'
                                  onClick={() => addNewTime()}
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
                dataSource={settingTime}
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
            <AddNewTimeModal
                visible={visibleModal}
                toggleModal={setVisible}
                refetchData={refetchData}
                type={modalType}
                data={timeInfo}
            />
        </Card>
    )
}
export default ParentsSettingTime
