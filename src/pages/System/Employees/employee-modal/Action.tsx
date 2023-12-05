import { Row, Checkbox, Form, Col } from 'antd'
import { memo } from 'react'

const Actions = ({ record }: any) => {
    return (
        <Row gutter={[0, 0]}>
            <Col span={18}>
                <Row gutter={[5, 0]}>
                    {record.permissions.map((permission) => (
                        <Col>
                            <Form.Item
                                name={permission._id}
                                style={{ margin: 0 }}
                                valuePropName='checked'
                            >
                                <Checkbox
                                    value={permission._id}
                                    style={{ lineHeight: '32px' }}
                                >
                                    {permission.name}
                                </Checkbox>
                            </Form.Item>
                        </Col>
                    ))}
                </Row>
            </Col>
        </Row>
    )
}

export default memo(Actions)
