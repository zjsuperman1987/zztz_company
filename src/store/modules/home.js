const state = {
    showChat:{
        show:false,//是否显示
        toUid:0,//对方uid
    },//聊天框
    readyWebsocket:false,//websocket是否准备好
    gloading:false,//全局加载中状态
}

const mutations = {
    showChat(state, data) {
        state.showChat = data
    },
    readyWebsocket(state,data){
        state.readyWebsocket=data
    },
    gloading(state,data){
        state.gloading=data
    },
}

const actions = {

}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
