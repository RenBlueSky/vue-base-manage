<template>
  <div id="Role_vue">
    <div class="toolbar">
      <el-form :inline="true">
        <el-form-item>
          <el-input :placeholder="'请输入关键字 ( ' + tableParam.dropdown[tableParam.keycurrent].value + ' )'" v-model="tableParam._keyword" @keyup.enter="" size="small"></el-input>
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
        <el-form-item>
          <el-alert title="谨慎操作，尽量避免删除或修改正在使用的角色，防止不可逆情况的发生" type="warning" :show-icon="true" style="line-height:20px; padding-right:25px;"></el-alert>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="records" @selection-change="selectionChange" v-loading="tableParam.loading" @sort-change="sortChange">
      <el-table-column type="selection"/>
      <el-table-column prop="ZK_ROLE" label="角色" sortable="custom"/>
      <el-table-column prop="ZK_DESC" label="描述" sortable="custom"/>
      <el-table-column prop="ZK_LEAVE" label="等级" sortable="custom"/>
      <el-table-column prop="ZK_ISADMIN" label="管理权限" sortable="custom">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.ZK_ISADMIN === '1'" type="primary"
            close-transition="">具备</el-tag>
          <span v-else="">不具备</span>
        </template>
      </el-table-column>
      <el-table-column prop="EB_CREATE_DATETIME" label="创建时间" sortable="custom">
        <template slot-scope="scope">
          {{formatterDate(scope.row.EB_CREATE_DATETIME)}}
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
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="recordFormInit(); getRecord(scope)"></el-button>
            <el-button class="del" type="primary" icon="el-icon-delete" size="mini" @click="delRecord(scope)"></el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <el-col :span="24" class="botton_toolbar">
      <el-button type="danger" :disabled="selection.length === 0" icon="el-icon-delete" @click="batchDelete" size="small">
        批量删除<span v-if="selection.length !== 0"> (共{{selection.length}}条)</span>
      </el-button>
      <el-pagination layout="prev, pager, next, jumper, total" :page-size="tableParam.pagesize" :current-page="tableParam.pageno" :total="tableParam.total" @current-change="currentChange" style="float:right;">
      </el-pagination>
    </el-col>
    <el-dialog :title="recordForm.flag ? '新增' : '编辑'" :visible.sync="recordForm.visible">
      <el-form ref="recordForm" class="recordForm" label-width="80px" :model="recordForm.record" :rules="recordformRules">
        <el-form-item label="角　色" prop="ZK_ROLE">
          <el-input v-model="recordForm.record.ZK_ROLE" placeholder="请输入角色"></el-input>
        </el-form-item>
        <el-form-item label="等　级" prop="ZK_LEAVE">
          <el-input-number v-model="recordForm.record.ZK_LEAVE" placeholder="请输入等级（数字越小等级越靠前）" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="管　理" prop="ZK_ISADMIN">
          <el-switch v-model="recordForm.isadmin"></el-switch>
        </el-form-item>
        <el-form-item label="描　述" prop="ZK_DESC">
          <el-input v-model="recordForm.record.ZK_DESC" placeholder="请输入描述"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="recordForm.visible = false;">取 消</el-button>
        <el-button type="primary" @click="recordForm.flag ? insertRecord() : updateRecord()">保 存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      selection: [],
      records: [],
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
          { key: "ZK_ROLE", value: "角色" },
          { key: "ZK_DESC", value: "描述" }
        ],
        keycurrent: 0
      },
      recordForm: {
        flag: true,
        record: {
          ZK_ID: "",
          ZK_ROLE: "",
          ZK_DESC: "",
          ZK_LEAVE: "",
          ZK_ISADMIN: "0"
        },
        visible: false,
        isadmin: false,
        index: -1
      },
      recordformRules: {
        ZK_ROLE: [{ required: true, message: "请输入角色", trigger: "blur" }],
        ZK_DESC: [{ required: true, message: "请输入描述", trigger: "blur" }]
      }
    };
  },
  created: function() {
    this._recordForm = JSON.stringify(this.recordForm);
    this.query();
  },
  methods: {
    query: function() {
      this.tableParam.loading = true;
      this.$http
        .get(
          "Http/Msg/RoleServer.ashx?method=Backend_GetRoleList",
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
        .then(function(res) {
          this.tableParam.loading = false;
          if (res.data.flag === "True") {
            this.tableParam.total = parseInt(res.data.message);
            this.records = res.data.result;
          }
        });
    },
    updateKeyCurrent: function(command) {
      var that = this;
      that.tableParam.dropdown.forEach(function(item, index) {
        if (item.key === command) {
          that.tableParam.keycurrent = index;
          return;
        }
      });
    },
    selectionChange: function(sels) {
      this.selection = sels;
    },
    recordFormInit: function() {
      if (this.$refs["recordForm"]) {
        this.$refs["recordForm"].resetFields();
      }
      this.recordForm = JSON.parse(this._recordForm);
    },
    currentChange: function(currentPage) {
      if (this.tableParam.pageno !== currentPage) {
        this.tableParam.pageno = currentPage;
        this.query();
      }
    },
    sortChange: function(s) {
      if (s.order) {
        this.tableParam.prop = s.prop;
        this.tableParam.order = s.order;
        this.tableParam.pageno = 1;
        this.query();
      }
    },
    formatterDate: function(value) {
      return JavascriptCommon.ChangeDateFormat_hhmmss(value, "-");
    },
    dateFormatter: function(date) {
      if (typeof data != "object") {
        date = new Date(date);
      }
      return (
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1) +
        "-" +
        date.getDate() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        ":" +
        date.getSeconds()
      );
    },
    delRecord: function(scope) {
      var that = this;
      that
        .$confirm(
          "谨慎操作，该删除可能带来不可逆后果，请先检查该角色不被引用",
          "角色删除提醒",
          { type: "warning" }
        )
        .then(function() {
          that.$http
            .post(
              "Http/Msg/RoleServer.ashx?method=Backend_DeleteRole",
              { IDS: scope.row.ZK_ID },
              { emulateJSON: true }
            )
            .then(function(res) {
              if (res.data.flag === "True") {
                that.records.splice(scope.$index, 1);
                that.$notify({
                  title: "成功",
                  message: "已成功删除一条记录",
                  type: "success"
                });
              }
            });
        })
        .catch(function() {});
    },
    batchDelete: function() {
      var that = this,
        ids = new Array();
      if (that.selection.length === 0) {
        that.$message.error("请先选中需要删除的选项");
        return;
      }
      that.selection.forEach(function(item) {
        ids.push(item.ZK_ID);
      });
      that
        .$confirm(
          "谨慎操作，该删除可能带来不可逆后果，请先检查该角色不被引用",
          "角色删除提醒",
          { type: "warning" }
        )
        .then(function() {
          that.$http
            .post(
              "Http/Msg/RoleServer.ashx?method=Backend_DeleteRole",
              { IDS: ids.join(",") },
              { emulateJSON: true }
            )
            .then(function(res) {
              if (res.data.flag === "True") {
                that.$notify({
                  title: "成功",
                  message: "成功删除多条记录(一秒后将自动刷新页面)",
                  type: "success"
                });
                setTimeout(function() {
                  window.location.reload();
                }, 1200);
              }
            });
        })
        .catch(function() {});
    },
    getRecord: function(scope) {
      var that = this;
      this.$http
        .get(
          "Http/Msg/RoleServer.ashx?method=Backend_GetRoleDetail",
          { params: { UID: scope.row.ZK_ID } },
          { emulateJSON: true }
        )
        .then(function(res) {
          if (res.data.flag === "True") {
            this.recordForm.record = res.data.result;
            this.recordForm.flag = false;
            this.recordForm.visible = true;
            this.recordForm.index = scope.$index;
            this.recordForm.isadmin = res.data.result.ZK_ISADMIN == "1";
          }
        });
    },
    insertRecord: function() {
      var that = this;
      that.$refs["recordForm"].validate(function(valid) {
        if (valid) {
          that.recordForm.record.ZK_ISADMIN = that.recordForm.isadmin
            ? "1"
            : "0";
          that.$http
            .post(
              "Http/Msg/RoleServer.ashx?method=Backend_InsertRole",
              that.recordForm.record,
              { emulateJSON: true }
            )
            .then(function(res) {
              if (res.data.flag === "True") {
                that.records.unshift(
                  JSON.parse(JSON.stringify(that.recordForm.record))
                );
                that.$notify({
                  title: "成功",
                  message: "新增成功(一秒后将自动刷新页面)",
                  type: "success"
                });
                that.recordFormInit();
                setTimeout(function() {
                  window.location.reload();
                }, 1200);
              }
            });
        } else {
          that.$message.warning("请填写数据有效性");
        }
      });
    },
    updateRecord: function() {
      var that = this;
      that.$refs["recordForm"].validate(function(valid) {
        if (valid) {
          that.recordForm.record.ZK_ISADMIN = that.recordForm.isadmin
            ? "1"
            : "0";
          that.$http
            .post(
              "Http/Msg/RoleServer.ashx?method=Backend_UpdateRole",
              that.recordForm.record,
              { emulateJSON: true }
            )
            .then(function(res) {
              if (res.data.flag === "True") {
                var form = JSON.parse(JSON.stringify(that.recordForm.record));
                that.records[that.recordForm.index].ZK_ROLE = form.ZK_ROLE;
                that.records[that.recordForm.index].ZK_DESC = form.ZK_DESC;
                that.records[that.recordForm.index].ZK_LEAVE = form.ZK_LEAVE;
                that.records[that.recordForm.index].ZK_ISADMIN =
                  form.ZK_ISADMIN;
                that.$notify({
                  title: "成功",
                  message: "更新角色成功",
                  type: "success"
                });
                that.recordFormInit();
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
#Role_vue .botton_toolbar {
  border: 1px solid #f2f2f2;
  box-shadow: 0 0 5px #f2f2f2;
  padding: 10px;
  margin: 10px 0 20px 0;
}
#Role_vue .botton_toolbar:hover {
  background: #f2f2f2;
  box-shadow: none;
}
</style>