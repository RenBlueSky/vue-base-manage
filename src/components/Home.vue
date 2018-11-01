<template>
  <el-row id="Home_vue" class="container">
    <el-col :span="24" class="header">
      <div class="logo" :class="collapsed ? 'logo_collapsed' : 'logo_expand'">
        <span v-if="!collapsed">VUE最小管理系统</span>
        <i v-if="collapsed" class="el-icon-setting"></i>
      </div>
      <div class="nav_title">
        <div class="tools" title="菜单折叠与展开" style="float:left;">
          <i :class="menuCls[0]" @click="menuToggle()"></i>
        </div>
        <span class="vueAction">{{$route.name}}</span>
        <span class="histotyTab" v-for="(item, index) in history" :key="index" @click.stop="$router.push({path: item.path});">
          <el-tag :closable="true" @close.stop="spliceTag(index)" :color="index === history.length-1 ? 'white': 'rgba(255,255,255,0.5)'">{{item.name}}</el-tag>
        </span>
      </div>
      <div class="userinfo">
        <el-dropdown trigger="hover">
          <div class="el-dropdown-link">
            <img :src="userinfo.ZK_HEAD_PORTRAIT"/>
            <el-badge :is-dot="false">{{userinfo.ZK_NAME}}</el-badge>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <div @click="$router.push({path: '/main'});">控制台</div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div @click="$router.push({path: '/setup'});">设置</div>
            </el-dropdown-item>
            <el-dropdown-item divided="">
              <div @click="logout()">退出登录</div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-col>
    <el-col :span="24" class="main">
      <div class="aside_menu" ref="aside_menu" v-show="!collapsed">
        <div class="menu_search">
          <el-input placeholder="搜索..."></el-input>
        </div>
        <el-menu :default-active="$route.path" :unique-opened="false" :router="true" theme="dark">
          <template v-for="(item,index) in $router.options.routes" v-if="!item.hidden">
            <router-menu :index="index.toString()" v-if="!item.leaf" :node="item"></router-menu>
            <el-menu-item v-if="item.leaf && item.children.length > 0" :index="item.children[0].path">
              <i :class="item.iconCls"></i>{{item.name}}
            </el-menu-item>
          </template>
        </el-menu>
      </div>
      <ul class="mini_menu" v-show="collapsed" ref="mini_menu">
        <el-tooltip v-for="(item,index) in $router.options.routes" :key="'mini_' + index" v-if="!item.hidden" effect="light" :content="item.name" placement="right">
          <li @click="menuToggle()">
            <i :class="item.iconCls"></i>
          </li>
        </el-tooltip>
      </ul>
      <div class="section_router" :class="collapsed ? 'section_router_collapsed' : 'section_router_expand'">
        <el-col :span="24">
          <el-breadcrumb separator="/" style="float:right; line-height:40px;">
            <el-breadcrumb-item v-for="item in $route.matched" :key="item.path">
              {{ item.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </el-col>
        <div class="sub_router">
          <transition name="el-fade-in-linear">
            <router-view></router-view>
          </transition>
        </div>
      </div>
      <back-totop></back-totop>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      collapsed: false,
      menuCls: ["fa fa-bars fa-lg", "el-icon-menu"],
      history: []
    };
  },
  computed: {
    userinfo() {
      return this.$store.state.userinfo;
    }
  },
  created() {
    this.$http
      .get(
        "Http/Msg/MsgStart.ashx?method=Backend_Verifylogin",
        { a: "123" },
        { emulateJSON: true }
      )
      .then(res => {
        if (res.data.flag === "True") {
          this.$store.commit("updateUserinfo", res.data.result); //更新vuex
        }
      });
    //屏蔽流量模块
    //this.$http.get("Http/Msg/HomeServer.ashx?method=Backend_NewAccess");
    if (sessionStorage.getItem("session_history")) {
      this.history = JSON.parse(sessionStorage.getItem("session_history"));
    }
  },
  methods: {
    logout() {
      this.$confirm("确定要退出本系统?", "提示", { type: "warning" })
        .then(() => {
          this.$http
            .post("Http/Msg/MsgStart.ashx?method=Backend_Logout", {
              random: Math.random()
            })
            .then(res => {
              sessionStorage.clear();
              window.location.replace("/");
            });
        })
        .catch(() => {});
    },
    menuToggle() {
      this.collapsed = !this.collapsed;
      this.menuCls.reverse();
    },
    spliceTag(index) {
      this.history.splice(index, 1); //会改变当前顺序
      sessionStorage.setItem("session_history", JSON.stringify(this.history));
    }
  },
  watch: {
    "$route.name"() {
      document.documentElement.scrollTop = document.body.scrollTop = 0;
      this.history.forEach((item, index) => {
        if (item.name === this.$route.name) {
          this.history.splice(index, 1);
        }
      });

      this.history.push({ name: this.$route.name, path: this.$route.path });
      if (this.history.length > 5) {
        this.history.splice(0, 1);
      }
      sessionStorage.setItem("session_history", JSON.stringify(this.history));
    }
  }
};
</script>

<style lang="scss">
$bodyMax-width: 980px;

.container {
  position: relative;
  width: 100%;
  min-width: $bodyMax-width;
  .fa {
    margin-right: 10px;
  }
  .header {
    height: 60px;
    line-height: 60px;
    background: #20a0ff;
    color: #fff;
    box-shadow: 0 0 8px #324157;
    display: flex;
    justify-content: center;
    align-items: center;
    .logo {
      flex: none;
      height: 100%;
      width: 229px;
      text-align: center;
      font-size: 22px;
      border-right: 1px solid rgba(238, 241, 147, 0.3);
    }
    .logo_collapsed {
      width: 59px;
    }
    .nav_title {
      flex: 1;
      padding-right: 12px;
      .tools i {
        cursor: pointer;
        padding: 20px 5px 20px 20px;
      }
      .vueAction {
        padding-right: 20px;
        cursor: default;
      }
      .histotyTab {
        margin-right: 6px;
        position: relative;
        top: -2px;
        cursor: pointer;
      }
    }
    .userinfo {
      flex: none;
      height: 100%;
      margin-right: 20px;
      .el-dropdown-link {
        cursor: pointer;
        color: #ffffff;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .el-dropdown-link img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin-right: 4px;
      }
    }
  }
  .main {
    position: relative;
    .aside_menu {
      width: 230px;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      min-height: 100vh;
      background-color: #324157;
    }
    .section_router {
      padding: 0 20px 20px 20px;
      margin-left: 230px;
    }
    .section_router_expand {
      margin-left: 230px;
    }
    .section_router_collapsed {
      margin-left: 60px;
    }
    .mini_menu {
      width: 60px;
      background-color: #324157;
      color: #bfcbd9;
      margin: 0;
      padding: 0;
      text-align: center;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      min-height: 100vh;
      li {
        list-style: none;
        width: 100%;
        height: 56px;
        line-height: 56px;
        cursor: pointer;
        &:hover {
          background-color: #48576a;
        }
        .font-icon {
          margin-right: 0;
        }
      }
    }
    .aside_menu {
      .menu_search {
        padding: 8px 6px 6px 6px;
        background-color: #eef1f6;
        display: none;
        input {
          height: 32px;
        }
      }
    }
  }
}

.highcharts-credits {
  display: none;
}

pre {
  display: block;
  padding: 9.5px;
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.42857143;
  color: #333;
  word-break: break-all;
  word-wrap: break-word;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: auto;
}
</style>