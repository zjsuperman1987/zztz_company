import request from "@/utils/request";

const state = {
  siteSetting: '',    // 站点设置
}

const mutations = {
  setSite: (state,data)=> {
    state.siteSetting = data
    window.localStorage.setItem('site', JSON.stringify(data))
  },
}

const actions = {
  getSite({ commit } ) {
    return new Promise((resolve, reject) => {
      request.get('/webHome/getSites').then(res => {
        console.log(res)
        commit('setSite',res)
        resolve(res)
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
