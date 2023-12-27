import { useEffect, useState, useCallback } from 'react'
import {
    Table,
    Row,
    Col,
    Menu,
    Card,
    Dropdown,
    Button,
    Tag,
    Image,
    Select,
    Input
} from 'antd'
import { EditOutlined, EllipsisOutlined } from '@ant-design/icons'
import { blue, red } from '@ant-design/colors'
import QuestionAPI from 'api/QuestionAPI'
import { notify } from 'utils/notify'
import { IQuestion, EnumQuestionType } from 'types/IQuestion'
import { EnumQuizLevel } from 'types/IQuiz'
import { MODAL_TYPE } from 'const'
import { ColumnsType } from 'antd/lib/table'
import _, { debounce } from 'lodash'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import ReactAudioPlayer from 'react-audio-player'
import sanitizeHtml from 'sanitize-html'
import FilterDataWrapper from 'components/filter-data-wrapper'
import QuestionModal from './modals/QuestionModal'
import QuestionGenerationModal from './Question-generation-modal'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const { Search } = Input

export enum EnumSearchType {
    REGULAR = 1,
    MULTI_ANSWERS = 2
}

const Questions = ({ ...props }) => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [questions, setQuestions] = useState<IQuestion[]>([])
    const [loading, setLoading] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const [pageNumber, setPageNumber] = useState(1)
    const [total, setTotal] = useState(0)
    const [visibleModal, setVisible] = useState(false)
    const [modalType, setModalType] = useState<MODAL_TYPE>(null)
    const [selectedItem, setSelectedItem] = useState<IQuestion>(null)
    const [filterQuestionType, setFilterQuestionType] = useState(0)
    const [searchString, setSearchString] = useState('')
    const [orderBy, setOrderBy] = useState<string>('created_time')
    const [typeSearch, setTypeSearch] = useState(EnumSearchType.REGULAR)
    const [idSearch, setIdSearch] = useState(queryUrl.get('id') || null)

    const getQuestions = (query: {
        page_size: number
        page_number: number
        search?: string
        question_type?: number
        idSearch?: any
    }) => {
        setLoading(true)
        if (idSearch && !query.search && !query.question_type) {
            query.idSearch = idSearch
        }
        QuestionAPI.getLibraryQuestions(query)
            .then((res) => {
                if (res.pagination && res.pagination.total >= 0) {
                    setTotal(res.pagination.total)
                }
                setQuestions(res.data)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    // const getQuestionsWidthMultipleAnswers = (query: {
    //     page_size: number
    //     page_number: number
    //     search?: string
    // }) => {
    //     setLoading(true)
    //     QuestionAPI.getQuestionsWidthMultipleAnswers(query)
    //         .then((res) => {
    //             if (res.pagination && res.pagination.total >= 0) {
    //                 setTotal(res.pagination.total)
    //             }
    //             setQuestions(res.data)
    //         })
    //         .catch((err) => {
    //             notify('error', err.message)
    //         })
    //         .finally(() => setLoading(false))
    // }

    useEffect(() => {
        getQuestions({ page_number: pageNumber, page_size: pageSize })
    }, [])

    const refetchData = useCallback(
        (type_search) => {
            setTypeSearch(type_search)
            getQuestions({ page_number: pageNumber, page_size: pageSize })
            // if (type_search === EnumSearchType.REGULAR) {
            //     getQuestions({ page_number: pageNumber, page_size: pageSize })
            // } else if (type_search === EnumSearchType.MULTI_ANSWERS) {
            //     getQuestionsWidthMultipleAnswers({
            //         page_number: pageNumber,
            //         page_size: pageSize
            //     })
            // }
        },
        [pageNumber, pageSize, typeSearch]
    )

    const handleChangePagination = useCallback(
        (_pageNumber, _pageSize) => {
            if (pageSize !== _pageSize) {
                setPageSize(_pageSize)
                getQuestions({
                    page_number: pageNumber,
                    page_size: _pageSize,
                    search: searchString,
                    question_type: filterQuestionType
                })
                // if (typeSearch === EnumSearchType.REGULAR) {
                //     getQuestions({
                //         page_number: pageNumber,
                //         page_size: _pageSize,
                //         search: searchString,
                //         question_type: filterQuestionType
                //     })
                // } else if (typeSearch === EnumSearchType.MULTI_ANSWERS) {
                //     getQuestionsWidthMultipleAnswers({
                //         page_number: pageNumber,
                //         page_size: _pageSize,
                //         search: searchString
                //     })
                // }
            } else if (pageNumber !== _pageNumber) {
                setPageNumber(_pageNumber)
                getQuestions({
                    page_number: _pageNumber,
                    page_size: pageSize,
                    search: searchString,
                    question_type: filterQuestionType
                })
                // if (typeSearch === EnumSearchType.REGULAR) {
                //     getQuestions({
                //         page_number: _pageNumber,
                //         page_size: pageSize,
                //         search: searchString,
                //         question_type: filterQuestionType
                //     })
                // } else if (typeSearch === EnumSearchType.MULTI_ANSWERS) {
                //     getQuestionsWidthMultipleAnswers({
                //         page_number: _pageNumber,
                //         page_size: pageSize,
                //         search: searchString
                //     })
                // }
            }
        },
        [typeSearch, searchString, filterQuestionType, pageNumber, pageSize]
    )
    const toggleModal = useCallback(
        (value: boolean, _modalType?: any) => {
            setSelectedItem(null)
            setVisible(value)
            setModalType(_modalType)
        },
        [modalType, visibleModal]
    )

    const onEdit = useCallback(
        (item) => {
            setSelectedItem(item)
            setVisible(true)
            setModalType(MODAL_TYPE.EDIT)
        },
        [modalType, visibleModal, selectedItem]
    )

    const removeQuestion = useCallback((record) => {
        setLoading(true)
        QuestionAPI.deleteLibraryQuestion({ id: record._id })
            .then((res) => {
                notify('success', 'Remove successfully')
                refetchData(typeSearch)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }, [])

    const hasHttpUrl = (_url) => {
        if (_url.indexOf('http') !== -1) return true
        return false
    }

    const onSearchQuestionType = useCallback(
        (type) => {
            setTypeSearch(EnumSearchType.REGULAR)
            setPageNumber(1)
            setFilterQuestionType(type)
            getQuestions({
                page_size: pageSize,
                page_number: 1,
                search: searchString,
                question_type: type
            })
        },
        [typeSearch, pageSize, pageNumber, filterQuestionType]
    )

    const onSearchString = useCallback(
        (str) => {
            setTypeSearch(EnumSearchType.REGULAR)
            setPageNumber(1)
            setSearchString(str)
            getQuestions({
                page_size: pageSize,
                page_number: 1,
                search: str,
                question_type: filterQuestionType
            })
        },
        [typeSearch, pageSize, pageNumber, searchString]
    )

    // const searchMultipleChoice = useCallback(() => {
    //     setTypeSearch(EnumSearchType.MULTI_ANSWERS)
    //     setPageNumber(1)
    //     getQuestionsWidthMultipleAnswers({
    //         page_size: pageSize,
    //         page_number: 1,
    //         search: searchString
    //     })
    // }, [typeSearch, pageSize, pageNumber])

    const menuActions = (record: any) => (
        <Menu>
            {/* <Menu.Item key='0' onClick={() => onEdit(record)}>
                <EditOutlined className='mr-2' />
                Edit
            </Menu.Item> */}
            <Menu.Item
                disabled={record.active}
                key='1'
                onClick={() => removeQuestion(record)}
            >
                <EditOutlined className='mr-2' />
                Delete
            </Menu.Item>
        </Menu>
    )

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'index',
            key: 'index',
            align: 'center',
            width: 80,
            render: (text, record, index) =>
                pageSize * (pageNumber - 1) + index + 1
        },
        {
            title: 'Title',
            dataIndex: 'name',
            key: 'name',
            width: 300,
            render: (text, record) => (
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitize(text.replace('\\r\\n', ''))
                    }}
                />
            )
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 300,
            render: (text, record) => (
                <div
                    dangerouslySetInnerHTML={{
                        __html: sanitize(text.replace('\\r\\n', ''))
                    }}
                />
            )
        },
        {
            title: 'Question Type',
            dataIndex: 'category',
            key: 'question_type',
            width: 100,
            align: 'center',
            render: (text) => text
        },
        // {
        //     title: 'Answers',
        //     dataIndex: 'answers',
        //     key: 'answers',
        //     width: 250,
        //     render: (text) => (
        //         <>
        //             {text.map((item, index) => (
        //                 <p
        //                     key={index}
        //                     style={{
        //                         color: item.is_correct ? '#52c41a' : '#000'
        //                     }}
        //                 >
        //                     {item.label}. {item.text}{' '}
        //                 </p>
        //             ))}
        //         </>
        //     )
        // },
        // {
        //     title: 'Media',
        //     dataIndex: 'id',
        //     key: 'id',
        //     align: 'center',
        //     width: 100,
        //     render: (text, record: any) => (
        //         <>
        //             {record?.audio && (
        //                 <ReactAudioPlayer src={record.audio} controls />
        //                 // <div
        //                 //     className='clickable'
        //                 //     onClick={() =>
        //                 //         window.open(
        //                 //             hasHttpUrl(record?.audio)
        //                 //                 ? record?.audio
        //                 //                 : `https://ispeak.vn/${record?.audio}`,
        //                 //             '_blank'
        //                 //         )
        //                 //     }
        //                 //     title={record?.audio || 'Listen audio'}
        //                 // >
        //                 //     <Tag color='processing'>Current audio</Tag>
        //                 // </div>
        //             )}
        //             {record?.video && (
        //                 <div
        //                     className='clickable'
        //                     onClick={() =>
        //                         window.open(
        //                             hasHttpUrl(record?.video)
        //                                 ? record?.video
        //                                 : `https://ispeak.vn/${record?.video}`,
        //                             '_blank'
        //                         )
        //                     }
        //                     title={record?.video || 'Listen video'}
        //                 >
        //                     <Tag color='processing'>Current video</Tag>
        //                 </div>
        //             )}
        //             {record?.image && (
        //                 <Image src={record?.image} alt='image' />
        //                 // <div
        //                 //     className='clickable'
        //                 //     onClick={() =>
        //                 //         window.open(
        //                 //             hasHttpUrl(record?.image)
        //                 //                 ? record?.image
        //                 //                 : `https://ispeak.vn/${record?.image}`,
        //                 //             '_blank'
        //                 //         )
        //                 //     }
        //                 //     title={record?.image || 'Listen image'}
        //                 // >
        //                 //     <Tag color='processing'>Current image</Tag>
        //                 // </div>
        //             )}
        //         </>
        //     )
        // },
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

    const filterEngines = [
        // {
        //     label: 'Search',
        //     engine: (
        //         <Search
        //             placeholder='Search by title'
        //             style={{ width: '100%' }}
        //             onSearch={_.debounce(onSearchString, 250)}
        //             // value={searchString}
        //             enterButton='Search'
        //             allowClear
        //         />
        //     )
        // },
        {
            label: 'Type',
            engine: (
                <Select
                    style={{ width: '100%' }}
                    onChange={onSearchQuestionType}
                    value={filterQuestionType}
                >
                    <Select.Option value={0} default>
                        All
                    </Select.Option>
                    <Select.Option value='MULTI_CHOICE'>
                        MULTI_CHOICE
                    </Select.Option>
                    <Select.Option value='FILL_ANSWER'>
                        FILL_ANSWER
                    </Select.Option>
                    <Select.Option value='ONE_CHOICE'>ONE_CHOICE</Select.Option>
                </Select>
            )
        }
        // {
        //     label: 'Search Questions Multiple Answers',
        //     engine: (
        //         <div>
        //             <Button
        //                 type='primary'
        //                 style={{ width: 100 }}
        //                 onClick={searchMultipleChoice}
        //             >
        //                 Search
        //             </Button>
        //         </div>
        //     )
        // }
    ]

    return (
        <Card title='Question Management'>
            <FilterDataWrapper
                extensionOut={[
                    <Button
                        type='primary'
                        onClick={() => toggleModal(true, MODAL_TYPE.ADD_NEW)}
                    >
                        Add New
                    </Button>
                ]}
                engines={filterEngines}
            ></FilterDataWrapper>

            <Table
                bordered
                dataSource={questions}
                columns={columns}
                loading={loading}
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
            <QuestionGenerationModal
                visible={visibleModal}
                data={selectedItem}
                toggleModal={toggleModal}
                refetchData={refetchData}
            />
        </Card>
    )
}

export default Questions
