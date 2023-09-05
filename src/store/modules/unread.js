import request from '@/utils/request'
const state = {
    unreadMessage: 0,//未读消息
    unreadWords: 0, //未读留言
    unreadChatMessage: '',//聊天未读消息
    totalNumber: 0,
}

const mutations = {
    setUnreadMessage: (state, data) => {
        state.unreadMessage = data
    },
    clearUnreadMessage: (state, data) => {
        state.unreadMessage = 0
    },
    setUnreadWords: (state, data) => {
        state.unreadWords = data
    },
    clearUnreadWords: (state, data) => {
        state.unreadWords = 0
    },
    setUnreadChatMessage: (state, data) => {
        state.unreadChatMessage = data
    },
    clearUnreadChatMessage: (state, data) => {
        state.unreadChatMessage = ''
    },
}

const actions = {
    // 获取聊天消息未读数据
    getUnreadChatMessage({commit}) {
        return new Promise((resolve, reject) => {
            request.get('WebOnlineMsg/unreadNum').then(res => {
                if (res) {
                    commit('setUnreadChatMessage', res)
                    resolve(res)
                } else {
                    resolve(res)
                }
            }).catch(error => {
                reject(error)
            })
        })
    },
    // 获取通知未读消息
    getUnreadMessage({commit}) {
        return new Promise((resolve, reject) => {
            request.get('WebMessage/unreadNum').then(res => {
                if (typeof res == 'number' || typeof res == 'string') {
                    commit('setUnreadMessage', res)
                    resolve(res)
                } else {
                    resolve(res)
                }
            }).catch(error => {
                reject(error)
            })
        })
    },
    // 获取留言未读留言
    getUnreadWords({commit}) {
        return new Promise((resolve, reject) => {
            request.get('WebMyReplys/unreadNum').then(res => {
                if (typeof res == 'number' || typeof res == 'string') {
                    commit('setUnreadWords', res)
                    resolve(res)
                } else {
                    resolve(res)
                }
            }).catch(error => {
                reject(error)
            })
        })
    },
    getClearWords({commit}) {
        return new Promise((resolve) => {
            commit('clearUnreadWords')
            resolve()
        })
    },
    getClearMessage({commit}) {
        return new Promise((resolve) => {
            commit('clearUnreadMessage')
            resolve()
        })
    },
    getClearChatMessage({commit}) {
        return new Promise((resolve) => {
            commit('clearUnreadChatMessage')
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
