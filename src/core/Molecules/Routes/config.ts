import { PERMISSIONS } from 'const/permission'
import _ from 'lodash'
import { flatStructure } from 'utils/data-structure'

export const treeConfig = [
    {
        route: '#sz',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'SAFEZONE',
        headerColor: 'white',
        children: [
            {
                route: '/admin/users',
                required: PERMISSIONS.sz_u_view,
                title: 'Users',
                icon: 'user-friends',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/Safezone/Users')
            },
            {
                route: '/admin/subscription-plans',
                required: PERMISSIONS.sz_sp_view,
                title: 'Subscription Plans',
                icon: 'money-check-alt',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/Safezone/SubscriptionPlans')
            },
            {
                route: '/admin/subscriptions',
                required: PERMISSIONS.sz_s_view,
                title: 'Subscriptions',
                icon: 'file-invoice-dollar',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/Safezone/Subscriptions')
            },
            {
                route: '/admin/web-categories-domain',
                required: PERMISSIONS.sz_s_view,
                title: 'Web Categories Domain',
                icon: 'file-invoice-dollar',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/Safezone/WebCategoriesDomain')
            },
            {
                route: '/admin/library-tests',
                required: PERMISSIONS.sz_s_view,
                title: 'Library Test',
                icon: 'book',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/Safezone/LibraryTests')
            },
            {
                route: '/admin/parents-setting',
                required: PERMISSIONS.sz_s_view,
                title: 'Parent Setting Time',
                icon: 'book',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/Safezone/ParentsSettingTime')
            }
        ]
    },
    {
        route: '#ai',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'AI',
        headerColor: 'white',
        children: [
            {
                route: '/admin/api-key',
                required: PERMISSIONS.ai_ak_view,
                title: 'Api Keys',
                icon: 'key',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/AI/ApiKey')
            },
            {
                route: '/admin/prompt-param',
                required: PERMISSIONS.ai_pp_view,
                title: 'Prompt Params',
                icon: 'th-list',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/AI/PromptParam')
            },
            {
                route: '/admin/prompt',
                required: PERMISSIONS.ai_pm_view,
                title: 'Prompts',
                icon: 'file-invoice',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/AI/Prompt')
            },
            {
                route: '/admin/generation-template',
                required: PERMISSIONS.ai_gt_view,
                title: 'Quiz Templates',
                icon: 'file-alt',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/AI/GenerationTemplate')
            },
            {
                route: '/admin/generation-result',
                required: PERMISSIONS.ai_gr_view,
                title: 'Quiz Results',
                icon: 'file-alt',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/AI/GenerationResult')
            }
        ]
    },
    {
        route: '#st',
        required: 'PARENT',
        isAuthenticated: true,
        title: 'SYSTEM',
        headerColor: 'white',
        children: [
            {
                route: '/admin/system/employees',
                required: PERMISSIONS.s_e_view,
                title: 'Employees',
                icon: 'user-friends',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/System/Employees')
            },
            {
                route: '/admin/system/roles',
                required: PERMISSIONS.s_r_view,
                title: 'Roles',
                icon: 'user-circle',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/System/Roles')
            },
            {
                route: '/admin/templates',
                required: PERMISSIONS.s_t_view,
                title: 'Templates',
                icon: 'file-alt',
                isAuthenticated: true,
                headerColor: '#f3f3f4',
                hasBorderBottom: true,
                component: () => import('pages/System/Templates')
            }
        ]
    }
]

export const routeWithoutSidebar = [
    {
        route: '/',
        isAuthenticated: true,
        component: () => import('pages/Safezone/Users')
    }
]

export function filterConfigByPerms(_treeConfig = [], perms = []) {
    const config = []
    _.forEach(_treeConfig, (c) => {
        if (c.required !== 'PARENT') {
            const childByPerms = _.find(perms, (p) => p === c.required)
            if (childByPerms) {
                config.push(c)
            }
        } else if (
            c.required === 'PARENT' &&
            c.children &&
            c.children.length > 0
        ) {
            const childConfig = filterConfigByPerms(c.children, perms)
            if (childConfig.length > 0) {
                c.children = childConfig
                config.push(c)
            }
        } else if (!c.required) {
            config.push(c)
        }
    })
    return config
}

export default treeConfig

export const flatConfig = flatStructure(treeConfig)
