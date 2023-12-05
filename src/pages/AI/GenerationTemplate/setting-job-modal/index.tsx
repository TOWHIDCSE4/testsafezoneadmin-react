import { FC, memo, useCallback, useEffect, useState } from 'react'
import {
    Modal,
    Button,
    Form,
    Input,
    Select,
    Checkbox,
    Switch,
    InputNumber,
    Row,
    Col
} from 'antd'
import TemplateAPI from 'api/TemplateAPI'
import _ from 'lodash'
import { MODAL_TYPE } from 'const/status'
import { notify } from 'utils/notify'
import { EnumTemplateType } from 'types'
import TextEditor from 'core/Atoms/TextEditor'
import { IModalProps } from 'const/common'
import GenerationTemplateAPI from 'api/GenerationTemplateAiAPI'
import { Link } from 'react-router-dom'

interface IProps extends IModalProps {
    visible: boolean
    toggleModal: (val: boolean) => void
    dataTemplate?: any
    refetchData: () => void
}

const SettingJobModal: FC<IProps> = ({
    visible,
    toggleModal,
    dataTemplate,
    refetchData
}) => {
    const [form] = Form.useForm()

    const [isLoading, setLoading] = useState(false)
    const [statusJob, setStatusJob] = useState(false)

    useEffect(() => {
        if (visible) {
            form.resetFields()
            console.log(dataTemplate)
            if (!_.isEmpty(dataTemplate)) {
                setStatusJob(dataTemplate?.job_is_active)
                form.setFieldsValue({
                    job_is_active: dataTemplate?.job_is_active,
                    job_frequency: dataTemplate?.job_frequency ?? 1
                })
            } else {
                form.setFieldsValue({
                    job_frequency: 1
                })
            }
        }
    }, [visible])

    const onClose = useCallback(() => {
        toggleModal(false)
    }, [])

    const changeStatusJob = (val) => {
        setStatusJob(val)
    }

    const onFinish = useCallback(
        (values) => {
            setLoading(true)
            const dataUpdate: any = {
                job_is_active: values?.job_is_active,
                job_frequency: values?.job_frequency,
                obj_id: dataTemplate._id
            }
            GenerationTemplateAPI.editGenerationTemplate(dataUpdate)
                .then((res) => {
                    notify('success', 'Setting successfully')
                    onClose()
                    refetchData()
                })
                .catch((err) => {
                    notify('error', err.message)
                })
                .finally(() => setLoading(false))
        },
        [form, dataTemplate]
    )

    const renderBody = () => (
        <Form
            name='basic'
            layout='vertical'
            form={form}
            onFinish={onFinish}
            initialValues={{ job_is_active: true, job_frequency: 1 }}
        >
            <Row>
                <Col span={10}>
                    <Form.Item
                        labelAlign='left'
                        name='job_is_active'
                        label='Active'
                        valuePropName='checked'
                    >
                        <Switch onChange={(val) => changeStatusJob(val)} />
                    </Form.Item>
                </Col>
                <Col span={5}>
                    <Form.Item label='frequency' name='job_frequency'>
                        <InputNumber min={1} disabled={!statusJob} />
                    </Form.Item>
                </Col>
                <Col span={2}>
                    <div style={{ marginTop: 35 }}>giờ</div>
                </Col>
            </Row>
        </Form>
    )
    return (
        <Modal
            centered
            maskClosable={true}
            closable
            visible={visible}
            onCancel={onClose}
            title='Setting job'
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
            width={568}
        >
            {renderBody()}
        </Modal>
    )
}

export default memo(SettingJobModal)
