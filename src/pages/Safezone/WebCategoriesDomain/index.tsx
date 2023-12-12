import { useEffect, useState, useCallback } from 'react'
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
import CategoryDomainAPI from 'api/CategoryDomainAPI'
import moment from 'moment'
import AddNewHostModal from './add-new-host'

const { Search } = Input

const WebCategoriesDomain = () => {
    const [domains, setDomains] = useState([])
    const [isLoading, setLoading] = useState(false)
    const [search, setSearch] = useState({
        search: null
    })
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState(null)
    const [domainInfo, setDomainInfo] = useState({})

    const getDomains = (query: {
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

        CategoryDomainAPI.getDomains(param)
            .then((res) => {
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setDomains(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    const refetchData = () => {
        setPageNumber(1)
        getDomains({
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
            getDomains({
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
            getDomains({
                page_number: pageNumber,
                page_size: _pageSize,
                search
            })
        } else if (pageNumber !== _pageNumber) {
            setPageNumber(_pageNumber)
            getDomains({
                page_number: _pageNumber,
                page_size: pageSize,
                search
            })
        }
    }

    const addNewWebCategory = () => {
        setVisible(true)
        setModalType(MODAL_TYPE.ADD_NEW)
        setDomainInfo({})
    }

    const editDomain = (selected) => {
        setVisible(true)
        setModalType(MODAL_TYPE.EDIT)
        setDomainInfo(selected)
    }

    const deleteDomain = (record) => {
        setLoading(true)
        const postData = {
            category_domain_id: record._id
        }
        CategoryDomainAPI.deleteDomain(postData)
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
            <Menu.Item key='0' onClick={() => editDomain(record)}>
                <EditOutlined className='mr-2' />
                Edit
            </Menu.Item>
            <Menu.Item
                disabled={record.active}
                key='1'
                onClick={() => deleteDomain(record)}
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
            title: 'Host',
            dataIndex: 'host',
            key: 'host',
            render: (text) => text
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            align: 'center',
            render: (text, record, index) => text?.[0]?.name || ''
        },
        {
            title: 'Description',
            dataIndex: 'category',
            key: 'category',
            align: 'center',
            render: (text, record, index) => text?.[0]?.description || ''
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
                    placeholder='By host or category'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Web Categories'>
            <FilterDataWrapper
                extensionOut={
                    checkPermission(PERMISSIONS.sz_s_create)
                        ? [
                              <Button
                                  type='primary'
                                  onClick={() => addNewWebCategory()}
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
                dataSource={domains}
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
            <AddNewHostModal
                visible={visibleModal}
                toggleModal={setVisible}
                refetchData={refetchData}
                type={modalType}
                data={domainInfo}
            />
        </Card>
    )
}
export default WebCategoriesDomain
