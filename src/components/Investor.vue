<template>
    <div id="Investor_vue">
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
        <el-table-column prop="ZK_TITLE" label="机构/公司" sortable="custom"/>
        <el-table-column prop="ZK_LOGO" label="LOGO">
          <template slot-scope="scope">
            <img class="column_logo" :src="scope.row.ZK_LOGO" alt="暂无图片" />
          </template>
        </el-table-column>
        <el-table-column prop="ZK_ISSYNC" label="是否同步" sortable="custom">
          <template slot-scope="scope">
            <el-tag type="warning" v-if="scope.row.ZK_ISSYNC === '0'">未同步</el-tag>
            <el-tag type="success" v-if="scope.row.ZK_ISSYNC === '1'">已同步</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="EB_CREATE_DATETIME" label="收录时间" sortable="custom">
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
        <el-button type="warning" :disabled="selection.length === 0" icon="el-icon-upload" @click="batchSync" size="small">
          批量同步<span v-if="selection.length !== 0"> (共{{selection.length}}条)</span>
        </el-button>
        <el-pagination layout="prev, pager, next, jumper, total" :page-size="tableParam.pagesize" :current-page="tableParam.pageno" :total="tableParam.total" @current-change="currentChange" style="float:right;">
        </el-pagination>
      </el-col>
      <el-dialog :title="recordForm.flag ? '新增' : '编辑'" :visible="recordForm.visible" width="80%" :show-close="false">
        <el-form ref="recordForm" class="recordForm" label-width="80px" :model="recordForm.record.ZK_INVESTOR" :rules="recordformRules">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="名　称" prop="ZK_TITLE">
                <el-input v-model="recordForm.record.ZK_INVESTOR.ZK_TITLE" placeholder="请输入机构名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="LOGO" prop="ZK_LOGO">
                <el-col :span="17">
                  <el-input v-model="recordForm.record.ZK_INVESTOR.ZK_LOGO" placeholder="请上传LOGO或填写LOGO路径"></el-input>
                </el-col>
                <el-col :span="7">
                  <el-button size="small" type="primary" disabled>点击上传</el-button>
                </el-col>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="简　介">
                <vue-html5-editor :content="recordForm.record.ZK_INVESTOR.ZK_DESC" :height="300" @change="updateContent"></vue-html5-editor>
              </el-form-item>
            </el-col>
            <div :id="hidEditor" v-show="false" v-html="recordForm.record.ZK_INVESTOR.ZK_DESC"></div>
          </el-row>
        </el-form>
        <el-tabs value="first">
          <el-tab-pane label="机构团队" name="first">
            <el-table :data="recordForm.record.ZK_INVESTOR_TEAMS" stripe>
              <el-table-column sortable prop="ZK_AVATAR" label="头像">
                <template slot-scope="scope">
                  <img class="column_logo" :src="scope.row.ZK_AVATAR" :alt="scope.row.ZK_NAME" />
                </template>
              </el-table-column>
              <el-table-column sortable prop="ZK_NAME" label="姓名"/>
              <el-table-column sortable prop="ZK_POSITION" label="职位"/>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="投资案例" name="second">
            <el-table :data="recordForm.record.ZK_INVESTOR_CASES" stripe>
              <el-table-column sortable prop="ZK_TITLE" label="公司/项目"/>
              <el-table-column sortable prop="ZK_INDUSTRY" label="行业"/>
              <el-table-column sortable prop="ZK_MONEY" label="金额"/>
              <el-table-column sortable prop="ZK_ROUNDS" label="轮次"/>
              <el-table-column sortable prop="ZK_TIME" label="时间">
                <template slot-scope="scope">
                  {{formatterDate(scope.row.ZK_TIME)}}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>        
        <div slot="footer" class="dialog-footer">
          <el-button @click="recordForm.visible = false;">取 消</el-button>
          <el-button type="primary" @click="recordForm.flag ? null : updateRecord()">保 存</el-button>
          <el-button type="primary" @click="checkTarget()" v-if="recordForm.record.ZK_INVESTOR.ZK_ISSYNC!=='1'"><i class="el-icon-upload"></i> 同 步</el-button>
        </div>
      </el-dialog>
      <el-dialog :title="'与目标数据库记录冲突（匹配到'+ targetForm.record.length +'条记录）'" :visible="targetForm.visible" width="70%" :show-close="false">
        <el-card v-for="item in targetForm.record" :key="item.ZK_INVESTOR.ZK_NAME" style="margin-bottom:20px;">
          <div slot="header" class="target_item_header">
            <img class="column_logo" :src="item.ZK_INVESTOR.ZK_LOGO" />
            <span>{{item.ZK_INVESTOR.ZK_TITLE}}</span>
            <el-button type="text" @click="showTargetDesc(item.ZK_INVESTOR)">查看简介</el-button>
          </div>
          <el-tabs value="first">
            <el-tab-pane label="机构团队" name="first">
              <el-table :data="item.ZK_INVESTOR_TEAMS" stripe>
                <el-table-column sortable prop="ZK_AVATAR" label="头像">
                  <template slot-scope="scope">
                    <img class="column_logo" :src="scope.row.ZK_AVATAR" :alt="scope.row.ZK_NAME" />
                  </template>
                </el-table-column>
                <el-table-column sortable prop="ZK_NAME" label="姓名"/>
                <el-table-column sortable prop="ZK_POSITION" label="职位"/>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="投资案例" name="second">
              <el-table :data="item.ZK_INVESTOR_CASES" stripe>
                <el-table-column sortable prop="ZK_TITLE" label="公司/项目"/>
                <el-table-column sortable prop="ZK_INDUSTRY" label="行业"/>
                <el-table-column sortable prop="ZK_MONEY" label="金额"/>
                <el-table-column sortable prop="ZK_ROUNDS" label="轮次"/>
                <el-table-column sortable prop="ZK_TIME" label="时间">
                  <template slot-scope="scope">
                    {{formatterDate(scope.row.ZK_TIME)}}
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-card>
        <div slot="footer" class="dialog-footer">
          <el-button @click="targetForm.visible = false;">关 闭</el-button>
          <el-button type="primary" disabled >合并冲突</el-button>
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
          { key: "ZK_TITLE", value: "机构" },
          { key: "ZK_ISSYNC", value: "同步" }
        ],
        keycurrent: 0
      },
      recordForm: {
        flag: true,
        record: {
          ZK_INVESTOR: {},
          ZK_INVESTOR_CASES: [],
          ZK_INVESTOR_TEAMS: []
        },
        visible: false,
        index: -1
      },
      recordformRules: {
        ZK_TITLE: [
          { required: true, message: "请输入机构名称", trigger: "blur" }
        ],
        ZK_LOGO: [
          { required: true, message: "请输入LOGO地址", trigger: "blur" }
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
          "Http/Msg/InvestorServer.ashx?method=Backend_GetInvestorList",
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
      this.$confirm("是否删除该机构记录", "删除提示", { type: "warning" })
        .then(function() {
          that.$http
            .post(
              "Http/Msg/InvestorServer.ashx?method=Backend_DeleteInvestor",
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
        .$confirm("是否删除选中的机构记录", "删除提示", { type: "warning" })
        .then(function() {
          that.$http
            .post(
              "Http/Msg/InvestorServer.ashx?method=Backend_DeleteInvestor",
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
      this.recordForm.record.ZK_INVESTOR.ZK_DESC = _content;
    },
    getRecord: function(scope) {
      var that = this;
      this.$http
        .get(
          "Http/Msg/InvestorServer.ashx?method=Backend_GetInvestorDetail",
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
    checkTarget: function(uid) {
      var that = this;
      let promise = new Promise((resolve, reject) => {
        this.$http
          .get(
            "Http/Msg/InvestorServer.ashx?method=Backend_GetTargetDetail",
            {
              params: {
                UID: uid ? uid : this.recordForm.record.ZK_INVESTOR.ZK_ID
              }
            },
            { emulateJSON: true }
          )
          .then(res => {
            if (res.data.flag === "True") {
              if (typeof uid === "undefined") {
                if (res.data.result.length === 0) {
                  this.$confirm(
                    "目标数据库暂无该机构信息，是否同步？",
                    "同步提示",
                    {
                      confirmButtonText: "立即同步",
                      cancelButtonText: "取消",
                      type: "success"
                    }
                  )
                    .then(() => {
                      this.syncTarget();
                    })
                    .catch(() => {});
                } else {
                  this.recordForm.visible = false;
                  this.targetForm.record = res.data.result;
                  this.targetForm.visible = true;
                }
              }
            }
            resolve(res);
          })
          .catch(() => {
            reject();
          });
      });
      return promise;
    },
    showTargetDesc: function(scope) {
      this.$message({
        dangerouslyUseHTMLString: true,
        message: scope.ZK_DESC
      });
    },
    updateRecord: function() {
      var that = this;
      that.$refs["recordForm"].validate(function(valid) {
        if (valid) {
          if (!that.recordForm.record.ZK_INVESTOR.ZK_DESC) {
            that.$message.warning("请填写机构详情");
            return;
          }
          that.$http
            .post(
              "Http/Msg/InvestorServer.ashx?method=Backend_UpdateInvestor",
              that.recordForm.record.ZK_INVESTOR,
              { emulateJSON: true }
            )
            .then(function(res) {
              if (res.data.flag === "True") {
                var form = JSON.parse(JSON.stringify(that.recordForm.record));
                that.records[that.recordForm.index].ZK_TITLE =
                  form.ZK_INVESTOR.ZK_TITLE;
                that.records[that.recordForm.index].ZK_LOGO =
                  form.ZK_INVESTOR.ZK_LOGO;
                that.records[that.recordForm.index].ZK_DESC =
                  form.ZK_INVESTOR.ZK_DESC;
                that.$notify({
                  title: "成功",
                  message: "保存机构信息成功",
                  type: "success"
                });
                that.recordFormInit();
              }
            });
        } else {
          that.$message.warning("请填写数据有效性");
        }
      });
    },
    syncTarget: function(uid) {
      var that = this;
      let promise = new Promise((resolve, reject) => {
        this.$http
          .post(
            "Http/Msg/InvestorServer.ashx?method=Backend_SyncTarget",
            { UID: uid ? uid : this.recordForm.record.ZK_INVESTOR.ZK_ID },
            { emulateJSON: true }
          )
          .then(res => {
            if (res.data.flag === "True") {
              if (res.data.result > 0) {
                this.$notify({
                  title: "成功",
                  message: res.data.message,
                  type: "success"
                });
                if (typeof uid === "undefined") {
                  var form = JSON.parse(JSON.stringify(that.recordForm.record));
                  that.records[that.recordForm.index].ZK_ISSYNC = "1";
                  that.recordFormInit();
                }
              } else {
                this.$notify.info({
                  title: "提示",
                  message: res.data.message
                });
              }
            }
            resolve(res);
          })
          .catch(() => {
            reject();
          });
      });
      return promise;
    },

    /**
     * 批量同步机构
     * promise调用checkTarget和syncTarget
     */
    batchSync: function() {
      var that = this;
      if (that.selection.length === 0) {
        that.$message.error("请先选中需要同步的机构");
        return;
      }
      that
        .$confirm("是否立即同步选中的机构(自动跳过有冲突的机构)", "同步提示", {
          type: "warning"
        })
        .then(() => {
          let tasks = [];
          that.selection.forEach(item => {
            tasks.push(
              new Promise((resolve, reject) => {
                if (item.ZK_ISSYNC === "1") {
                  setTimeout(() => {
                    that.$notify.info({
                      title: "提示",
                      message: item.ZK_TITLE + "已同步，跳过处理"
                    });
                  }, 250);
                  resolve();
                } else {
                  that.checkTarget(item.ZK_ID).then(res => {
                    if (res.data.flag === "True") {
                      if (res.data.result.length > 0) {
                        that.$notify({
                          title: "冲突",
                          message:
                            "匹配到" +
                            res.data.result.length +
                            "条冲突记录，跳过同步",
                          type: "warning"
                        });
                        resolve();
                      } else {
                        that.syncTarget(item.ZK_ID).then(resp => {
                          resolve();
                        });
                      }
                    } else {
                      resolve();
                    }
                  });
                }
              })
            );
          });
          Promise.all(tasks).then(() => {
            that.$notify({
              title: "成功",
              message: "结束批量同步操作(三秒后将自动刷新页面)",
              type: "success"
            });
            setTimeout(function() {
              window.location.reload();
            }, 3400);
          });
        })
        .catch(() => {});
    }
  }
};
</script>

<style>
#Investor_vue .botton_toolbar {
  border: 1px solid #f2f2f2;
  box-shadow: 0 0 5px #f2f2f2;
  padding: 10px;
  margin: 10px 0 20px 0;
}
#Investor_vue .botton_toolbar:hover {
  background: #f2f2f2;
  box-shadow: none;
}
#Investor_vue .column_logo {
  width: 46px;
  height: auto;
  display: inherit;
  margin: 6px 0;
  border-radius: 4px;
}

#Investor_vue .target_item_header {
  display: flex;
  justify-content: center;
  align-items: center;
}

#Investor_vue .target_item_header > img {
  flex: none;
}

#Investor_vue .target_item_header > span {
  flex: 1;
  font-size: 16px;
  font-weight: bold;
  padding: 0 10px;
}

#Investor_vue .target_item_header .el-button {
  flex: none;
}
</style>