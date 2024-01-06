import {
    FC,
    useMemo,
    memo,
    useCallback,
    useEffect,
    useReducer,
    useState
} from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Select,
    Checkbox,
    Switch,
    notification,
    Spin,
    Row,
    Col,
    DatePicker,
    Popover,
    InputNumber,
    Tooltip
} from 'antd'
import {
    QuestionCircleOutlined,
    ArrowRightOutlined,
    CopyOutlined
} from '@ant-design/icons'
import _ from 'lodash'
import { EnumTemplateAIStatus, MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import TextEditor from 'core/Atoms/TextEditor'
import { IModalProps } from 'const/common'
import moment from 'moment'
import { languageParam, qualityParam, toneParam } from 'const/ai-template'
import TrialTestServiceAPI from 'api/TrialTestServiceAPI'
import sanitizeHtml from 'sanitize-html'
import './style.scss'
import ParentSettingApi from 'api/ParentSettingApi'
import { EnumQuestionType } from 'types/IQuestion'
import QuestionAPI from 'api/QuestionAPI'

function sanitizeTags(input: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(input, 'text/html')
    return doc.body.textContent || ''
}

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}
interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (val: boolean) => void
    data?: any
    refetchData: any
}

const QuestionGenerationModal: FC<IProps> = ({
    visible,
    toggleModal,
    data,
    refetchData
}) => {
    const { RangePicker } = DatePicker

    const { Option } = Select
    const [form] = Form.useForm()
    const [isLoading, setLoading] = useState(false)
    const [subjects, setSubjects] = useState([])
    const [sectionVisible, setSectionVisible] = useState(false)
    const [sectionId, setSectionId] = useState(1)
    const [sections, setSections] = useState([])

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            is_show_category: true,
            is_show_age: true,
            is_show_subject: true,
            is_show_rank: false,
            isLoading: false,
            category: data?.category_obj_id || null,
            age: 10,
            subject: null,
            rank: null,
            prompt: null,
            params: {
                language: languageParam.VietNamese,
                quality: qualityParam.Good,
                tone: toneParam.Professional,
                number_result: 1,
                max_result_length: 700
            },
            search: '',
            result_title: '',
            result_content: ''
        }
    )

    const [valueTopic, setValueTopic] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            data: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0
        }
    )

    const getAllSubjects = () => {
        ParentSettingApi.getAllSubjects({})
            .then((res) => {
                if (res) {
                    setSubjects(res)
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getAllSections = (topic_id) => {
        const param = {
            array_sort: [],
            ids_sort: [],
            section_id: null,
            topic_id,
            type: 'basic'
        }
        TrialTestServiceAPI.getSections(param)
            .then((res) => {
                if (res) {
                    setSections(res.data.data)
                    setSectionVisible(true)
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const getTrialTestTopics = useCallback(
        async (query: { page?: number }) => {
            setValueTopic({ isLoading: true })
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const { data } = valueTopic
            await TrialTestServiceAPI.getTopics({
                page: query.page
            })
                .then((res) => {
                    if (res) {
                        let newData = [...res.data.data.data]
                        if (query.page > 1) {
                            newData = [...data, ...res.data.data.data]
                        }
                        setValueTopic({
                            data: newData,
                            total: res.data.data.total
                        })
                    }
                })
                .catch((err) => {
                    notification.error({
                        message: 'Error',
                        description: err.message
                    })
                })
                .finally(() => setValueTopic({ isLoading: false }))
        },
        [valueTopic]
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

    useEffect(() => {
        if (visible) {
            form.resetFields()
            setValues({ result_content: null })
            values.result_content = null
            getAllSubjects()
            getTrialTestTopics({
                ...valueTopic
            })
            if (data) {
                form.setFieldsValue({
                    category: data?.category_obj_id
                })
                setValues({ prompt: data })
                const promptData = data?.prompt
                values.is_show_category =
                    promptData.indexOf('$[category]') !== -1
                values.is_show_age = promptData.indexOf('$[age]') !== -1
                values.is_show_subject = promptData.indexOf('$[subject]') !== -1
                values.is_show_rank = promptData.indexOf('$[rank]') !== -1
                setValues({
                    is_show_category: promptData.indexOf('$[category]') !== -1,
                    is_show_age: promptData.indexOf('$[age]') !== -1,
                    is_show_subject: promptData.indexOf('$[subject]') !== -1,
                    is_show_rank: promptData.indexOf('$[rank]') !== -1
                })
            }
            form.setFieldsValue({
                age: values.age,
                category: data?.category_obj_id,
                language: values.params.language,
                quality: values.params.quality,
                tone: values.params.tone,
                number_result: values.params.number_result,
                max_result_length: values.params.max_result_length
            })
        }
    }, [visible])

    const handleChangeDate = (value) => {
        if (value && value.length) {
            setValues({
                from_date: value[0],
                to_date: value[1]
            })
        }
    }

    const handleGenerate = async () => {
        const dataPost: any = {
            params: values.params,
            prompt_obj_id: data?.id,
            category: values.is_show_category
                ? form.getFieldValue('category')
                : null,
            age: values.is_show_age ? Number(form.getFieldValue('age')) : null,
            subject: values.is_show_subject
                ? form.getFieldValue('subject')
                : null,
            rank: values.is_show_rank ? form.getFieldValue('rank') : null
        }
        setValues({ isLoadingGenerate: true })
        QuestionAPI.generateQuestion(dataPost)
            .then((res) => {
                setValues({
                    result_content: res
                })
                values.result_content = res
                form.setFieldValue('result_content', res)
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
            .finally(() => setValues({ isLoadingGenerate: false }))
    }

    const loadMoreParam = () => (event) => {
        const { target } = event
        if (!valueTopic.isLoading) {
            const { total, page_size, page_number } = valueTopic
            if (total > page_size * page_number) {
                const newPageNumber = valueTopic.page_number + 1
                setValueTopic({ page_number: newPageNumber })
                getTrialTestTopics({
                    page: newPageNumber
                })
            }
        }
    }

    const renderParam = (type: any) => {
        switch (type) {
            case 'category':
                return _.keys(EnumQuestionType)
                    .filter((key: any) => !isNaN(Number(EnumQuestionType[key])))
                    .map((key) => (
                        <Option key={key} value={key}>
                            {_.startCase(key)}
                        </Option>
                    ))

            case 'subject':
                return subjects.map((item: any, index) => (
                    <Option key={`s${item.id}`} value={item.id}>
                        {`${item.name} `}
                    </Option>
                ))

            case 'topic':
                return valueTopic?.data.map((item: any, index) => (
                    <Option
                        key={`s${item.id}`}
                        value={item.id}
                        disabled={item.section_ids === null}
                    >
                        {`${item.topic} `}
                    </Option>
                ))

            case 'section':
                return sections.map((item: any, index) => (
                    <Option key={`s${item.id}`} value={item.id}>
                        {`${item.section_name} `}
                    </Option>
                ))

            case 'rank':
                return valueRank?.data.map((item: any, index) => (
                    <Option key={`s${item.id}`} value={item.id}>
                        {`${item.title} `}
                    </Option>
                ))

            default:
                return <div></div>
        }
    }

    const onChangeParams = (value: any, key: any) => {
        switch (key) {
            case 'language':
                setValues({
                    params: {
                        ...values.params,
                        language: value
                    }
                })
                break
            case 'quality':
                setValues({
                    params: {
                        ...values.params,
                        quality: value
                    }
                })
                break
            case 'tone':
                setValues({
                    params: {
                        ...values.params,
                        tone: value
                    }
                })
                break
            case 'number_result':
                setValues({
                    params: {
                        ...values.params,
                        number_result: value
                    }
                })
                break
            case 'max_result_length':
                setValues({
                    params: {
                        ...values.params,
                        max_result_length: value
                    }
                })
                break
            default:
        }
    }

    const renderSelect = (key: any) => {
        if (key === 'language') {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            return Object.keys(languageParam).map((key: any) => (
                <Option value={languageParam[key]} key={key}>
                    {key}
                </Option>
            ))
        }
        if (key === 'quality') {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            return Object.keys(qualityParam).map((key: any) => (
                <Option value={qualityParam[key]} key={key}>
                    {key}
                </Option>
            ))
        }
        if (key === 'tone') {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            return Object.keys(toneParam).map((key: any) => (
                <Option value={toneParam[key]} key={key}>
                    {_.startCase(key)}
                </Option>
            ))
        }

        // eslint-disable-next-line @typescript-eslint/no-shadow
        return (
            <>
                <Option key={1} value={1}>
                    1
                </Option>
                <Option key={2} value={2}>
                    2
                </Option>
                <Option key={3} value={3}>
                    3
                </Option>
                <Option key={4} value={4}>
                    4
                </Option>
                <Option key={5} value={5}>
                    5
                </Option>
            </>
        )
    }

    const onClose = useCallback(() => {
        toggleModal(false)
    }, [])

    const insertQuestion = async (questionData) => {
        const qna = questionData.map((item, index) => {
            return {
                order: index + 1,
                content: item.description,
                voice_content: false,
                voice_answer: false,
                correct: item.correct_answer.map((i) => {
                    return { subCorrect: i.text }
                }),
                incorrect: item.incorrect_answer.map((i) => {
                    return { ic: i.text }
                })
            }
        })
        const formData = {
            question_id: null,
            topic_id: questionData[0].topics,
            section_id: questionData[0].section,
            title: questionData[0].name,
            voice_title: 0,
            voice_answer: 0,
            scores: 1,
            type_question: 2,
            category: 1,
            url_audio_title: null,
            url_main_audio: null,
            url_main_image: null,
            picture_bellow_text: 0,
            content_question_main: questionData[0].title,
            voice_content_main: 0,
            array_qna_question: JSON.stringify(qna)
        }

        await TrialTestServiceAPI.saveTrialTestQuestion(formData)
    }

    const onFinish = useCallback(
        async (value) => {
            const question_content = await value.result_content.replace(
                '</p> <p>',
                '\n\n'
            )
            setLoading(true)
            const dataPayload: any = {
                result_title: value.result_title,
                result_content: sanitizeTags(question_content),
                params: values.params,
                category: values.is_show_category ? value.category : null,
                age: values.is_show_age ? Number(value.age) : null,
                subject: values.is_show_subject ? value.subject : null,
                topics: value.topics,
                section: value.section
            }

            try {
                await QuestionAPI.createLibraryQuestion(dataPayload).then(
                    (res) => {
                        console.log(res)
                        if (res) {
                            insertQuestion(res)
                            notify('success', 'Create successfully')
                            onClose()
                            refetchData()
                        }
                    }
                )
            } catch (err) {
                notify('error', err.message)
            }
            setLoading(false)
        },
        [data, form]
    )

    const selectedTopic = (val) => {
        getAllSections(val)
        form.setFieldsValue({
            section: ''
        })
    }

    const renderBody = () => (
        <>
            <Form
                name='basic'
                labelCol={{ span: 12 }}
                labelAlign='left'
                wrapperCol={{ span: 12 }}
                form={form}
                autoComplete='off'
                onFinish={onFinish}
            >
                <Row>
                    <Col
                        span={8}
                        className='pr-4'
                        style={{ borderRight: '1px solid #d9d9d9' }}
                    >
                        <Form.Item
                            noStyle
                            shouldUpdate={(prevValues, currentValues) =>
                                prevValues.type !== currentValues.type
                            }
                        >
                            <h4>{data?.title}</h4>
                            <div
                                className='mb-4'
                                style={{
                                    backgroundColor: '#e9f7fe',
                                    color: '#3184ae',
                                    padding: '5px',
                                    borderRadius: '3px'
                                }}
                            >
                                {data?.description}
                            </div>

                            <Form.Item label='Topics' name='topics'>
                                <Select
                                    placeholder='Choose Topic'
                                    loading={valueTopic.isLoading}
                                    onPopupScroll={loadMoreParam()}
                                    onChange={(e) => selectedTopic(e)}
                                >
                                    {renderParam('topic')}
                                </Select>
                            </Form.Item>
                            {sectionVisible && (
                                <Form.Item label='Sections' name='section'>
                                    <Select
                                        placeholder='Choose section'
                                        showSearch
                                        autoClearSearchValue
                                        filterOption={false}
                                    >
                                        {renderParam('section')}
                                    </Select>
                                </Form.Item>
                            )}
                            {values.is_show_category && (
                                <Form.Item label='Category' name='category'>
                                    <Select
                                        placeholder='Choose category'
                                        showSearch
                                        autoClearSearchValue
                                        filterOption={false}
                                    >
                                        {renderParam('category')}
                                    </Select>
                                </Form.Item>
                            )}
                            {values.is_show_age && (
                                <Form.Item label='Age' name='age'>
                                    <InputNumber
                                        min='3'
                                        max='100'
                                        defaultValue='10'
                                        placeholder='Enter age'
                                    ></InputNumber>
                                </Form.Item>
                            )}
                            {values.is_show_subject && (
                                <Form.Item label='Subject' name='subject'>
                                    <Select
                                        placeholder='Choose subject'
                                        showSearch
                                        autoClearSearchValue
                                        filterOption={false}
                                    >
                                        {renderParam('subject')}
                                    </Select>
                                </Form.Item>
                            )}
                            {values.is_show_rank && (
                                <Form.Item label='Rank' name='rank'>
                                    <Select
                                        placeholder='Choose rank'
                                        showSearch
                                        autoClearSearchValue
                                        filterOption={false}
                                    >
                                        {renderParam('rank')}
                                    </Select>
                                </Form.Item>
                            )}
                            <Form.Item label='Language' name='language'>
                                <Select
                                    placeholder='Choose language'
                                    onChange={(val) => {
                                        onChangeParams(val, 'language')
                                    }}
                                >
                                    {renderSelect('language')}
                                </Select>
                            </Form.Item>
                            <Form.Item label='Quality type' name='quality'>
                                <Select
                                    placeholder='Choose quality'
                                    onChange={(val) => {
                                        onChangeParams(val, 'quality')
                                    }}
                                >
                                    {renderSelect('quality')}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label='Tone of Voice'
                                name='tone'
                                tooltip='Set the tone of the result.'
                            >
                                <Select
                                    placeholder='Choose tone'
                                    onChange={(val) => {
                                        onChangeParams(val, 'tone')
                                    }}
                                >
                                    {renderSelect('tone')}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label='Number of Result'
                                name='number_result'
                            >
                                <Select
                                    placeholder='Choose quality'
                                    onChange={(val) => {
                                        onChangeParams(val, 'number_result')
                                    }}
                                >
                                    {renderSelect('number_result')}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label='Max Results Length'
                                name='max_result_length'
                                tooltip='Maximum words for each result.'
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={200}
                                    max={1500}
                                    onChange={(val) => {
                                        onChangeParams(val, 'max_result_length')
                                    }}
                                />
                            </Form.Item>
                            <Button
                                type='primary'
                                style={{ width: '100%' }}
                                onClick={handleGenerate}
                                loading={values.isLoadingGenerate}
                            >
                                <span>Generate</span>{' '}
                                <ArrowRightOutlined
                                    style={{ fontSize: '16px' }}
                                />
                            </Button>
                        </Form.Item>
                    </Col>
                    <Col span={16} className='pl-4'>
                        <Row className='mb-2' justify='end'>
                            <Tooltip title='Copy content'>
                                <CopyOutlined
                                    style={{ fontSize: 20 }}
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            document.getElementById(
                                                'text_content'
                                            ).textContent
                                        ) &&
                                        notify('success', 'Copy successfully')
                                    }
                                ></CopyOutlined>
                            </Tooltip>
                        </Row>
                        <div
                            hidden
                            id='text_content'
                            dangerouslySetInnerHTML={{
                                __html: sanitize(values.result_content)
                            }}
                        />
                        <Form.Item
                            label='Result Title'
                            name='result_title'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'title is required'
                                }
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            label='Result Content'
                            name='result_content'
                            labelCol={{ span: 24 }}
                            wrapperCol={{ span: 24 }}
                            rules={[
                                {
                                    required: true,
                                    message: 'content is required'
                                }
                            ]}
                        >
                            <TextEditor
                                heightCustom={400}
                                onChange={(val) =>
                                    setValues({ result_content: val })
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Generate New Template'
            footer={[
                <Button key='back' type='default' onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key='submit'
                    type='primary'
                    onClick={form.submit}
                    loading={isLoading}
                >
                    Save
                </Button>
            ]}
            width={1080}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(QuestionGenerationModal)
