
const state = {
  // 默认在哪个标签
  // activeTab: 'orderList',
  activeTab: 'goodsInfo',
  // 刷新设置
  refreshValue: null,
  //存储商品数据
  goodsInfo: {},
  details: {},
  // 刷新整体
  refreshInfo: '',
  consultList: []
}

const mutations = {
  // 改变标签
  changeTab(state, data) {
    console.log(data)
    state.activeTab = data
  },

  // 咨询列表
  setConsultList(state, data) {
    state.consultList = data
  },

  // 刷新订单
  refresh(state, data) {
    state.refreshValue = data
  },

  // 刷新整体
  refreshInfo(state, data) {
    state.refreshInfo = data
  },

  // 存储
  SET_goodsInfo(state, data) {
    state.goodsInfo = data
  },
  SET_DETAILS(state, data) {
    state.details = data
  }
}

const actions = {

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
