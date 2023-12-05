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
    Spin
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
import PromptAPI from 'api/PromptAiAPI'
// eslint-disable-next-line import/extensions
import TemplateGenerateModal from '../GenerationTemplate/generation-template-modal'
import PromptTemplateModal from './prompt-modal'
import PromptParamAiAPI from 'api/PromptParamAiAPI'
import { EnumTypeParamAI } from 'const/ai-template'

const { Search } = Input
const { Option } = Select

const PromptTemplateManagement = () => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            PromptTemplates: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            iShownModal: false,
            modalType: null,
            status: '',
            search: '',
            category: '',
            prompt_template_info: [],
            iShownGenerateModal: false
        }
    )

    const [valueCategory, setValueCategory] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            categories: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTemplateAIStatus.ACTIVE,
            search: ''
        }
    )

    const getAllPromptTemplate = ({
        page_size,
        page_number,
        search,
        status,
        category
    }) => {
        setValues({ isLoading: true })
        PromptAPI.getAllPromptTemplate({
            page_size,
            page_number,
            search,
            status,
            category
        })
            .then((res) => {
                let { total } = values
                if (res.pagination && res.pagination.total >= 0) {
                    total = res.pagination.total
                }
                setValues({ PromptTemplates: res.data, total })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const removePromptTemplate = (_id: any) => {
        setValues({ isLoading: true })
        PromptAPI.removePromptTemplate({ obj_id: _id })
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Remove successfully'
                })
                return getAllPromptTemplate({ ...values })
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoading: false }))
    }

    const getCategory = useCallback(
        (query: {
            page_size?: number
            page_number?: number
            search?: string
        }) => {
            setValueCategory({ isLoading: true })
            const { categories } = valueCategory
            PromptParamAiAPI.getAllPromptParams({
                status: EnumTemplateAIStatus.ACTIVE,
                type: EnumTypeParamAI.CATEGORY,
                search: query.search,
                page_number: query.page_number,
                page_size: query.page_size
            })
                .then((res) => {
                    let newCategory = [...res.data]
                    if (query.page_number > 1) {
                        newCategory = [...categories, ...res.data]
                    }
                    setValueCategory({
                        categories: newCategory,
                        total: res.pagination.total
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValueCategory({ isLoading: false }))
        },
        [valueCategory]
    )

    useEffect(() => {
        getAllPromptTemplate({
            page_number: values.page_number,
            page_size: values.page_size,
            search: values.search.trim(),
            status: values.status,
            category: values.category
        })
        getCategory({
            page_number: valueCategory.page_number,
            page_size: valueCategory.page_size,
            search: valueCategory.search
        })
    }, [])

    const toggleModal = (value, type?: MODAL_TYPE) => {
        setValues({
            isShownModal: value,
            modalType: type
        })
    }

    const toggleGenerateModal = (value) => {
        setValues({
            iShownGenerateModal: value
        })
    }

    const editKey = (selected) => {
        toggleModal(true, MODAL_TYPE.EDIT)
        setValues({ prompt_template_info: selected })
    }

    const GenerateTemplate = (selected) => {
        toggleGenerateModal(true)
        setValues({ prompt_template_info: selected })
    }

    const refetchData = () => {
        getAllPromptTemplate({ ...values })
    }

    const onChangeCategory = useCallback(
        (value: any) => {
            getAllPromptTemplate({ ...values, category: value })
            setValues({ ...values, category: value })
        },
        [values]
    )

    const renderCategories = () => {
        if (valueCategory?.categories) {
            return valueCategory?.categories.map((item: any, index) => (
                <Option key={`s${item.id}`} value={item.id}>
                    {`${item.title} `}
                </Option>
            ))
        }
        return <></>
    }

    const onSearchCategory = (value: any) => {
        setValueCategory({
            page_number: 1,
            search: value
        })
        getCategory({
            page_number: 1,
            page_size: valueCategory.page_size,
            search: value
        })
    }

    const loadMoreCategory = (event) => {
        const { target } = event
        if (
            !valueCategory.isLoading &&
            target.scrollTop + target.offsetHeight === target.scrollHeight
        ) {
            const { total, page_size, page_number } = valueCategory
            if (total > page_size * page_number) {
                const newPageNumber = valueCategory.page_number + 1
                setValueCategory({ page_number: newPageNumber })
                getCategory({
                    page_number: newPageNumber,
                    page_size: valueCategory.page_size,
                    search: valueCategory.search
                })
            }
        }
    }

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getAllPromptTemplate({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const handleFilter = (e) => {
        e.preventDefault()
        getAllPromptTemplate({ ...values })
    }

    const onSearch = (val) => {
        setValues({
            search: val,
            page_number: 1
        })
        getAllPromptTemplate({
            search: val,
            page_size: values.page_size,
            page_number: 1,
            status: values.status,
            category: values.category
        })
    }

    const onChangeStatus = (val) => {
        const temp = {
            ...values,
            page_number: 1,
            status: val
        }
        setValues(temp)
        getAllPromptTemplate(temp)
    }

    const removeKey = (item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove prompt template?`,
            onOk() {
                removePromptTemplate(item.id)
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
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 300,
            align: 'center',
            render: (text, record: any) => text && text?.title
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
            title: 'Template generate',
            dataIndex: 'id',
            key: 'template generate',
            width: 120,
            align: 'center',
            render: (text, record) => (
                <>
                    {checkPermission(PERMISSIONS.ai_gt_create) && (
                        <Button
                            type='primary'
                            onClick={() => GenerateTemplate(record)}
                        >
                            Generate
                        </Button>
                    )}
                </>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            align: 'center',
            render: (text, record) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.ai_pm_edit) && (
                        <EditOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => editKey(record)}
                        />
                    )}
                    {checkPermission(PERMISSIONS.ai_pm_delete) && (
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
            label: 'Category',
            engine: (
                <Select
                    placeholder='Choose category'
                    showSearch
                    autoClearSearchValue
                    filterOption={false}
                    loading={valueCategory.isLoading}
                    onPopupScroll={loadMoreCategory}
                    onSearch={_.debounce(onSearchCategory, 300)}
                    onChange={onChangeCategory}
                >
                    {renderCategories()}
                    {valueCategory.isLoading && (
                        <Option key='loading_course' value=''>
                            <Spin size='small' />
                        </Option>
                    )}
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
        <Card title='Prompt Management'>
            <FilterDataWrapper
                extensionOut={[
                    checkPermission(PERMISSIONS.ai_pm_create) ? (
                        <Button
                            type='primary'
                            onClick={() =>
                                toggleModal(true, MODAL_TYPE.ADD_NEW)
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
            <Table
                dataSource={values.PromptTemplates}
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
            <PromptTemplateModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                type={values.modalType}
                data={values.prompt_template_info}
                refetchData={refetchData}
            />

            <TemplateGenerateModal
                visible={values.iShownGenerateModal}
                toggleModal={toggleGenerateModal}
                data={values.prompt_template_info}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default PromptTemplateManagement
