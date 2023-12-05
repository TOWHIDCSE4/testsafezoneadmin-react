import { useAuth } from 'contexts/Authenticate'
import { notify } from 'utils/notify'
import NotificationDropDown from 'core/Atoms/NotificationDropDown'
import { useCallback, useEffect, useState } from 'react'
// import NotificationAPI from 'api/NotificationAPI'
import { INotification } from 'types'
import { Dropdown, Menu } from 'antd'
import { FULL_DATE_FORMAT } from 'const'
import _ from 'lodash'
import { sanitize } from 'utils'
import moment from 'moment'
import {
    WarningOutlined,
    CaretLeftOutlined,
    CaretRightOutlined
} from '@ant-design/icons'
import { buildUrl } from 'utils/noti-web-app'

const PAGE_SIZE = 20

const Header = () => {
    const { logout, user } = useAuth()
    const [notifications, setNotifications] = useState<INotification[]>([])
    const [alerts, setAlerts] = useState<INotification[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [unseen, setUnseen] = useState(0)
    const [unseenAlert, setUnseenAlert] = useState(0)
    const [visibleModal, setVisibleModal] = useState(false)
    const [visibleDropdownAlert, setVisibleDropdownAlert] = useState(false)

    const handleVisibleChangeSidebar = (value) => {
        if (value) {
            document.getElementById('sidebar_menu').style.display = 'none'
            document.getElementById('show_menu_mobile').style.display = 'block'
            document.getElementById('hide_menu_mobile').style.display = 'none'
            document.getElementById('main_content').style.display = 'block'
            document
                .getElementById('main_content')
                .classList.remove('hide-menu-content')
        } else {
            document.getElementById('sidebar_menu').style.display = 'block'
            document.getElementById('show_menu_mobile').style.display = 'none'
            document.getElementById('hide_menu_mobile').style.display = 'block'
            document
                .getElementById('main_content')
                .classList.add('hide-menu-content')
        }
    }

    const toggleModal = useCallback(
        (val: boolean) => {
            setVisibleModal(val)
            if (val) {
                setVisibleDropdownAlert(false)
            }
        },
        [visibleModal]
    )

    // useEffect(() => {
    //     const onNewNotificationChange = (data) => {
    //         const newNotification = data
    //         if (newNotification) {
    //             notify(
    //                 'info',
    //                 <span
    //                     dangerouslySetInnerHTML={{
    //                         __html: sanitizeMessage(newNotification)
    //                     }}
    //                 />
    //             )
    //             setUnseen((prevState) => prevState + 1)
    //             setNotifications((prevState) => [newNotification, ...prevState])
    //         }
    //     }
    //     if (user?._id) {
    //         connect(
    //             subscribeNotificationChanges({
    //                 user_id: user._id,
    //                 onUpdateChanges: onNewNotificationChange
    //             })
    //         )
    //     }

    //     getNotifications({ page_number: pageNumber, page_size: PAGE_SIZE })
    //     fetchAlerts({ page_number: pageNumber, page_size: PAGE_SIZE })
    //     return () => {
    //         unSubscribeNotificationChanges({
    //             user_id: user._id,
    //             onUpdateChanges: onNewNotificationChange
    //         })
    //     }
    // }, [user._id])

    const onLogout = () => {
        logout()
    }

    const menuAlert = (
        <Menu>
            <NotificationDropDown
                data={alerts}
                unseen={unseen}
                loading={loading}
                loadMore={() => {}}
                shownMore
                onShownMore={() => toggleModal(true)}
            />
        </Menu>
    )

    const genarateLink = () => {
        const data = {
            connectId: user.id,
            email: user.email
        }
        const url = buildUrl(data)
        return url
    }

    return (
        <nav className='navbar navbar-expand navbar-white bg-white'>
            <div className='navbar-collapse collapse'>
                {/* <Dropdown
                    overlay={menuSideBar}
                    onClick={handleVisibleChangeSidebar}
                    overlayClassName='dropdown-noti'
                > */}

                <div id='hide_menu_mobile'>
                    <CaretLeftOutlined
                        onClick={() => handleVisibleChangeSidebar(true)}
                        style={{ fontSize: 30 }}
                    />
                </div>

                <div id='show_menu_mobile'>
                    <CaretRightOutlined
                        onClick={() => handleVisibleChangeSidebar(false)}
                        style={{ fontSize: 30 }}
                    />
                </div>
                {/* </Dropdown> */}
                <ul className='navbar-nav ml-auto'>
                    {/* <a
                        href={genarateLink()}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='btn btn-success d-flex align-items-center pointer'
                        role='button'
                    >
                        Open Hamia Noti
                    </a> */}
                    {/* <Dropdown
                        overlay={menuAlert}
                        trigger={['click']}
                        onVisibleChange={handleAlertChange}
                        overlayClassName='dropdown-noti'
                        visible={visibleDropdownAlert}
                    >
                        <li className='nav-item dropdown'>
                            {unseenAlert > 0 && (
                                <a className='nav-icon dropdown-toggle'>
                                    <div className='position-relative'>
                                        <i
                                            className='align-middle fa-fw fa-message-circle'
                                            data-feather='message-circle'
                                        />
                                        <span className='indicator'>
                                            {unseenAlert}
                                        </span>
                                    </div>
                                </a>
                            )}
                            <a className='nav-icon dropdown-toggle'>
                                <div className='position-relative'>
                                    <WarningOutlined />
                                </div>
                            </a>
                        </li>
                    </Dropdown>
                    <Dropdown
                        overlay={menu}
                        trigger={['click']}
                        onVisibleChange={handleVisibleChange}
                        overlayClassName='dropdown-noti'
                    >
                        <li className='nav-item dropdown'>
                            {unseen > 0 && (
                                <a className='nav-icon dropdown-toggle'>
                                    <div className='position-relative'>
                                        <i
                                            className='align-middle fa-fw fa-message-circle'
                                            data-feather='message-circle'
                                        />
                                        <span className='indicator'>
                                            {unseen}
                                        </span>
                                    </div>
                                </a>
                            )}
                            <a className='nav-icon dropdown-toggle'>
                                <div className='position-relative'>
                                    {unseen > 0 ? (
                                        <i className='align-middle fas fa-fw fa-bell' />
                                    ) : (
                                        <i className='align-middle fas fa-fw fa-bell-slash' />
                                    )}
                                </div>
                            </a>
                        </li>
                    </Dropdown> */}

                    <li className='nav-item dropdown'>
                        <div
                            className='nav-icon dropdown-toggle d-inline-block d-sm-none'
                            data-toggle='dropdown'
                            style={{ cursor: 'pointer' }}
                        >
                            <i
                                className='align-middle'
                                data-feather='settings'
                            />
                        </div>
                        <div
                            className='nav-link dropdown-toggle d-none d-sm-inline-block'
                            data-toggle='dropdown'
                            style={{ cursor: 'pointer' }}
                        >
                            <span className='text-dark'>
                                {user ? user.full_name : 'Administrator'}
                            </span>
                        </div>
                        <div className='dropdown-menu dropdown-menu-right'>
                            <a
                                className='dropdown-item'
                                href='#'
                                onClick={onLogout}
                            >
                                Sign out
                            </a>
                        </div>
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default Header
