import request from "@/utils/request";

const state = {
    orderMsgHistory: [],
    messageStatus: 0,
    msgHistory: [],
    orderRefresh: 0,
    messageType: '', //资讯类型列表
}
const mutations = {
    //存储历史数据
    SET_HISTORY: (state, data) => {
        state.orderMsgHistory = data
    },
    //资讯类型
    setMessageType: (state, data) => {
        state.messageType = data
    },
    //新消息红点
    newMessage: (state, data) => {
        state.messageStatus = data
    },
    //存储历史数据
    SET_message: (state, data) => {
        state.msgHistory.push(data)
    },
    CLEAR_message: (state) => {
        state.msgHistory = []
    },

    //发送消息
    sendMessage: (state, data) => {
        state.orderMsgHistory.push(data)
    },

    clearMessage: (state, data) => {
        state.orderMsgHistory = data
    },
}

const actions = {
    // 资讯类型列表
    getMessageType({commit}) {
        return new Promise((resolve, reject) => {
            request.get('AdmArticle/MallArticleTypeList').then(res => {
                if (res) {
                    for (let item in res.data) {
                        res.data[item]['disabled'] = true
                    }
                    commit('setMessageType', res)
                    resolve(res)
                }
            }).catch(error => {
                reject(error)
            })
        })
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
