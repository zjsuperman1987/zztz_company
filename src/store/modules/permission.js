import request from '@/utils/request'
import router from '@/router'
import { constantRoutes } from '@/router'

const state = {
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, asyncRoutes)=> {
    let newRoutes = []
    let children = []
    asyncRoutes.map(item=> {
      children.push({
        path: item.path || item.name,
        name: item.name,
        component: (resolve) => (require([`@/views/personal/admin/${item.component}`],resolve)),
        meta: {
          icon: item.icon || 'el-icon-setting',
          title: item.title,
          activeMenu: item.activeMenu,
          router: `/admin/${item.name}`
        }
      })
    })
    state.addRoutes = children
    newRoutes.push({
      path: '/',
      component: () => import('@/views/layout'),
      children: [
        {
          path: 'admin',
          component: resolve => require(['@/views/personal/admin/index'], resolve),
          children
        },
        {
          path: '*',
          redirect: '/404'
        }
      ]
    })
    const createRouter = () => new VueRouter({
      routes: constantRoutes
    })
    router.matcher = createRouter().matcher;
    router.addRoutes(newRoutes);
  },

  CLEAR_STATE:(state) => {
    state.addRoutes = []
  }
}

const actions = {
  generateRoutes({ commit }) {
    return new Promise(resolve => {
      request.get('/WebUser/routes').then(res=> {
        if (res) {
          commit('SET_ROUTES', res)
          resolve(res)
        }
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
