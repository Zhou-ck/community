const getters = {
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  id: state => state.user.id,
  name: state => state.user.name,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  joinedCommunity: state => state.user.joinedCommunity,
  sleepReportItem: state => state.user.sleepReportItem,
  getSleepReportItem: state => () => state.user.sleepReportItem
}
export default getters
