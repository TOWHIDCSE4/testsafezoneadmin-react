import React, { useEffect, useState } from 'react'
import {
    Table,
    Row,
    Col,
    Card,
    Dropdown,
    Button,
    Tag,
    Image,
    Select,
    Input,
    notification,
    Radio,
    Space,
    Form,
    Checkbox
} from 'antd'
import { PoweroffOutlined } from '@ant-design/icons'
import sanitizeHtml from 'sanitize-html'
import { debounce } from 'lodash'
import SubjectSetAPI from 'api/SubjectSetAPI'
import ParentSettingApi from 'api/ParentSettingApi'
import { IQuestion, EnumQuestionType } from 'types/IQuestion'
import { EnumQuizLevel } from 'types/IQuiz'
import { MODAL_TYPE } from 'const'
import { ColumnsType } from 'antd/lib/table'
import { checkPermission } from 'utils/check-permission'
import { PERMISSIONS } from 'const/permission'
import ReactAudioPlayer from 'react-audio-player'
import FilterDataWrapper from 'components/filter-data-wrapper'
import { notify } from 'utils/notify'
import SubjectWiseQuestion from './SubjectWiseQuestion'

const { Search } = Input

enum EnumSearchType {
    REGULAR = 1,
    MULTI_ANSWERS = 2
}

function sanitizeString(string: string) {
    return sanitizeHtml(string, {
        allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img']
    })
}

const SubjectSet = () => {
    const queryUrl = new URLSearchParams(window.location.search)
    const [loading, setLoading] = useState(false)
    const [isQuestionPage, setIsQuestionPage] = useState(false)
    const [allQuestions, setAllQuestions] = useState([])
    const [subjects, setSubjects] = useState([])
    const [selectedSubjects, setSelectedSubjects] = useState('')
    const [isLoadingQuestion, setIsLoadingQuestion] = useState(false)

    const getAllSubjects = () => {
        ParentSettingApi.getAllSubjects({})
            .then((res) => {
                if (res) {
                    console.log(res)
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

    const fetchQuestions = () => {
        SubjectSetAPI.getQuestionForStudent({ subject_id: selectedSubjects })
            .then((res) => {
                console.log(res)
                setAllQuestions(res)
                setIsQuestionPage(true)
            })
            .catch((err) => {
                notify('error', err.message)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        getAllSubjects()
    }, [isQuestionPage])

    const renderRadioSubjects = () => (
        <Radio.Group
            onChange={(e) => setSelectedSubjects(e.target.value)}
            value={selectedSubjects}
        >
            {subjects.map((item) => (
                <Space direction='vertical' key={item.id}>
                    <Radio value={item.id}>{item.name}</Radio>
                </Space>
            ))}
        </Radio.Group>
    )

    return (
        <Card title='Subject Set'>
            <Row>
                <Col span={24}>
                    {isQuestionPage && (
                        <SubjectWiseQuestion
                            data={allQuestions}
                            subject_id={selectedSubjects}
                            setQuestionPage={setIsQuestionPage}
                        />
                    )}
                    {!isQuestionPage && (
                        <>
                            <h3>Please select a subject to start: </h3>
                            {renderRadioSubjects()}
                            {selectedSubjects !== '' && (
                                <Button
                                    type='primary'
                                    icon={<PoweroffOutlined />}
                                    loading={isLoadingQuestion}
                                    onClick={() => fetchQuestions()}
                                >
                                    Start
                                </Button>
                            )}
                        </>
                    )}
                </Col>
            </Row>
        </Card>
    )
}

export default SubjectSet
