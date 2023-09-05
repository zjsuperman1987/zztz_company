import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import getPageTitle from '@/utils/get-page-title'

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

Vue.use(VueRouter)

export const constantRoutes = [
    {
        path: '/',
        component: () => import('@/views/layout'),

        children: [
            {
                path: '/',
                name: 'home',
                component: () => import('@/views/home/index'),
                meta: {title: '首页'}
            },
            {
                path: 'publishGoods',
                name: 'publishGoods',
                component: () => import('@/views/goods/publishGoods'),
                meta: {title: '发布商品'}
            },
            {
                path: 'publishAD',
                name: 'publishAD',
                component: () => import('@/views/AD/publishAD'),
                meta: {title: 'pubAD'}
            },
            {
                path: 'goods-details',
                name: 'goods-details',
                component: () => import('@/views/goodsDetails/index'),
                meta: {title: '商品详情'}
            },
            {
                path: 'notice-details',
                name: 'notice-details',
                component: () => import('@/views/AD-Notice/index'),
                meta: {title: '公告详情'}
            },
            {
                path: 'service',
                name: 'service',
                component: () => import('@/components/service/service'),
                meta: {title: '客服'}
            },
            {
                path: 'feedback',
                name: 'feedback',
                component: () => import('@/views/Feedback'),
                meta: {title: '反馈 & 建议'}
            },
            {
                path: 'ad-details',
                name: 'ad-details',
                component: () => import('@/views/AD-Notice/index'),
                meta: {title: '广告详情'}
            },
            {
                path: 'search',
                name: 'search',
                component: () => import('@/views/search'),
                meta: {title: '分类搜索'}
            },
            {
                path: 'guaranteeSearch',
                name: 'guaranteeSearch',
                component: () => import('@/views/guaranteeSearch'),
                meta: {title: '担保搜索'}
            },
            {
                path: 'favorites',
                name: 'favorites',
                component: () => import('@/views/favorites'),
                meta: {title: 'favorite'}
            },
            {
                path: 'editDetails',
                name: 'editDetails',
                component: () => import('@/views/goods/edit-goods-details'),
                meta: {title: '编辑商品介绍'}
            },
            {
                path: 'editAfterSale',
                name: 'editAfterSale',
                component: () => import('@/views/goods/edit-goods-after_sale'),
                meta: {title: '编辑商品售后'}
            },
            {
                path: 'coin',
                name: 'coin',
                component: () => import('@/views/ThreeCoin/index'),
                meta: {title: '比特币交易'},
            },
            {
                path: 'orderInfo',
                name: 'orderInfo',
                component: () => import('@/views/ThreeCoin/order/index'),
                meta: {title: '订单'}
            },
            //用户
            {
                path: 'personal',
                component: () => import('@/views/personal/user/index'),
                children: [
                    {
                        path: 'userDetails',
                        name: 'userDetails',
                        component: () => import('@/views/personal/admin/userDetails'),
                        meta: {title: '用户详情', activeMenu: '/admin/userManage', roles: ['admin']}
                    },
                    {
                        path: 'userInfo',
                        name: 'userInfo',
                        component: () => import('@/views/personal/user/userInfo/index'),
                        meta: {title: 'account'}
                    },
                    {
                        path: 'myOrder',
                        name: 'myOrder',
                        component: () => import('@/views/personal/user/myOrder'),
                        meta: {title: 'order'}
                    },
                    {
                        path: 'sellOrder',
                        name: 'sellOrder',
                        component: () => import('@/views/personal/user/sellOrder'),
                        meta: {title: 'sellOrder'}
                    },
                    {
                        path: 'myAD',
                        name: 'myAD',
                        component: () => import('@/views/personal/user/myAD'),
                        meta: {title: 'ad'}
                    },
                    {
                        path: 'publishInformation',
                        name: 'publishInformation',
                        component: () => import('@/views/AD/publishAD'),
                        meta: {title: '发布资讯', activeMenu: '/admin/informationManage', roles: ['admin']}
                    },
                    {
                        path: 'myGoods',
                        name: 'myGoods',
                        component: () => import('@/views/personal/user/myGoods'),
                        meta: {title: 'goods'}
                    },
                    {
                        path: 'message',
                        name: 'message',
                        component: () => import('@/views/personal/user/notice'),
                        children: [
                            {
                                path: 'notification',
                                name: 'notification',
                                component: () => import('@/views/personal/user/notice/components/MyNotice'),
                                meta: {title: 'notify', activeMenu: '/personal/message/note'}
                            },
                            {
                                path: 'note',
                                name: 'note',
                                component: () => import('@/views/personal/user/notice/components/Note'),
                                meta: {title: 'msg', activeMenu: '/personal/message/note'}
                            },
                        ]
                    },
                    {
                        path: 'assets',
                        name: 'assets',
                        component: () => import('@/views/personal/user/assets'),
                        children: [
                            {
                                path: 'recharge',
                                name: 'recharge',
                                component: () => import('@/views/personal/user/assets/components/Recharge'),
                                meta: {title: 'recharge', activeMenu: '/personal/assets/recharge'}
                            },
                            {
                                path: 'withdraw',
                                name: 'withdraw',
                                component: () => import('@/views/personal/user/assets/components/Withdraw'),
                                meta: {title: 'withdraw', activeMenu: '/personal/assets/recharge'}
                            },
                            {
                                path: 'transfer',
                                name: 'transfer',
                                component: () => import('@/views/personal/user/assets/components/Transfer'),
                                meta: {title: 'transfer', activeMenu: '/personal/assets/recharge'}
                            },
                        ]
                    },
                    {
                        path: 'feedback-list',
                        name: 'feedback-list',
                        component: () => import('@/views/personal/user/questions'),
                        meta: {title: 'feedback'}
                    },
                    {
                        path: 'feedback-details',
                        name: 'feedback-details',
                        component: () => import('@/views/personal/user/QuestionDetails'),
                        meta: {title: '问题详情', activeMenu: '/personal/feedback-list'}
                    },
                    {
                        path: 'more-information',
                        name: 'more-information',
                        component: () => import('@/views/personal/user/information'),
                        meta: {title: 'info'}
                    },
                    {
                        path: 'start-guarantee',
                        name: 'start-guarantee',
                        component: () => import('@/views/personal/user/start'),
                        meta: {title: '发起担保'}
                    },
                    {
                        path: 'join-guarantee',
                        name: 'join-guarantee',
                        component: () => import('@/views/personal/user/join'),
                        meta: {title: '参与担保'},
                    },
                    {
                        path: 'create',
                        name: 'create',
                        component: () => import('@/views/personal/user/userInfo/components/createGuarantee'),
                        meta: {title: '参与担保'},
                    },
                    //担保详情
                    {
                        path: 'guaranteeDetail',
                        name: 'guaranteeDetail',
                        component: () => import('@/views/personal/guaranteeDetail/index'),
                        meta: {title: '担保详情'}
                    },
                    //担保详情
                    // {
                    //     path: 'guaranteeDetail',
                    //     name: 'guaranteeDetail',
                    //     component: () => import('@/views/personal/guaranteeDetail/index'),
                    //     meta: {title: '参与担保'},
                    // },
                    {
                        path: 'representation',
                        name: 'representation',
                        component: () => import('@/views/personal/user/representation'),
                        meta: {title: '申诉'}
                    },

                ]
            },
            // 管理员
            {
                path: 'admin',
                name: 'admin',
                meta: {title: '后台管理'},
                component: () => import('@/views/personal/admin/index'),
                children: [
                    {
                        path: 'questionsDetails',
                        name: 'questionsDetails',
                        component: () => import('@/views/personal/admin/questionsDetails'),
                        meta: {title: '问题详情', activeMenu: '/admin/questionsManage', roles: ['admin']}
                    },

                    {
                        path: 'appealDetails',
                        name: 'appealDetails',
                        component: () => import('@/views/personal/btcAdmin/appealDetails'),
                        meta: {title: '申诉详情'}
                    },
                ]
            },
        ]
    },
    {
        path: "/404",
        name: "404",
        component: () => import("@/views/404"),
        meta: {title: '出错了'}
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/login'),
        meta: {title: '登录'}
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/register'),
        meta: {title: '注册'}
    },
    {
        path: '/forgetPassword',
        name: 'forgetPassword',
        component: () => import('@/views/forgetPassword'),
        meta: {title: '忘记密码'}
    },
    {
      path: '*',
      redirect: '/404'
    }
]

