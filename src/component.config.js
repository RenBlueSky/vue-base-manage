/**
* 所有用到的全局组件组件必须先在这里配置好
* 动态加载无法执行，必须先打包好再使用
*/
import Canvasclock from "./components/Canvasclock.vue";
import Routermenu from "./components/Routermenu.vue";
import Backtotop from "./components/Backtotop.vue";
import Navmenu from "./components/Navmenu.vue";
import countTo from "vue-count-to";


export default {
    components: [
        { key: "canvas-clock", value: Canvasclock },
        { key: "router-menu", value: Routermenu },
        { key: "back-totop", value: Backtotop },
        { key: "nav-menu", value: Navmenu },
        { key: "count-to", value: countTo }
    ]
}