import request from '@/utils/request'

const state = {
    id: window.localStorage.getItem('id'),
    token: window.localStorage.getItem('token'),
    is_adm: window.localStorage.getItem('is_adm'),
    userInfo: '',
    payStatus: 0,
    currentInfo: '',
    rate: '',  //国际实时汇率
}

const mutations = {
    setToken: (state, data) => {
        state.token = data.token
        state.is_adm = data.is_adm
        window.localStorage.setItem('token', data.token)
        window.localStorage.setItem('is_adm', data.is_adm)
        window.localStorage.setItem('exp', data.exp)
    },
    setUserInfo: (state, data) => {
        state.userInfo = data
        localStorage.setItem('adm', data.is_adm)
    },
    setCurrent: (state, data) => {
        state.currentInfo = data
    },
    setRate: (state, data) => {
        state.rate = data
    },
    setPayStatus: (state, data) => {
        state.payStatus = data
    },
    CLEAR_STATE: state => {
        state.token = ''
        state.userInfo = ''
    },
}

const actions = {
    // 保持登录状态
    login({commit, state}, params) {
        console.log('params', params)
        console.log('state', state)
        return new Promise((resolve, reject) => {
            request('/WebLogin/login', {method: 'post', params}).then(res => {
                if (res) {
                    console.log(res)
                    commit('setToken', res)
                    resolve()
                } else {
                    reject()
                }
            }).catch((error) => {
                reject(error)
            })
        })
    },
    getPayStatus({commit}) {
        return new Promise((resolve) => {
            request.get('/WebUser/getPayStatus').then(res => {
                if (res) {
                    commit('setPayStatus', res.status)
                    resolve(res)
                }
            })
        })
    },
    // get user info
    getInfo({commit}) {
        return new Promise((resolve, reject) => {
            request.get('/WebUser/read').then(res => {
                if (res) {
                    commit('setUserInfo', res)
                    resolve(res)
                }
            }).catch(error => {
                reject(error)
            })
        })
    },
    // 获取币种
    getCurrent({commit}) {
        return new Promise((resolve, reject) => {
            request.get('WebHome/getCurrency').then(res => {
                if (res) {
                    commit('setCurrent', res)
                    resolve(res)
                }
            }).catch(error => {
                reject(error)
            })
        })
    },
    // 获取国际实时汇率
    getRate({commit}) {
        return new Promise((resolve, reject) => {
            request.get('WebHome/getExchangeRate').then(res => {
                if (res) {
                    commit('setRate', res)
                    resolve(res)
                }
            }).catch(error => {
                reject(error)
            })
        })
    },
    // user logout
    logout({commit}) {
        return new Promise((resolve) => {
            commit('CLEAR_STATE')
            resolve()
        })
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
