import { useEffect, useReducer, useCallback, useState } from 'react'
import _ from 'lodash'
import {
    Modal,
    Button,
    Row,
    Col,
    Form,
    Input,
    notification,
    Select,
    DatePicker
} from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { MODAL_TYPE } from 'const'
import SubscriptionAPI from 'api/SubscriptionAPI'
import CategoryDomainAPI from 'api/CategoryDomainAPI'
import validator from 'validator'

const { Option } = Select

interface Props {
    visible: any
    toggleModal: any
    total: number
    correct: number
}
const ShowNotification = ({ visible, toggleModal, total, correct }: Props) => {
    useEffect(() => {}, [visible])

    return (
        <Modal
            centered
            maskClosable={true}
            closable
            open={visible}
            onCancel={() => {
                toggleModal(false)
            }}
            title='Result'
            width={500}
        >
            <Row>
                <Col span={24}>
                    <h1>Total Question: {total}</h1>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <h1>Correct Answer: {correct}</h1>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <h1>Result: {(correct / total) * 100}%</h1>
                </Col>
            </Row>
        </Modal>
    )
}

export default ShowNotification
