import { Result } from 'antd'

const PageBlock = () => {
    return (
        <div className='w-100 text-center'>
            <Result
                status='403'
                title='Safezone bảo vệ bạn khỏi nội dung không mong muốn'
            />
        </div>
    )
}

export default PageBlock
