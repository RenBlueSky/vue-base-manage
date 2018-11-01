//import "animate.css"
//import "element-ui/lib/theme-chalk/index.css";
//import "font-awesome/css/font-awesome.min.css"

import Vue from 'vue';
import Vuex from "vuex";
import "./global.config";
import "./javascript.common";
import ElementUI from "element-ui";
import VueRouter from "vue-router";
import Login from './components/Login';
import VueResource from "vue-resource";
import VuexConfig from "./vuex.config";
import VueHtml5Editor from "vue-html5-editor";
import RouterConfig from "./router.config";
import ComponentConfig from "./component.config";
import VueEditorConfig from "./vueeditor.config";



//添加依赖
Vue.use(Vuex);
Vue.use(VueRouter);
Vue.use(VueResource);
Vue.use(ElementUI);
Vue.use(VueHtml5Editor, VueEditorConfig.options);


//http拦截器
Vue.http.interceptors.push(function (request, next) {
    if (request.url.toLowerCase().indexOf("http://") !== 0 && request.url.toLowerCase().indexOf("https://") !== 0) {
        request.url = HTTP_PORT + request.url;
    }
    if (JavascriptCommon.GetSysTokenSession("accessToken")) {
        request.headers.set("Access-Token", JavascriptCommon.GetSysTokenSession("accessToken"));
        request.headers.set("Permit-Token", JavascriptCommon.GetSysTokenSession("permitToken"));
    }
    next(function (response) {
        if ("access-token" in response.headers) {
            setTimeout(() => {
                JavascriptCommon.SetSysTokenSession("accessToken", response.headers["access-token"]);
            }, 0);
        }
        if (typeof (response.data) === "object") {
            if ("flag" in response.data) {
                if ("code" in response.data) {
                    response.data.code = parseInt(response.data.code);
                    if (response.data.flag === "False") {
                        if (response.data.code === 0) {
                            //警告
                            if (response.data.message) {
                                ElementUI.Notification({ message: response.data.message, type: "warning" });
                            }
                        } else if (response.data.code === 1 && !/Backend_MenuTree/gi.test(response.url)) {
                            //登录超时
                            ElementUI.Notification({ message: "登录超时,请重新登录", type: "warning" });
                            setTimeout(function () {
                                sessionStorage.clear();
                                window.location.replace("/");
                            }, 1200);
                        } else if (response.data.code === 2) {
                            //没有权限
                            this.$router.push({ path: "/error" });
                        } else {
                            //todo
                        }
                    }
                }
            }
        }
        return response;
    });
});


//配置全局组件
ComponentConfig.components.forEach((item) => {
    Vue.component(item.key, item.value);
});

//路由初始化及实例化
RouterConfig.init().then(routes => {
    new Vue({
        el: "#backendApp",
        router: new VueRouter({
            routes: routes
        }),
        store: new Vuex.Store({
            state: VuexConfig.state,
            mutations: VuexConfig.mutations
        }),
        computed: {
            radom() {
                return this.$route.name !== undefined ? this.$route.name + new Date() : this.$route + new Date()
            }
        }
    });
}).catch(() => {
    new Vue({
        el: "#backendApp",
        router: new VueRouter({
            routes: [
                { path: '/', component: Login },
                { path: "*", redirect: "/" }
            ]
        })
    });
});