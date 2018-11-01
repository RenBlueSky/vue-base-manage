/**
* 所有用到的vue单组件必须先在这里配置好
* 动态加载无法执行，必须先打包好再使用
*/
import Error from "./components/Error.vue";
import Main from "./components/Main.vue";
import Home from "./components/Home.vue";
import Role from "./components/Role.vue";
import Permit from "./components/Permit.vue";
import Permitconfig from "./components/Permitconfig.vue";
import Params from "./components/Params.vue";
import User from "./components/User.vue";
import Investor from "./components/Investor.vue";
import Investment from "./components/Investment.vue";


export default {
    vue: {
        "_Routerview": { template: "<router-view></router-view>" },
        "_Error": Error,
        "Main": Main,
        "Home": Home,
        "Role": Role,
        "Permit": Permit,
        "Permitconfig": Permitconfig,
        "Params": Params,
        "User": User,
        "Investor": Investor,
        "Investment": Investment,
        "Setup": { template: "<el-alert title='敬请期待，内容开发中' type='warning'></el-alert>" }
    }
}