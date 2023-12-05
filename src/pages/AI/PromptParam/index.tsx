import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { EnumTemplateAIStatus, MODAL_TYPE } from 'const/status'
import {
    Table,
    Card,
    Input,
    notification,
    Button,
    Tag,
    Select,
    Space,
    Modal,
    Tabs
} from 'antd'
import {
    EditOutlined,
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
import PromptParamAiAPI from 'api/PromptParamAiAPI'
import PromptParamModal from './prompt-param-modal'
import { EnumTypeParamAI } from 'const/ai-template'

const { Search } = Input
const { Option } = Select
const { TabPane } = Tabs

const PromptParamManagement = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            PromptParams: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            iShownModal: false,
            modalType: null,
            status: '',
            search: '',
            prompt_param_info: [],
            type: EnumTypeParamAI.CATEGORY
        }
    )

    const getAllPromptParam = ({
        page_size,
        page_number,
        type,
        search,
        status
    }) => {
        setValues({ isLoading: true })
        PromptParamAiAPI.getAllPromptParams({
            page_size,
            page_number,
            type,
            search,
            status
        })
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ PromptParams: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const removePromptParam = (_id: any) => {
        setValues({ isLoading: true })
        PromptParamAiAPI.removePromptParam({ obj_id: _id })
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Remove successfully'
                })
                return getAllPromptParam({ ...values })
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
        getAllPromptParam({
            ...values,
            type: EnumTypeParamAI.CATEGORY,
            search: values.search.trim()
        })
    }, [])

    const toggleModal = (value, type?: MODAL_TYPE, data?: any) => {
        setValues({
            isShownModal: value,
            modalType: type
        })
        if (data) {
            setValues({
                prompt_param_info: data
            })
        }
    }

    const editKey = (selected) => {
        toggleModal(true, MODAL_TYPE.EDIT)
        setValues({ prompt_param_info: selected })
    }

    const refetchData = () => {
        getAllPromptParam({ ...values })
    }

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getAllPromptParam({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const handleFilter = (e) => {
        e.preventDefault()
        getAllPromptParam({ ...values })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        getAllPromptParam({
            search: val,
            page_size: values.page_size,
            page_number: 1,
            type: values.type,
            status: values.status
        })
    }

    const onChangeStatus = (val) => {
        const temp = {
            ...values,
            page_number: 1,
            status: val
        }
        setValues(temp)
        getAllPromptParam(temp)
    }

    const onChangeTab = useCallback(
        (key) => {
            values.type = Number(key)
            setValues({ type: Number(key) })
            getAllPromptParam({
                ...values,
                page_number: 1,
                type: Number(key)
            })
        },
        [values]
    )

    const removeKey = (item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove Prompt Category?`,
            onOk() {
                removePromptParam(item.id)
            }
        })
    }

    const columns: ColumnsType = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            fixed: true,
            width: 180,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            align: 'center',
            render: (text, record: any) => text
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 120,
            align: 'center',
            render: (text) => (
                <Tag color={text ? 'success' : 'warning'}>
                    {text ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'center',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.ai_pp_edit) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => editKey(record)}
                        />
                    )}
                    {checkPermission(PERMISSIONS.ai_pp_delete) && (
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

    const renderTable = (type: any) => (
        <Table
            dataSource={values.PromptParams}
            columns={columns}
            pagination={{
                showTotal: (totalData, range) => (
                    <div>
                        Showing {range[0]}-{range[1]} of {totalData}
                    </div>
                ),
                showSizeChanger: true,
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
    )

    const renderTab = () => (
        <>
            <Tabs
                defaultActiveKey={`${values.type}`}
                activeKey={`${values.type}`}
                type='card'
                onChange={onChangeTab}
            >
                <TabPane tab='Category' key={EnumTypeParamAI.CATEGORY}>
                    {renderTable(EnumTypeParamAI.CATEGORY)}
                </TabPane>
                <TabPane tab='Subject' key={EnumTypeParamAI.SUBJECT}>
                    {renderTable(EnumTypeParamAI.SUBJECT)}
                </TabPane>
                <TabPane tab='Rank' key={EnumTypeParamAI.RANK}>
                    {renderTable(EnumTypeParamAI.RANK)}
                </TabPane>
            </Tabs>
        </>
    )

    const filterEngines: IFilterEngine[] = [
        {
            label: 'Status',
            engine: (
                <Select
                    allowClear
                    showArrow
                    style={{ width: '100%' }}
                    placeholder='Filter by status'
                    value={values.status}
                    onChange={onChangeStatus}
                >
                    {Object.keys(EnumTemplateAIStatus).map((key: any) => (
                        <Option
                            value={EnumTemplateAIStatus[key]}
                            key={EnumTemplateAIStatus[key]}
                        >
                            {_.upperCase(_.startCase(key))}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            label: 'Search',
            engine: (
                <Search
                    defaultValue={values.search}
                    placeholder='By title'
                    allowClear
                    enterButton='Search'
                    onSearch={_.debounce(onSearch, 250)}
                />
            )
        }
    ]

    return (
        <Card title='Prompt Param Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.ai_pp_create) ? (
                        <Button
                            type='primary'
                            onClick={() =>
                                toggleModal(true, MODAL_TYPE.ADD_NEW, {
                                    type: values.type
                                })
                            }
                        >
                            Add New
                        </Button>
                    ) : (
                        <></>
                    )
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>
            {renderTab()}
            <PromptParamModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                type={values.modalType}
                data={values.prompt_param_info}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default PromptParamManagement
