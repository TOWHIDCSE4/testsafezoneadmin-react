import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { EnumTemplateAIStatus, MODAL_TYPE } from 'const/status'
import {
    Table,
    Card,
    Input,
    notification,
    Button,
    Form,
    Row,
    Col,
    Tag,
    Select,
    Space,
    Modal,
    Popover
} from 'antd'
import {
    EditOutlined,
    ReloadOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons'
import _ from 'lodash'
import { ColumnsType } from 'antd/lib/table'
import FilterDataWrapper, {
    IFilterEngine
} from 'components/filter-data-wrapper'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import { blue, red } from '@ant-design/colors'
import GenerationResultAiAPI from 'api/GenerationResultAiAPI'
import GenerationResultModal from './generation-template-result'
import moment from 'moment'
import sanitizeHtml from 'sanitize-html'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const { Search } = Input
const { Option } = Select

const GenerationResultManagement = () => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            GenerationResults: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            iShownModal: false,
            modalType: null,
            search: '',
            data_info: [],
            template_id: queryUrl.get('template_id') || ''
        }
    )

    const getAllGenerationResult = ({ page_size, page_number, search }) => {
        setValues({ isLoading: true })
        GenerationResultAiAPI.getAllGenerationResult({
            page_size,
            page_number,
            search,
            template_id: queryUrl.get('template_id') || ''
        })
            .then((res) => {
                let { total } = values
                console.log(res)
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ GenerationResults: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const removeGenerationResult = (_id: any) => {
        setValues({ isLoading: true })
        GenerationResultAiAPI.removeGenerationResult({ obj_id: _id })
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Remove successfully'
                })
                return getAllGenerationResult({ ...values })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    useEffect(() => {
        getAllGenerationResult({
            page_number: values.page_number,
            page_size: values.page_size,
            search: values.search.trim()
        })
    }, [])

    const toggleModal = (value, type?: MODAL_TYPE) => {
        setValues({
            isShownModal: value,
            modalType: type
        })
    }

    const addNew = () => {
        setValues({ isLoading: true })
        GenerationResultAiAPI.createGenerationResult({
            template_id: queryUrl.get('template_id') || ''
        })
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Add result successfully'
                })
                return getAllGenerationResult({ ...values })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const editKey = (selected) => {
        toggleModal(true, MODAL_TYPE.EDIT)
        setValues({ data_info: selected })
    }

    const refetchData = () => {
        getAllGenerationResult({ ...values })
    }

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getAllGenerationResult({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        getAllGenerationResult({
            search: val,
            page_size: values.page_size,
            page_number: 1
        })
    }

    const onChangeStatus = (val) => {
        const temp = {
            ...values,
            page_number: 1,
            status: val
        }
        setValues(temp)
        getAllGenerationResult(temp)
    }

    const removeKey = (item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove key?`,
            onOk() {
                removeGenerationResult(item.id)
            }
        })
    }

    const columns: ColumnsType = [
        {
            title: 'No',
            dataIndex: 'id',
            key: 'id',
            fixed: true,
            width: 60,
            align: 'center',
            render: (text: any, record: any, index) =>
                index + (values.page_number - 1) * values.page_size + 1
        },
        {
            title: 'Created Time',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            width: 150,
            render: (e, record: any) => {
                return e ? (
                    <div>{moment(e).format('HH:mm DD-MM-YYYY')}</div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            align: 'left',
            render: (text, record: any) => text
        },
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            width: 300,
            align: 'left',
            render: (text, record: any) => (
                <div
                    className='text-truncate'
                    dangerouslySetInnerHTML={{
                        __html: sanitize(text.substring(0, 150))
                    }}
                />
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record) => (
                <Space size='middle'>
                    {/* <ReloadOutlined
                        style={{ color: blue.primary }}
                        type='button'
                        onClick={() => reloadBalance(record)}
                    /> */}
                    {checkPermission(PERMISSIONS.ai_gr_edit) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => editKey(record)}
                        />
                    )}
                    {checkPermission(PERMISSIONS.ai_gr_delete) && (
                        <DeleteOutlined
                            style={{ color: red.primary }}
                            type='button'
                            onClick={() => removeKey(record)}
                        />
                    )}
                </Space>
            )
        }
    ]

    // const filterEngines: IFilterEngine[] = [
    //     {
    //         label: 'Search',
    //         engine: (
    //             <Search
    //                 defaultValue={values.search}
    //                 placeholder='By title'
    //                 allowClear
    //                 enterButton='Search'
    //                 onSearch={_.debounce(onSearch, 250)}
    //             />
    //         )
    //     }
    // ]

    return (
        <Card title='Quiz results'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.ai_gr_create) &&
                    queryUrl.get('template_id') ? (
                        <Button type='primary' onClick={() => addNew()}>
                            Add New
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
            ></FilterDataWrapper>

            <Table
                dataSource={values.GenerationResults}
                columns={columns}
                pagination={{
                    defaultCurrent: values.page_number,
                    pageSize: values.page_size,
                    total: values.total,
                    onChange: handleChangePagination,
                    current: values.page_number
                }}
                rowKey={(record: any) => record.id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                bordered
                loading={values.isLoading}
                sticky
            />
            <GenerationResultModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                type={values.modalType}
                data={values.data_info}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default GenerationResultManagement
