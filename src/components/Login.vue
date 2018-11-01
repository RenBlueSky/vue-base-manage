<template>
<div id="login_temp">
        <el-form class="login animated fadeInDown" :model="form" :rules="rules" ref="form">
            <h2 class="title">系统登录</h2>
            <el-form-item prop="uid" class="myInput">
                <i class="fa fa-user fa-2x"></i>
                <el-input placeholder="请输入账号" v-model="form.uid"></el-input>
            </el-form-item>
            <el-form-item prop="pwd" class="myInput">
                <i class="fa fa-key fa-2x"></i>
                <el-input type="password" placeholder="请输入密码" v-model="form.pwd"></el-input>
            </el-form-item>
            <el-form-item>
                <!--极验验证码-->
            </el-form-item>
            <el-form-item>
                <el-checkbox v-model="form.checked" style="color:#fff;">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" :loading="form.loading" @click="login()" style="width: 100%;">
                    <strong>登录</strong>
                </el-button>
            </el-form-item>
        </el-form>
        <div class="diver animated fadeInUp">
            <span>第三方登录</span>
        </div>
        <div class="autho animated fadeInUp">
            <div class="autho-item" style="background:#00a1fb;" @click="showSorry">
                <img alt="" />
                <div>QQ</div>
            </div>
            <div class="autho-item" style="background:#1cca44;" @click="showSorry">
                <img alt="" />
                <div>微信</div>
            </div>
            <div class="autho-item" style="background:#e82741;" @click="showSorry">
                <img alt="" />
                <div>微博</div>
            </div>
        </div>
    </div>
</template>

<script>
import md5 from "js-md5";
import { Base64 } from "js-base64";
export default {
  data() {
    return {
      form: { uid: "", pwd: "", checked: true, validate: "", loading: false },
      rules: {
        uid: [{ required: true, message: "请输入账号", trigger: "blur" }],
        pwd: [{ required: true, message: "请输入密码", trigger: "blur" }]
      }
    };
  },
  created() {
    this.$http.post(
      "Http/Msg/MsgStart.ashx?method=Backend_Logout",
      { a: 123 },
      { emulateJSON: true }
    );
    sessionStorage.clear();
    this.fullLoginInfo();
  },
  methods: {
    login() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.loading = true;
          this.$http
            .post(
              "Http/Msg/MsgStart.ashx?method=Backend_Login",
              { ID: this.form.uid, PWD: md5(this.form.pwd) },
              { emulateJSON: true }
            )
            .then(res => {
              this.form.loading = false;
              if (res.data.flag === "True") {
                if (this.form.checked) {
                  JavascriptCommon.MsgSetCookie(
                    "LOGINCOOKIES",
                    Base64.encode(JSON.stringify(this.form)),
                    7
                  );
                } else {
                  JavascriptCommon.MsgSetCookie("LOGINCOOKIES", "", -1);
                }
                if (res.data.result.accessToken) {
                  JavascriptCommon.SetSysTokenSession(
                    "accessToken",
                    res.data.result.accessToken
                  );
                  JavascriptCommon.SetSysTokenSession(
                    "permitToken",
                    res.data.result.permitToken
                  );
                }
                window.location.reload();
              } else {
                this.$message.error(res.data.message);
              }
            });
        } else {
          return false;
        }
      });
    },
    showSorry() {
      this.$message("此功能暂未开放，敬请期待");
    },
    fullLoginInfo() {
      var cookies = JavascriptCommon.MsgGetCookie("LOGINCOOKIES");
      if (cookies) {
        try {
          this.form = JSON.parse(Base64.decode(cookies));
        } catch (err) {
          //todo
        }
      }
    }
  }
};
</script>

<style>
#login_temp {
  height: 100%;
  background: #324157;
  overflow: auto;
}
#login_temp .login {
  border-radius: 5px;
  margin: 130px auto 40px auto;
  width: 350px;
  padding: 35px 35px 15px;
  box-shadow: 0 0 90px #cac6c6;
}

#login_temp .login .title {
  margin: 0 auto 40px;
  text-align: center;
  color: #ffffff;
}

#login_temp .login .fa {
  color: #707b84;
  padding-right: 10px;
}

#login_temp .login .myInput .el-form-item__content {
  position: relative;
}

#login_temp .login .myInput .el-form-item__content input {
  padding-left: 50px;
}

#login_temp .login .myInput .el-form-item__content .fa {
  position: absolute;
  top: 4px;
  left: 10px;
  z-index: 2;
}

#login_temp .diver {
  width: 460px;
  height: 40px;
  margin: 0 auto;
  border-bottom: 1px solid #ccc;
  position: relative;
  text-align: center;
}
#login_temp .diver span {
  display: block;
  color: #ccc;
  position: absolute;
  line-height: 40px;
  width: 150px;
  border-radius: 20px;
  background: #324157;
  top: 50%;
  left: 50%;
  margin-left: -75px;
}

#login_temp .autho {
  margin: 30px auto;
  text-align: center;
}

#login_temp .autho .autho-item {
  display: inline-block;
  width: 52px;
  height: 52px;
  margin: 0 10px;
  border-radius: 50%;
  color: #fff;
  font-size: smaller;
}

#login_temp .autho .autho-item:hover {
  cursor: pointer;
  box-shadow: 0 0 10px white;
}

#login_temp .autho .autho-item img {
  padding-top: 6px;
  width: 25px;
}
</style>

