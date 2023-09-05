
const state = {
  oid: null,
  oId: '',
  tableRow: '',
  orderData: '',
  type: 'deal',
  activeTab: 'consult',
  orderRefresh: 0,
  refresh: '',
  userInfo:'',
  cornOrderList: '',  //虚拟币交易订单
  guarantee_list: {},  //担保详情
}

const mutations = {

   //订单ID
   oid: (state,data) => {
    state.oid = data
  },
  //汇率
  user: (state,data) => {
    state.userInfo = data
  },
  //担保详情
  guarantee_list: (state,data) => {
    state.guarantee_list = data
  },
  //订单推送刷新页面
  orderRefresh: (state,data) => {
    state.orderRefresh = data
  },
  SET_tableRow: (state,res) => {
    state.tableRow = res.row
    state.type = res.type
    state.activeTab = res.activeTab
  },
  SET_orderData: (state,data) => {
    state.orderData = data
  },
  SET_cornOrderList: (state,data) => {
    state.cornOrderList = data
  },
  SET_activeTab: (state,data) => {
    state.activeTab = data
  },
  SET_refresh: (state,data) => {
    state.refresh = data
  },
  CLEAR_state: (state) => {
    state.tableRow = ''
    // state.orderData = ''
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
