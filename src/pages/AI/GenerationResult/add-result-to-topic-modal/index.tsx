import { FC, memo, useCallback, useEffect, useReducer, useState } from 'react'
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
    Col
} from 'antd'
import TemplateAPI from 'api/TemplateAPI'
import _ from 'lodash'
import { EnumTemplateAIStatus, MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumTemplateType } from 'types'
import TextEditor from 'core/Atoms/TextEditor'
import { IModalProps } from 'const/common'
import sanitizeHtml from 'sanitize-html'
import AIGenerateResultAPI from 'api/GenerationResultAiAPI'
import TrialTestAPI from 'api/LibraryTestAPI'

function sanitize(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (val: boolean) => void
    data?: any
    refetchData: () => void
}

const AddResultToTopicModal: FC<IProps> = ({
    visible,
    toggleModal,
    data,
    refetchData
}) => {
    const { Option } = Select
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)

    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            tags: [],
            tags_choose: [],
            isLoading: false,
            page_size: 10,
            page_number: 1,
            total: 0,
            topicData: [],
            search: '',
            topicChoose: []
        }
    )

    const fetchTagsTopic = async () => {
        try {
            const res = await TrialTestAPI.getTagsTopic()
            console.log(res.data)
            setValues({
                tags: res.data
            })
        } catch (error) {
            console.error(error)
        }
    }

    const fetchTestTopic = async (search) => {
        try {
            const res = await TrialTestAPI.getAllTopic({
                publish_status: 'published',
                page_number: 1,
                page_size: 100,
                search
            })
            return res.data.map((i) => ({
                label: `${i.id}-${i.topic}`,
                value: i.id
            }))
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (visible) {
            form.resetFields()
            fetchTagsTopic()
            if (!_.isEmpty(data)) {
                form.setFieldsValue({
                    title: data?.title,
                    content: data?.content
                })
            }
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
    }, [])

    const onFinish = useCallback(
        async (value) => {
            setLoading(true)
            try {
                const data_payload: any = {
                    obj_id: data.id,
                    title: value.title,
                    content: value.content
                }
                await AIGenerateResultAPI.editGenerationResult(data_payload)
                notify('success', 'Update successfully')
                onClose()
                refetchData()
            } catch (err) {
                notify('error', err.message)
            }
            setLoading(false)
        },
        [form]
    )

    const renderBody = () => (
        <Form
            name='basic'
            layout='vertical'
            form={form}
            onFinish={onFinish}
            initialValues={{ is_active: true }}
        >
            <>
                <Form.Item
                    label='Title'
                    name='title'
                    rules={[
                        {
                            required: true,
                            message: 'Title is required'
                        }
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    label='Content'
                    name='content'
                    rules={[
                        {
                            required: true,
                            message: 'Content is required'
                        }
                    ]}
                >
                    <TextEditor heightCustom={400} />
                </Form.Item>
            </>
        </Form>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Edit Report Results'
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
            width={768}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(AddResultToTopicModal)
