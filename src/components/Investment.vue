<template>
    <div id="Investment_vue">
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
            <el-button disabled type="primary" icon="plus" @click="recordFormInit(); recordForm.visible = true; recordForm.flag = true;" size="small">新增</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="records" @selection-change="selectionChange" v-loading="tableParam.loading" @sort-change="sortChange">
        <el-table-column type="selection"/>
        <el-table-column prop="ZK_TITLE" label="项目" sortable="custom"/>
        <el-table-column prop="ZK_LOGO" label="LOGO">
          <template slot-scope="scope">
            <img class="column_logo" :src="scope.row.ZK_LOGO" alt="暂无图片" />
          </template>
        </el-table-column>
        <el-table-column prop="ZK_ROUNDS" label="轮次" sortable="custom"/>
        <el-table-column prop="ZK_MONEY" label="融资金额" sortable="custom"/>
        <el-table-column prop="ZK_TIME" label="融资时间" sortable="custom"/>
        <el-table-column prop="ZK_INVESTORS" label="投资机构" sortable="custom"/>
        <el-table-column prop="ZK_ISSYNC" label="是否同步" sortable="custom">
          <template slot-scope="scope">
            <el-tag type="warning" v-if="scope.row.ZK_ISSYNC === '0'">未同步</el-tag>
            <el-tag type="success" v-if="scope.row.ZK_ISSYNC === '1'">已同步</el-tag>
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
      <el-dialog :title="recordForm.flag ? '新增' : '编辑'" :visible="recordForm.visible" width="80%" :show-close="false">
        <el-form ref="recordForm" class="recordForm" label-width="80px" :model="recordForm.record" :rules="recordformRules">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="名　称" prop="ZK_TITLE">
                <el-input v-model="recordForm.record.ZK_TITLE" placeholder="请输入项目名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="LOGO" prop="ZK_LOGO">
                <el-col :span="17">
                  <el-input v-model="recordForm.record.ZK_LOGO" placeholder="请上传LOGO或填写LOGO路径"></el-input>
                </el-col>
                <el-col :span="7">
                  <el-button size="small" type="primary" disabled>点击上传</el-button>
                </el-col>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="行　业" prop="ZK_INDUSTRY">
                <el-input v-model="recordForm.record.ZK_INDUSTRY" placeholder="请输入所属行业"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="轮　次" prop="ZK_ROUNDS">
                <el-input v-model="recordForm.record.ZK_ROUNDS" placeholder="请输入所属轮次"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="金　额" prop="ZK_MONEY">
                <el-input v-model="recordForm.record.ZK_MONEY" placeholder="请输入融资金额"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="时　间" prop="ZK_TIME">
                <el-input v-model="recordForm.record.ZK_TIME" placeholder="请输入融资时间"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="投资机构" prop="ZK_INVESTORS">
                <el-input v-model="recordForm.record.ZK_INVESTORS" placeholder="请输入投资机构"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="简　介">
                <vue-html5-editor :content="recordForm.record.ZK_DESC" :height="300" @change="updateContent"></vue-html5-editor>
              </el-form-item>
            </el-col>
            <div :id="hidEditor" v-show="false" v-html="recordForm.record.ZK_DESC"></div>
          </el-row>
        </el-form>      
        <div slot="footer" class="dialog-footer">
          <el-button @click="recordForm.visible = false;">取 消</el-button>
          <el-button type="primary" @click="recordForm.flag ? null : updateRecord()">保 存</el-button>
          <el-button type="primary" disabled v-if="recordForm.record.ZK_ISSYNC!=='1'"><i class="el-icon-upload"></i> 同 步</el-button>
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
        pagesize: 25,
        pageno: 1,
        total: 0,
        loading: false,
        dropdown: [
          { key: "ZK_TITLE", value: "项目" },
          { key: "ZK_INDUSTRY", value: "行业" },
          { key: "ZK_ROUNDS", value: "轮次" },
          { key: "ZK_MONEY", value: "金额" },
          { key: "ZK_TIME", value: "时间" },
          { key: "ZK_INVESTORS", value: "投资机构" }
        ],
        keycurrent: 0
      },
      recordForm: {
        flag: true,
        record: {},
        visible: false,
        index: -1
      },
      recordformRules: {
        ZK_TITLE: [
          { required: true, message: "请输入机构名称", trigger: "blur" }
        ],
        ZK_LOGO: [
          { required: true, message: "请输入LOGO地址", trigger: "blur" }
        ],
        ZK_INDUSTRY: [
          { required: true, message: "请输入项目所属行业", trigger: "blur" }
        ],
        ZK_ROUNDS: [
          { required: true, message: "请输入融资轮次", trigger: "blur" }
        ],
        ZK_MONEY: [
          { required: true, message: "请输入融资总额", trigger: "blur" }
        ],
        ZK_TIME: [
          { required: true, message: "请输入获得融资时间", trigger: "blur" }
        ],
        ZK_INVESTORS: [
          { required: true, message: "请输入投资机构", trigger: "blur" }
        ]
      },
      hidEditor: "h_" + JavascriptCommon.Guid(),
      targetForm: {
        record: [],
        visible: false
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
          "Http/Msg/InvestmentServer.ashx?method=Backend_GetInvestmentList",
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
      this.$confirm("是否删除该记录", "删除提示", { type: "warning" })
        .then(function() {
          that.$http
            .post(
              "Http/Msg/InvestmentServer.ashx?method=Backend_DeleteInvestment",
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
        .$confirm("是否删除选中的记录", "删除提示", { type: "warning" })
        .then(function() {
          that.$http
            .post(
              "Http/Msg/InvestmentServer.ashx?method=Backend_DeleteInvestment",
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
    updateContent: function(_content) {
      this.recordForm.record.ZK_DESC = _content;
    },
    getRecord: function(scope) {
      var that = this;
      this.$http
        .get(
          "Http/Msg/InvestmentServer.ashx?method=Backend_GetInvestmentDetail",
          { params: { UID: scope.row.ZK_ID } },
          { emulateJSON: true }
        )
        .then(function(res) {
          if (res.data.flag === "True") {
            this.recordForm.record = res.data.result;
            this.recordForm.flag = false;
            this.recordForm.visible = true;
            this.recordForm.index = scope.$index;
          }
        });
    },
    updateRecord: function() {
      var that = this;
      that.$refs["recordForm"].validate(function(valid) {
        if (valid) {
          if (!that.recordForm.record.ZK_DESC) {
            that.$message.warning("请填写机构详情");
            return;
          }
          that.$http
            .post(
              "Http/Msg/InvestmentServer.ashx?method=Backend_UpdateInvestment",
              that.recordForm.record,
              { emulateJSON: true }
            )
            .then(function(res) {
              if (res.data.flag === "True") {
                var form = JSON.parse(JSON.stringify(that.recordForm.record));
                that.records[that.recordForm.index].ZK_TITLE = form.ZK_TITLE;
                that.records[that.recordForm.index].ZK_LOGO = form.ZK_LOGO;
                that.records[that.recordForm.index].ZK_INDUSTRY =
                  form.ZK_INDUSTRY;
                that.records[that.recordForm.index].ZK_ROUNDS = form.ZK_ROUNDS;
                that.records[that.recordForm.index].ZK_MONEY = form.ZK_MONEY;
                that.records[that.recordForm.index].ZK_TIME = form.ZK_TIME;
                that.records[that.recordForm.index].ZK_INVESTORS =
                  form.ZK_INVESTORS;
                that.records[that.recordForm.index].ZK_DESC = form.ZK_DESC;
                that.$notify({
                  title: "成功",
                  message: "保存投融事件记录成功",
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
#Investment_vue .botton_toolbar {
  border: 1px solid #f2f2f2;
  box-shadow: 0 0 5px #f2f2f2;
  padding: 10px;
  margin: 10px 0 20px 0;
}
#Investment_vue .botton_toolbar:hover {
  background: #f2f2f2;
  box-shadow: none;
}
#Investment_vue .column_logo {
  width: 46px;
  height: auto;
  display: inherit;
  margin: 6px 0;
  border-radius: 4px;
}
</style>
