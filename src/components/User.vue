<template>
  <div class="content_container user_vue">
    <div class="toolbar">
      <el-form :inline="true">
        <el-form-item>
          <el-input :placeholder="'请输入关键字 ( ' + tableParam.dropdown[tableParam.keycurrent].value + ' )'" v-model="tableParam._keyword" size="small"></el-input>
        </el-form-item>
        <el-form-item>
          <el-dropdown split-button="" type="primary" @command="updateKeyCurrent" @click="tableParam.keyword = tableParam._keyword; tableParam.pageno = 1; query();" size="small">
            <i class="el-icon-search" style="margin-right:5px;"></i>查询
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="item in tableParam.dropdown" :command="item.key" :key="item.key + '_dropdown'">{{item.value}}</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button type="primary" icon="plus" @click="recordFormInit(); recordForm.visible = true; recordForm.flag = true;" size="small">新增</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="records" @selection-change="selectionChange" v-loading="tableParam.loading" @sort-change="sortChange">
      <el-table-column type="selection" />
      <el-table-column prop="ZK_NAME" label="姓名" width="185" sortable="custom" />
      <el-table-column prop="ZK_DEPARTMENT" label="单位" sortable="custom" />
      <el-table-column prop="ZK_EMAIL" label="电子邮箱" sortable="custom" />
      <el-table-column prop="ZK_PHONE" label="电话号码" sortable="custom" />
      <el-table-column prop="ZK_ROLE" label="角色" sortable="custom">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.ZK_ROLE.indexOf('管理员') > -1" type="primary" close-transition="">{{scope.row.ZK_ROLE}}</el-tag>
          <span v-else>{{scope.row.ZK_ROLE}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="EB_LASTMODIFY_DATETIME" label="最后修改" sortable="custom">
        <template slot-scope="scope">
          {{formatterDate(scope.row.EB_LASTMODIFY_DATETIME)}}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template slot-scope="scope">
          <el-button-group>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="recordFormInit(); getUserInfo(scope)"></el-button>
            <el-button class="del" type="primary" icon="el-icon-delete" size="mini" @click="delUserInfo(scope)"></el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <el-col :span="24" class="botton_toolbar">
      <el-button type="danger" :disabled="selection.length === 0" icon="el-icon-delete" @click="batchDelete" size="small">
        批量删除
        <span v-if="selection.length !== 0"> (共{{selection.length}}条)</span>
      </el-button>
      <el-pagination layout="prev, pager, next, jumper, total" :page-size="tableParam.pagesize" :current-page="tableParam.pageno" :total="tableParam.total" @current-change="currentChange" style="float:right;">
      </el-pagination>
    </el-col>
    <el-dialog :title="recordForm.flag ? '新增' : '编辑'" :visible.sync="recordForm.visible">
      <el-form ref="recordForm" class="recordForm" label-width="80px" :model="recordForm.userinfo" :rules="userformRules">
        <el-form-item label="用户名" prop="ZK_NAME">
          <el-input v-model="recordForm.userinfo.ZK_NAME"></el-input>
        </el-form-item>
        <el-form-item label="密　码">
          <el-input type="password" v-model="recordForm.userinfo.ZK_PASSWORD" :placeholder="recordForm.flag ? '新增用户时必须填写密码' : '密码为空时默认不修改'"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="性　别">
              <el-radio-group v-model="recordForm.userinfo.ZK_SEX">
                <el-radio label="男"></el-radio>
                <el-radio label="女"></el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="角　色">
              <el-select v-model="recordForm.userinfo.ZK_ROLE">
                <el-option v-for="item in roles" :label="item.key" :key="item.key" :value="item.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-upload class="avatar-uploader" :action="uploadAction" :show-file-list="false" :before-upload="beforeAvatarUpload" :on-success="handleAvatarSuccess">
              <img class="user_img" v-if="recordForm.userinfo.ZK_HEAD_PORTRAIT" :src="recordForm.userinfo.ZK_HEAD_PORTRAIT" title="点击更换头像" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
          </el-col>
        </el-row>
        <el-form-item label="单　位" prop="ZK_DEPARTMENT">
          <el-input v-model="recordForm.userinfo.ZK_DEPARTMENT" placeholder="请输入所属单位"></el-input>
        </el-form-item>
        <el-form-item label="电子邮箱" prop="ZK_EMAIL">
          <el-input v-model="recordForm.userinfo.ZK_EMAIL" placeholder="请输入电子邮箱 以方便联系"></el-input>
        </el-form-item>
        <el-form-item label="电话号码" prop="ZK_PHONE">
          <el-input v-model="recordForm.userinfo.ZK_PHONE" placeholder="请输入电话号码 以方便联系"></el-input>
        </el-form-item>
        <el-form-item label="备　注">
          <el-input type="textarea" v-model="recordForm.userinfo.ZK_REMARK"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="recordForm.visible = false;">取 消</el-button>
        <el-button type="primary" @click="recordForm.flag ? insertUserInfo() : updateUserInfo()">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import md5 from "js-md5";
export default {
  data() {
    let validateEmail = (rule, value, callback) => {
      setTimeout(() => {
        if (!JavascriptCommon.ValidateEmail(value)) {
          callback(new Error("请输入有效的电子邮箱"));
        } else {
          callback();
        }
      }, 100);
    };
    let validatePhone = (rule, value, callback) => {
      setTimeout(() => {
        if (!JavascriptCommon.ValidatePhone(value)) {
          callback(new Error("请输入有效的电话号码"));
        } else {
          callback();
        }
      }, 100);
    };
    return {
      selection: [],
      records: [],
      roles: [],
      tableParam: {
        keyword: "",
        _keyword: "",
        prop: "",
        order: "",
        pagesize: 15,
        pageno: 1,
        total: 0,
        loading: false,
        dropdown: [
          { key: "ZK_NAME", value: "姓名" },
          { key: "ZK_DEPARTMENT", value: "单位" },
          { key: "ZK_EMAIL", value: "电子邮箱" },
          { key: "ZK_PHONE", value: "电话号码" }
        ],
        keycurrent: 0
      },
      recordForm: {
        flag: true,
        userinfo: {
          ZK_ID: "",
          ZK_PASSWORD: "",
          ZK_NAME: "",
          ZK_DEPARTMENT: "",
          ZK_EMAIL: "",
          ZK_PHONE: "",
          ZK_SEX: "男",
          ZK_HEAD_PORTRAIT: "",
          ZK_ROLE: "",
          ZK_REMARK: ""
        },
        visible: false,
        index: -1
      },
      userformRules: {
        ZK_NAME: [
          { required: true, message: "请输入账号", trigger: "blur" },
          { min: 3, max: 32, message: "长度在 3 到 32 个字符", trigger: "blur" }
        ],
        ZK_DEPARTMENT: [
          { required: true, message: "请输入所属单位", trigger: "blur" }
        ],
        ZK_EMAIL: [{ validator: validateEmail, trigger: "blur" }],
        ZK_PHONE: [{ validator: validatePhone, trigger: "blur" }]
      },
      uploadAction: "Http/Msg/SetupServer.ashx?method=Backend_UploadUserAvatar"
    };
  },
  created() {
    this._recordForm = JSON.stringify(this.recordForm);
    this.query();
    this.bindRole();
  },
  methods: {
    query() {
      this.tableParam.loading = true;
      this.$http
        .get(
          "Http/Msg/UserServer.ashx?method=Backend_GetUserList",
          {
            params: {
              KEYWORD: this.tableParam.keyword,
              TYPE: this.tableParam.dropdown[this.tableParam.keycurrent].key,
              PROP: this.tableParam.prop,
              ORDER: this.tableParam.order,
              PAGESIZE: this.tableParam.pagesize,
              PAGENO: this.tableParam.pageno
            }
          },
          { emulateJSON: true }
        )
        .then(res => {
          this.tableParam.loading = false;
          if (res.data.flag === "True") {
            this.tableParam.total = parseInt(res.data.message);
            this.records = res.data.result;
          }
        });
    },
    updateKeyCurrent(command) {
      this.tableParam.dropdown.forEach((item, index) => {
        if (item.key === command) {
          this.tableParam.keycurrent = index;
          return;
        }
      });
    },
    selectionChange(sels) {
      this.selection = sels;
    },
    recordFormInit() {
      if (this.$refs["recordForm"]) {
        this.$refs["recordForm"].resetFields();
      }
      this.recordForm = JSON.parse(this._recordForm);
    },
    currentChange(currentPage) {
      if (this.tableParam.pageno !== currentPage) {
        this.tableParam.pageno = currentPage;
        this.query();
      }
    },
    sortChange(s) {
      if (s.order) {
        this.tableParam.prop = s.prop;
        this.tableParam.order = s.order;
        this.tableParam.pageno = 1;
        this.query();
      }
    },
    formatterDate(value) {
      return JavascriptCommon.ChangeDateFormat_hhmmss(value, "-");
    },
    beforeAvatarUpload(file) {
      let isImg = false;
      let isLt2M = file.size / 1024 / 1024 < 2;
      ["image/gif", "image/jpeg", "image/png"].forEach(item => {
        if (file.type === item) {
          isImg = true;
        }
      });
      if (!isImg) {
        this.$message.error("上传头像图片只能是 JPG 、GIF或者PNG格式!");
      }
      if (!isLt2M) {
        this.$message.error("上传头像图片大小不能超过 2MB!");
      }
      return isImg && isLt2M;
    },
    handleAvatarSuccess(res, file) {
      if (res.flag === "True") {
        this.recordForm.userinfo.ZK_HEAD_PORTRAIT = res.result;
      }
    },
    bindRole() {
      this.$http
        .get("Http/Msg/HomeServer.ashx?method=Backend_BindRoleList")
        .then(res => {
          if (res.data.flag === "True") {
            this.roles = [];
            res.data.result.forEach(item => {
              this.roles.push({ value: item.ZK_ID, key: item.ZK_ROLE });
            });
          }
        });
    },
    getUserInfo(scope) {
      this.$http
        .get(
          "Http/Msg/UserServer.ashx?method=Backend_GetUserInfo",
          { params: { UID: scope.row.ZK_ID } },
          { emulateJSON: true }
        )
        .then(res => {
          if (res.data.flag === "True") {
            res.data.result.ZK_PASSWORD = "";
            this.recordForm.userinfo = res.data.result;
            this.recordForm.flag = false;
            this.recordForm.visible = true;
            this.recordForm.index = scope.$index;
          }
        });
    },
    delUserInfo(scope) {
      this.$confirm("确认删除该记录吗?", "提示", { type: "warning" })
        .then(() => {
          this.$http
            .post(
              "Http/Msg/UserServer.ashx?method=Backend_DeleteUser",
              { IDS: scope.row.ZK_ID },
              { emulateJSON: true }
            )
            .then(res => {
              if (res.data.flag === "True") {
                this.records.splice(scope.$index, 1);
                this.$notify({
                  title: "成功",
                  message: "已成功删除用户" + scope.row.ZK_NAME,
                  type: "success"
                });
              }
            });
        })
        .catch(() => {});
    },
    batchDelete() {
      let ids = new Array();
      if (this.selection.length === 0) {
        this.$message.error("请先选中需要删除的选项");
        return;
      }
      this.selection.forEach(item => {
        ids.push(item.ZK_ID);
      });
      this.$confirm("确认删除所选的记录吗?", "提示", { type: "warning" })
        .then(() => {
          this.$http
            .post(
              "Http/Msg/UserServer.ashx?method=Backend_DeleteUser",
              { IDS: ids.join(",") },
              { emulateJSON: true }
            )
            .then(res => {
              if (res.data.flag === "True") {
                this.$notify({
                  title: "成功",
                  message: "成功删除多条记录(一秒后将自动刷新页面)",
                  type: "success"
                });
                setTimeout(() => {
                  window.location.reload();
                }, 1200);
              }
            });
        })
        .catch(() => {});
    },
    insertUserInfo() {
      this.$refs["recordForm"].validate(valid => {
        if (valid) {
          this.recordForm.userinfo.ZK_PASSWORD_MD5 = md5(
            this.recordForm.userinfo.ZK_PASSWORD
          );
          this.$http
            .post(
              "Http/Msg/UserServer.ashx?method=Backend_InsertUser",
              this.recordForm.userinfo,
              { emulateJSON: true }
            )
            .then(res => {
              if (res.data.flag === "True") {
                this.records.unshift(
                  JSON.parse(JSON.stringify(this.recordForm.userinfo))
                );
                this.$notify({
                  title: "成功",
                  message:
                    "新增用户:" +
                    this.recordForm.userinfo.ZK_NAME +
                    "(一秒后将自动刷新页面)",
                  type: "success"
                });
                this.recordFormInit();
                setTimeout(() => {
                  window.location.reload();
                }, 1200);
              } else {
                this.$message.warning(res.data.message);
              }
            });
        } else {
          that.$message.warning("请填写数据有效性");
        }
      });
    },
    updateUserInfo() {
      this.$refs["recordForm"].validate(valid => {
        if (valid) {
          if (this.recordForm.userinfo.ZK_PASSWORD) {
            this.recordForm.userinfo.ZK_PASSWORD = md5(
              this.recordForm.userinfo.ZK_PASSWORD
            );
          }
          this.$http
            .post(
              "Http/Msg/UserServer.ashx?method=Backend_UpdateUser",
              this.recordForm.userinfo,
              { emulateJSON: true }
            )
            .then(res => {
              if (res.data.flag === "True") {
                let form = JSON.parse(JSON.stringify(this.recordForm.userinfo));
                this.roles.forEach(item => {
                  if (item.value == this.recordForm.userinfo.ZK_ROLE) {
                    form.ZK_ROLE = item.key;
                  }
                });
                this.records[this.recordForm.index].ZK_NAME = form.ZK_NAME;
                this.records[this.recordForm.index].ZK_DEPARTMENT =
                  form.ZK_DEPARTMENT;
                this.records[this.recordForm.index].ZK_EMAIL = form.ZK_EMAIL;
                this.records[this.recordForm.index].ZK_PHONE = form.ZK_PHONE;
                this.records[this.recordForm.index].ZK_ROLE = form.ZK_ROLE;
                this.$notify({
                  title: "成功",
                  message: "更新用户信息：" + this.recordForm.userinfo.ZK_NAME,
                  type: "success"
                });
                this.recordFormInit();
              }
            });
        } else {
          that.$message.warning("请填写数据有效性");
        }
      });
    }
  }
};
</script>

<style>
.user_vue .toolbar {
  width: 100%;
}
.user_vue .del:hover {
  color: #fff;
  background-color: #ff4949;
  border-color: #ff4949;
}
.user_vue .botton_toolbar {
  border: 1px solid #f2f2f2;
  box-shadow: 0 0 5px #f2f2f2;
  padding: 10px;
  margin: 10px 0 20px 0;
}
.user_vue .botton_toolbar:hover {
  background: #f2f2f2;
  box-shadow: none;
}
.user_vue .avatar-uploader {
  text-align: center;
}
.user_vue .avatar-uploader .user_img {
  max-width: 100px;
  max-width: 100px;
}
.user_vue .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
}
.user_vue .avatar-uploader-icon:hover {
  border-color: #20a0ff;
}
.user_vue .avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>