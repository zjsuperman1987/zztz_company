const getters = {
  token: state => state.user.token,
  id: state => state.user.userInfo.id,
  oid: state => state.message.oid,
  language: state => state.language.language,
}
export default getters
