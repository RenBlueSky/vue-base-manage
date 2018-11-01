import Vue from "vue";
import VueConfig from "../src/vue.config";
let VueFiles = VueConfig.vue;

export default {
    isloading: true,
    _isAjax: false,
    init() {
        let promise = new Promise((resolve, reject) => {
            if (sessionStorage.getItem("storage_permits")) {
                this._build(JSON.parse(sessionStorage.getItem("storage_permits")));
                this.isloading = false;
                resolve(this.routes);
            } else {
                Vue.http.get("Http/Msg/HomeServer.ashx?method=Backend_MenuTree").then((res) => {
                    if (res.data.flag === "True") {
                        this._build(res.data.result);
                        sessionStorage.setItem("storage_permits", JSON.stringify(res.data.result));
                        resolve(this.routes);
                    } else {
                        reject();
                    }
                    this.isloading = false;
                }).catch(() => {
                    reject();
                });
            }
        });
        return promise;
    },
    _build(data) {
        this.routes = this._buildNode(null, data);
        this.routes.push({ path: "*", redirect: "/error", hidden: true, leaf: true });
        this.routes.push({ path: "/", redirect: "/error", hidden: true, leaf: true });
        this.routes.push({ path: "/error", component: VueFiles["_Error"], hidden: true, leaf: true });
    },
    _buildNode(parent, store) {
        let obj = new Array();
        store.forEach(item => {
            if (!item.ZK_PARENT) { item.ZK_PARENT = null; }
            if (item.ZK_PARENT == parent) {
                obj.push({
                    index: item.ZK_ID,
                    path: item.ZK_PATH,
                    component: VueFiles[item.ZK_COMPONENT] || { template: "<router-view></router-view>" },
                    name: item.ZK_NAME,
                    hidden: item.ZK_ISHIDDEN === "1",
                    iconCls: item.ZK_ICON,
                    leaf: item.ZK_ISLEAF === "1",
                    children: this._buildNode(item.ZK_ID, store)
                });
            }
        });
        return obj;
    },
    routes: new Array()
}