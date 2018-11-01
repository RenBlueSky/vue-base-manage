<template>
  <div id="Permit_vue">
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
          <el-alert title="谨慎操作，尽量避免删除或修改正在使用的权限，防止不可逆情况的发生" type="warning" :show-icon="true" style="line-height:20px; padding-right:25px;"></el-alert>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="records" @selection-change="selectionChange" v-loading="tableParam.loading" @sort-change="sortChange">
      <el-table-column type="selection"/>
      <el-table-column prop="ZK_ID" label="主键" sortable="custom"/>
      <el-table-column prop="ZK_PATH" label="路径" sortable="custom"/>
      <el-table-column prop="ZK_NAME" label="名称" sortable="custom"/>
      <el-table-column prop="ZK_COMPONENT" label="组件" sortable="custom"/>
      <el-table-column prop="ZK_ISHIDDEN" label="状态" sortable="custom">
        <template slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.ZK_ISHIDDEN === '0'">显示</el-tag>
          <el-tag type="success" v-if="scope.row.ZK_ISHIDDEN === '1'">隐藏</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ZK_ICON" label="图标" sortable="custom"/>
      <el-table-column prop="ZK_ISLEAF" label="类型" sortable="custom">
        <template slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.ZK_ISLEAF === '1'">叶子节点</el-tag>
          <el-tag type="success" v-if="scope.row.ZK_ISLEAF === '0'">普通节点</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ZK_PARENT" label="父级" sortable="custom"/>
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
        <el-form-item label="主　键" prop="ZK_ID">
          <el-input v-model="recordForm.record.ZK_ID" placeholder="请输入主键" :disabled="!recordForm.flag"></el-input>
        </el-form-item>
        <el-form-item label="路　径" prop="ZK_PATH">
          <el-input v-model="recordForm.record.ZK_PATH" placeholder="请输入路径"></el-input>
        </el-form-item>
        <el-form-item label="名　称" prop="ZK_NAME">
          <el-input v-model="recordForm.record.ZK_NAME" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="组　件" prop="ZK_COMPONENT">
          <el-input v-model="recordForm.record.ZK_COMPONENT" placeholder="请输入组件（详情询问前台）"></el-input>
        </el-form-item>
        <el-form-item label="隐　藏">
          <el-switch v-model="recordForm.ishidden"></el-switch>
          <i :class="recordForm.record.ZK_ICON" style="padding-left:20px;"></i>
        </el-form-item>
        <el-form-item label="图　标">
          <el-input v-model="recordForm.record.ZK_ICON" placeholder="请输入图标"></el-input>
        </el-form-item>
        <el-form-item label="类　型">
          <el-radio class="radio" v-model="recordForm.record.ZK_ISLEAF" label="1">叶子节点</el-radio>
          <el-radio class="radio" v-model="recordForm.record.ZK_ISLEAF" label="0">普通节点</el-radio>
        </el-form-item>
        <el-form-item label="权　重" prop="ZK_SORT">
          <el-input-number v-model="recordForm.record.ZK_SORT" placeholder="请输入权重（数字越小等级越靠前）"></el-input-number>
        </el-form-item>
        <el-form-item label="父　级">
          <el-input v-model="recordForm.record.ZK_PARENT" placeholder="请输入父级主键"></el-input>
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
          { key: "ZK_ID", value: "主键" },
          { key: "ZK_PATH", value: "路径" },
          { key: "ZK_COMPONENT", value: "组件" },
          { key: "ZK_NAME", value: "名称" }
        ],
        keycurrent: 0
      },
      recordForm: {
        flag: true,
        record: {
          ZK_ID: "",
          ZK_PATH: "",
          ZK_COMPONENT: "",
          ZK_NAME: "",
          ZK_ISHIDDEN: "",
          ZK_ICON: "",
          ZK_ISLEAF: "1",
          ZK_PARENT: "",
          ZK_SORT: "",
          EB_ISDELETE: ""
        },
        visible: false,
        ishidden: false,
        index: -1
      },
      recordformRules: {
        ZK_ID: [{ required: true, message: "请输入主键", trigger: "blur" }],
        ZK_PATH: [{ required: true, message: "请输入路径", trigger: "blur" }],
        ZK_NAME: [{ required: true, message: "请输入名称", trigger: "blur" }],
        ZK_COMPONENT: [
          { required: true, message: "请输入组件", trigger: "blur" }
        ]
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
          "Http/Msg/PermitServer.ashx?method=Backend_GetPermitList",
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
          "除非确保安全，否则我们不建议您进行此操作，一切后果自行负责！",
          "权限删除警告",
          { type: "warning" }
        )
        .then(function() {
          that.$http
            .post(
              "Http/Msg/PermitServer.ashx?method=Backend_DeletePermit",
              { IDS: scope.row.ZK_ID },
              { emulateJSON: true }
            )
            .then(function(res) {
              if (res.data.flag === "True") {
                that.records.splice(scope.$index, 1);
                that.$notify({
                  title: "成功",
                  message: "已成功删除一条权限信息",
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
          "除非确保安全，否则我们不建议您进行此操作，一切后果自行负责！",
          "权限删除警告",
          { type: "warning" }
        )
        .then(function() {
          that.$http
            .post(
              "Http/Msg/PermitServer.ashx?method=Backend_DeletePermit",
              { IDS: ids.join(",") },
              { emulateJSON: true }
            )
            .then(function(res) {
              if (res.data.flag === "True") {
                that.$notify({
                  title: "成功",
                  message: "已成功删除多条信息(一秒后将自动刷新页面)",
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
          "Http/Msg/PermitServer.ashx?method=Backend_GetPermitDetail",
          { params: { UID: scope.row.ZK_ID } },
          { emulateJSON: true }
        )
        .then(function(res) {
          if (res.data.flag === "True") {
            this.recordForm.record = res.data.result;
            this.recordForm.flag = false;
            this.recordForm.visible = true;
            this.recordForm.index = scope.$index;
            this.recordForm.ishidden = res.data.result.ZK_ISHIDDEN == "1";
          }
        });
    },
    insertRecord: function() {
      var that = this;
      that.$refs["recordForm"].validate(function(valid) {
        if (valid) {
          that.recordForm.record.ZK_ISHIDDEN = that.recordForm.ishidden
            ? "1"
            : "0";
          that.$http
            .post(
              "Http/Msg/PermitServer.ashx?method=Backend_InsertPermit",
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
          that.recordForm.record.ZK_ISHIDDEN = that.recordForm.ishidden
            ? "1"
            : "0";
          that.$http
            .post(
              "Http/Msg/PermitServer.ashx?method=Backend_UpdatePermit",
              that.recordForm.record,
              { emulateJSON: true }
            )
            .then(function(res) {
              if (res.data.flag === "True") {
                var form = JSON.parse(JSON.stringify(that.recordForm.record));
                that.records[that.recordForm.index].ZK_ICON = form.ZK_ICON;
                that.records[that.recordForm.index].ZK_PATH = form.ZK_PATH;
                that.records[that.recordForm.index].ZK_COMPONENT =
                  form.ZK_COMPONENT;
                that.records[that.recordForm.index].ZK_NAME = form.ZK_NAME;
                that.records[that.recordForm.index].ZK_ISHIDDEN =
                  form.ZK_ISHIDDEN;
                that.records[that.recordForm.index].ZK_ISLEAF = form.ZK_ISLEAF;
                that.records[that.recordForm.index].ZK_PARENT = form.ZK_PARENT;
                that.$notify({
                  title: "成功",
                  message: "更新权限成功",
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
#Permit_vue .botton_toolbar {
  border: 1px solid #f2f2f2;
  box-shadow: 0 0 5px #f2f2f2;
  padding: 10px;
  margin: 10px 0 20px 0;
}
#Permit_vue .botton_toolbar:hover {
  background: #f2f2f2;
  box-shadow: none;
}
</style>