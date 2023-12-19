import { useEffect, useReducer, useCallback, useState } from 'react'
import _ from 'lodash'
import {
    Modal,
    Button,
    Table,
    Row,
    Col,
    Form,
    Input,
    notification,
    Select,
    TimePicker
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { MODAL_TYPE } from 'const'
import ParentSettingApi from 'api/ParentSettingApi'
import moment from 'moment'
import { ColumnsType } from 'antd/lib/table/Table'

const { Option } = Select

interface IQuiz {
    id: number
    name: string
}

interface Props {
    visible: any
    toggleModal: any
    addQuizes: any
}
const AddQuizModal = ({ visible, toggleModal, addQuizes }: Props) => {
    const [values, setValues] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        {
            isLoading: false,
            quizes: []
        }
    )
    const [form] = useForm()

    const getAllQuizes = () => {
        ParentSettingApi.getAllQuizes({})
            .then((res) => {
                if (res) {
                    setValues({ quizes: res })
                }
            })
            .catch((err) => {
                notification.error({
                    message: 'Error',
                    description: err.message
                })
            })
    }

    const reset = () => {
        form.resetFields()
        setValues({
            isLoading: false,
            quizes: []
        })
    }

    useEffect(() => {
        if (visible) {
            getAllQuizes()
        }
    }, [visible])

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys)
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: onSelectChange
    }
    const save = () => {
        addQuizes(rowSelection)
        reset()
        toggleModal(false)
    }

    const columns: ColumnsType = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            width: 80,
            render: (text, record) => text
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 200
        }
    ]

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            open={visible}
            onCancel={() => {
                reset()
                toggleModal(false)
            }}
            title='Add Quizes'
            footer={[
                <Button
                    key='save'
                    type='primary'
                    onClick={() => save()}
                    loading={values.isLoading}
                >
                    Save
                </Button>
            ]}
            width={500}
        >
            <Row>
                <Col span={24}>
                    <Table
                        rowSelection={rowSelection}
                        bordered
                        dataSource={values.quizes}
                        columns={columns}
                        rowKey={(record: IQuiz) => record?.id}
                        scroll={{
                            x: 500
                        }}
                        sticky
                    />
                </Col>
            </Row>
        </Modal>
    )
}

export default AddQuizModal