const router = new VueRouter({
    scrollBehavior: () => ({
        y: 0,
    }),
    routes: constantRoutes
})

/**
 * @Author penny 2698324951@qq.com
 * @Date 2021/1/12 14:12
 * @Description  路由守卫
 * to: 下一个页面/即将要进入的目标
 * from: 当前页面
 */
const whiteList = ['/login', '/', '/register', '/forgetPassword',
    '/help', '/goods-details', '/ad-details', '/notice-details', '/search']   // 白名单
router.beforeEach(async (to, from, next) => {
    store.state.home.gloading=false

    // 登录时间有效期 start
    // let curTime = Math.round(new Date().getTime() / 1000).toString()
    // let exp = localStorage.getItem('exp') ? localStorage.getItem('exp').toString() : ''
    // if ((exp < curTime) && store.getters.token ) store.commit('settings/REMOVE_SETTING')
    // 登录时间有效期 end


    if (!store.state.site.siteSetting) await store.dispatch('site/getSite');
    document.title = getPageTitle(to.meta.title)


    if (store.getters.token) {
        let isAdm
        if (!store.state.user.userInfo) {
            const {is_adm} = await store.dispatch('user/getInfo')
            isAdm = is_adm
        }
        if (!store.state.user.currentInfo) {
            await store.dispatch('user/getCurrent')
        }
        if (!store.state.user.rate) {
            await store.dispatch('user/getRate')
        }

        if (!store.state.unread.unreadMessage) {
            await store.dispatch('unread/getUnreadMessage')
        }
        if (!store.state.unread.unreadWords) {
            await store.dispatch('unread/getUnreadWords')
        }
        if (!store.state.unread.unreadChatMessage) {
            await store.dispatch('unread/getUnreadChatMessage')
        }
        if (!store.state.message.messageType) {
            await store.dispatch('message/getMessageType')
        }

        if (!store.state.user.payStatus && !isAdm) store.dispatch('user/getPayStatus').then()
        if (!store.state.permission.addRoutes.length && isAdm) {
            await store.dispatch('permission/generateRoutes')
            next({...to, replace: true})
        } else {
            next();
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            next()
        } else {
            // other pages that do not have permission to access are redirected to the login page.
            next(`/login?redirect=${to.path}`)
            // next(`/login`)
        }
    }
})
router.afterEach((to, from) => {
    store.state.home.gloading=false
})
export default router
