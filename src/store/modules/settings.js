const state = {
  theme: {
    // bgColor: '',
    // newBg: '',
    // hotBg: '',
    // reBg: '',
    // infoBg: '',
  }
}

const mutations = {
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.theme.hasOwnProperty(key)) {
      state.theme[key] = value
    }
    localStorage.setItem('theme', JSON.stringify(state.theme))
  },

  REMOVE_SETTING: ()=> {
    localStorage.removeItem('adm')
    localStorage.removeItem('uid')
    localStorage.removeItem('exp')
    localStorage.removeItem('token')
  },

  RESETTING: (state, data)=> {
    state.theme = { ...data }
  }
}

const actions = {
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
