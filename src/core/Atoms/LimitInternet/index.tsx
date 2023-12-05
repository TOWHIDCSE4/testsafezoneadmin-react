import { Result } from 'antd'

const LimitInternet = () => {
    return (
        <div className='w-100 text-center'>
            <Result
                status='403'
                title='Safezone đã tạm dừng truy cập internet'
            />
        </div>
    )
}

export default LimitInternet
