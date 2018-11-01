//vuex的配置文件

export default {
    state: {
        userinfo: {}
    },
    mutations: {
        updateUserinfo: function (state, userinfo) {
            state.userinfo = userinfo;
        }
    }
}