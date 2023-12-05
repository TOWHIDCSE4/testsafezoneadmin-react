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
    Spin,
    Row,
    Col,
    Popover,
    Collapse,
    Form,
    InputNumber,
    Switch
} from 'antd'
import {
    EyeOutlined,
    SettingTwoTone,
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
import DebounceSelect from 'core/Atoms/DebounceSelect'
import GenerationTemplateAPI from 'api/GenerationTemplateAiAPI'
import PromptParamAiAPI from 'api/PromptParamAiAPI'
import UserAPI from 'api/UserAPI'
import moment from 'moment'
import { EnumTypeParamAI } from 'const/ai-template'
import { notify } from 'utils/notify'
import SettingJobModal from './setting-job-modal'

const { Search } = Input
const { Option } = Select
const { Panel } = Collapse

const AIReportGenerate = () => {
    const [form] = Form.useForm()
    const queryUrl = new URLSearchParams(window.location.search)
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            PromptTemplates: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            iShownModal: false,
            modalType: MODAL_TYPE.ADD_NEW,
            status: EnumTemplateAIStatus.ACTIVE,
            prompt_template_info: [],
            objectSearch: {
                title: '',
                prompt_name: '',
                age: null,
                category: '',
                subject: '',
                rank: ''
            }
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

    const [valueSubject, setValueSubject] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTemplateAIStatus.ACTIVE,
            search: ''
        }
    )

    const [valueRank, setValueRank] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            status: EnumTemplateAIStatus.ACTIVE,
            search: ''
        }
    )

    const getAllGenerationTemplate = ({
        page_size,
        page_number,
        objectSearch
    }) => {
        setValues({ isLoading: true })
        const searchData = {
            page_size,
            page_number,
            title: objectSearch.title,
            prompt_name: objectSearch.prompt_name,
            age: objectSearch.age,
            category: objectSearch.category,
            subject: objectSearch.subject,
            rank: objectSearch.rank
        }
        GenerationTemplateAPI.getAllGenerationTemplate(searchData)
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
        GenerationTemplateAPI.removeGenerationTemplate(_id)
            .then((res) => {
                notification.success({
                    message: 'Success',
                    description: 'Remove successfully'
                })
                return getAllGenerationTemplate({ ...values })
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

    const getSubject = useCallback(
        async (query: {
            page_size?: number
            page_number?: number
            search?: string
            typeGet?: string
        }) => {
            setValueSubject({ isLoading: true })
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const { data } = valueSubject
            await PromptParamAiAPI.getAllPromptParams({
                status: EnumTemplateAIStatus.ACTIVE,
                type: EnumTypeParamAI.SUBJECT,
                search: query.search,
                page_number: query.page_number,
                page_size: query.page_size
            })
                .then((res) => {
                    let newData = [...res.data]
                    if (query.page_number > 1) {
                        newData = [...data, ...res.data]
                    }
                    setValueSubject({
                        data: newData,
                        total: res.pagination.total
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValueSubject({ isLoading: false }))
        },
        [valueCategory]
    )
    const getRank = useCallback(
        async (query: {
            page_size?: number
            page_number?: number
            search?: string
            typeGet?: string
        }) => {
            setValueRank({ isLoading: true })
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const { data } = valueRank
            await PromptParamAiAPI.getAllPromptParams({
                status: EnumTemplateAIStatus.ACTIVE,
                type: EnumTypeParamAI.RANK,
                search: query.search,
                page_number: query.page_number,
                page_size: query.page_size
            })
                .then((res) => {
                    let newData = [...res.data]
                    if (query.page_number > 1) {
                        newData = [...data, ...res.data]
                    }
                    setValueRank({
                        data: newData,
                        total: res.pagination.total
                    })
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValueRank({ isLoading: false }))
        },
        [valueCategory]
    )

    useEffect(() => {
        getAllGenerationTemplate({
            ...values
        })
        getCategory({
            ...valueCategory
        })
        getSubject({
            ...valueSubject
        })
        getRank({
            ...valueRank
        })
    }, [])

    const toggleModal = (value, item?: any) => {
        setValues({
            isShownModal: value,
            prompt_template_info: item
        })
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

    const onSearchSubject = (value: any) => {
        setValueSubject({
            page_number: 1,
            search: value
        })
        getSubject({
            page_number: 1,
            page_size: valueSubject.page_size,
            search: value
        })
    }

    const onSearchRank = (value: any) => {
        setValueRank({
            page_number: 1,
            search: value
        })
        getRank({
            page_number: 1,
            page_size: valueRank.page_size,
            search: value
        })
    }

    const loadMoreParam = (key) => (event) => {
        const { target } = event
        switch (key) {
            case 'category':
                if (
                    !valueCategory.isLoading &&
                    target.scrollTop + target.offsetHeight ===
                        target.scrollHeight
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
                break
            case 'subject':
                if (
                    !valueSubject.isLoading &&
                    target.scrollTop + target.offsetHeight ===
                        target.scrollHeight
                ) {
                    const { total, page_size, page_number } = valueSubject
                    if (total > page_size * page_number) {
                        const newPageNumber = valueSubject.page_number + 1
                        setValueSubject({ page_number: newPageNumber })
                        getSubject({
                            page_number: newPageNumber,
                            page_size: valueSubject.page_size,
                            search: valueSubject.search
                        })
                    }
                }
                break
            case 'rank':
                if (
                    !valueRank.isLoading &&
                    target.scrollTop + target.offsetHeight ===
                        target.scrollHeight
                ) {
                    const { total, page_size, page_number } = valueRank
                    if (total > page_size * page_number) {
                        const newPageNumber = valueRank.page_number + 1
                        setValueRank({ page_number: newPageNumber })
                        getRank({
                            page_number: newPageNumber,
                            page_size: valueRank.page_size,
                            search: valueRank.search
                        })
                    }
                }
                break
            default:
        }
    }

    const refetchData = () => {
        getAllGenerationTemplate({ ...values })
    }

    const renderParam = (typeParam: any) => {
        switch (typeParam) {
            case 'category':
                if (valueCategory?.data) {
                    return valueCategory?.data.map((item: any, index) => (
                        <Option key={`s${item.id}`} value={item.id}>
                            {`${item.title} `}
                        </Option>
                    ))
                }
                return <div></div>
            case 'subject':
                if (valueSubject?.data) {
                    return valueSubject?.data.map((item: any, index) => (
                        <Option key={`s${item.id}`} value={item.id}>
                            {`${item.title} `}
                        </Option>
                    ))
                }
                return <div></div>
            case 'rank':
                if (valueRank?.data) {
                    return valueRank?.data.map((item: any, index) => (
                        <Option key={`s${item.id}`} value={item.id}>
                            {`${item.title} `}
                        </Option>
                    ))
                }
                return <div></div>
            default:
                return <div></div>
        }
    }

    const updateTemplate = useCallback(
        (type, value, item) => {
            setValues({ isLoading: true })
            const dataUpdate: any = {
                obj_id: item._id
            }
            if (type === 'status') {
                dataUpdate.is_active = value
            }
            GenerationTemplateAPI.editGenerationTemplate(dataUpdate)
                .then((res) => {
                    notify('success', 'Update template successfully')
                    refetchData()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setValues({ isLoading: false }))
        },
        [values]
    )

    const handleChangePagination = (pageNumber, pageSize) => {
        setValues({ page_number: pageNumber, page_size: pageSize })
        getAllGenerationTemplate({
            ...values,
            page_number: pageNumber,
            page_size: pageSize
        })
    }

    const onSearch = (valuesForm: any) => {
        setValues({
            page_number: 1,
            objectSearch: { ...values.objectSearch, ...valuesForm }
        })
        getAllGenerationTemplate({
            page_size: values.page_size,
            page_number: 1,
            objectSearch: valuesForm
        })
    }

    const removeKey = (item) => {
        Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure to remove prompt template?`,
            onOk() {
                removePromptTemplate(item._id)
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
            title: 'Time',
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
            align: 'center',
            render: (val) => val
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            align: 'center',
            render: (val) => val?.title
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject',
            width: 120,
            align: 'center',
            render: (val) => val?.title
        },
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            width: 120,
            align: 'center',
            render: (val) => val?.title
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            width: 80,
            align: 'center',
            render: (val) => val
        },
        {
            title: 'Template',
            dataIndex: 'content',
            key: 'content',
            width: 250,
            align: 'left',
            render: (e, record: any) => {
                return e && e.length > 30 ? (
                    <Popover content={e}>
                        <a>
                            <div className='text-truncate'>{e}</div>
                        </a>
                    </Popover>
                ) : e && e.length <= 30 ? (
                    <div className='text-truncate'>{e}</div>
                ) : (
                    <></>
                )
            }
        },
        {
            title: 'Status',
            dataIndex: 'is_active',
            key: 'is_active',
            align: 'center',
            fixed: 'right',
            width: 150,
            render: (e, record: any) => {
                return (
                    <Select
                        defaultValue={e}
                        style={{
                            width: '100%',
                            color: e ? '#52C41A' : '#FF0D0D'
                        }}
                        onChange={(value) =>
                            updateTemplate('status', value, record)
                        }
                    >
                        <Option value={true} style={{ color: '#52C41A' }}>
                            ACTIVE
                        </Option>
                        <Option value={false} style={{ color: '#FF0D0D' }}>
                            INACTIVE
                        </Option>
                    </Select>
                )
            }
        },
        {
            title: 'Job frequency',
            dataIndex: 'job_frequency',
            key: 'job_frequency',
            align: 'center',
            width: 150,
            fixed: 'right',
            render: (e, record: any) => {
                return e !== undefined && record.job_is_active === true ? (
                    <div>{e} giờ</div>
                ) : (
                    <div>None</div>
                )
            }
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            align: 'center',
            render: (text, record: any) => (
                <Space size='middle'>
                    {checkPermission(PERMISSIONS.ai_gr_view) && (
                        <EyeOutlined
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() =>
                                window.open(
                                    `/admin/generation-result?template_id=${record?._id}`,
                                    '_blank'
                                )
                            }
                        />
                    )}
                    {checkPermission(PERMISSIONS.ai_gt_edit) && (
                        <SettingTwoTone
                            style={{ color: blue.primary }}
                            type='button'
                            onClick={() => toggleModal(true, record)}
                        />
                    )}
                    {checkPermission(PERMISSIONS.ai_gt_delete) && (
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

    return (
        <Card title='Quiz Templates'>
            <Collapse className='mb-4' defaultActiveKey={['1']}>
                <Panel header='Filter' key='1'>
                    <Form
                        name='basic'
                        layout='vertical'
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 22 }}
                        form={form}
                        onFinish={onSearch}
                    >
                        <Row className='mb-4 justify-content-start' gutter={10}>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Title:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='title'
                                            className='mb-0 w-100'
                                        >
                                            <Input></Input>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Prompt name:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='prompt_name'
                                            className='mb-0 w-100'
                                        >
                                            <Input></Input>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Age:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='age'
                                            className='mb-0 w-100'
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={3}
                                                max={100}
                                            ></InputNumber>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Category:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='category'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                placeholder='Choose category'
                                                defaultValue={
                                                    values.objectSearch.category
                                                }
                                                showSearch
                                                autoClearSearchValue
                                                filterOption={false}
                                                loading={
                                                    valueCategory.isLoading
                                                }
                                                onPopupScroll={loadMoreParam(
                                                    'category'
                                                )}
                                                onSearch={_.debounce(
                                                    onSearchCategory,
                                                    300
                                                )}
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                {renderParam('category')}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Subject:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='subject'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                placeholder='Choose subject'
                                                showSearch
                                                defaultValue={
                                                    values.objectSearch.subject
                                                }
                                                autoClearSearchValue
                                                filterOption={false}
                                                loading={valueSubject.isLoading}
                                                onPopupScroll={loadMoreParam(
                                                    'subject'
                                                )}
                                                onSearch={_.debounce(
                                                    onSearchSubject,
                                                    300
                                                )}
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                {renderParam('subject')}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                            <Col
                                className='d-flex align-items-center mb-2'
                                span={8}
                            >
                                <Row className='w-100 d-flex align-items-center'>
                                    <Col span={8}>Rank:</Col>
                                    <Col span={16}>
                                        <Form.Item
                                            name='rank'
                                            className='mb-0 w-100'
                                        >
                                            <Select
                                                placeholder='Choose rank'
                                                showSearch
                                                defaultValue={
                                                    values.objectSearch.rank
                                                }
                                                autoClearSearchValue
                                                filterOption={false}
                                                loading={valueRank.isLoading}
                                                onPopupScroll={loadMoreParam(
                                                    'rank'
                                                )}
                                                onSearch={_.debounce(
                                                    onSearchRank,
                                                    300
                                                )}
                                            >
                                                <Option key='-1' value=''>
                                                    All
                                                </Option>
                                                {renderParam('rank')}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row className='justify-content-end' gutter={10}>
                            <Col>
                                <Button type='primary' htmlType='submit'>
                                    Search
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Panel>
            </Collapse>
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
                rowKey={(record: any) => record._id}
                scroll={{
                    x: 500,
                    y: 768
                }}
                bordered
                loading={values.isLoading}
                sticky
            />

            <SettingJobModal
                visible={values.isShownModal}
                toggleModal={toggleModal}
                dataTemplate={values.prompt_template_info}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default AIReportGenerate
