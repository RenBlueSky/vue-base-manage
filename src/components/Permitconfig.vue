<template>
  <div id="Permitconfig_vue">
    <el-row :gutter="30">
      <el-col :span="5">
        <el-menu>
          <el-menu-item v-for="item in roles" :index="item.ZK_ID" :key="item.ZK_ID" @click="menuHanler(item.ZK_ID, item.ZK_ROLE)">
            <i class="fa fa-shield fa-lg"></i>{{item.ZK_ROLE}}
          </el-menu-item>
        </el-menu>
        <div style="margin-top:15px;">
          <el-button :disabled="tip == '未选择'">
            <i class="fa fa-star fa-lg"></i>{{tip}}
          </el-button>
          <br />
          <el-button type="primary" :disabled="tip == '未选择' || isloading" style="margin-top:15px;" @click="update">
            <i class="fa fa-save fa-lg"></i>保存设置
          </el-button>
          <br/>
          <div style="margin-top:30px; color:rgb(174, 181, 195); text-align: center;">
            <span>选择子节点时，请确保其父节点均被选中</span>
          </div>
        </div>
      </el-col>
      <el-col :span="19">
        <el-tree ref="permitTree" :data="permits" :show-checkbox="true" :default-expand-all="true" node-key="id" v-loading="isloading" :check-strictly="true">
        </el-tree>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      roles: [],
      permits: [],
      selected: [],
      isloading: false,
      tip: "未选择",
      currentRole: ""
    };
  },
  created: function() {
    this.$http
      .get("Http/Msg/PermitconfigServer.ashx?method=Backend_BindRoleList")
      .then(function(res) {
        if (res.data.flag === "True") {
          this.roles = res.data.result;
        }
      });
    this.$http
      .get("Http/Msg/PermitconfigServer.ashx?method=Backend_BindPermitList")
      .then(function(res) {
        if (res.data.flag === "True") {
          this._build(res.data.result);
        }
      });
  },
  methods: {
    _build: function(data) {
      var that = this;
      that.permits = that._buildNode(null, data);
    },
    _buildNode: function(parent, store) {
      var that = this;
      var obj = new Array();
      var sub = new Array();
      store.forEach(function(item, index) {
        if (!item.ZK_PARENT) {
          item.ZK_PARENT = null;
        }
        if (item.ZK_PARENT == parent) {
          obj.push({
            id: item.ZK_ID,
            label: item.ZK_NAME,
            children: that._buildNode(item.ZK_ID, store)
          });
        }
      });
      return obj;
    },
    menuHanler: function(id, name) {
      var that = this;
      this.tip = name;
      this.currentRole = id;
      this.isloading = true;
      this.$http
        .post(
          "Http/Msg/PermitconfigServer.ashx?method=Backend_GetPermitList",
          { ROLE: id },
          { emulateJSON: true }
        )
        .then(function(res) {
          this.isloading = false;
          that.$refs.permitTree.setCheckedKeys([]);
          if (res.data.flag === "True") {
            that.selected = [];
            res.data.result.forEach(function(item) {
              that.selected.push(item.ZK_PERMITID);
            });
            that.$refs.permitTree.setCheckedKeys(that.selected);
          }
        });
    },
    update: function() {
      var permits = this.$refs.permitTree.getCheckedKeys().join(",");
      this.$http
        .post(
          "Http/Msg/PermitconfigServer.ashx?method=Backend_UpdatePermitConfig",
          { ROLE: this.currentRole, PERMITS: permits },
          { emulateJSON: true }
        )
        .then(function(res) {
          if (res.data.flag === "True") {
            this.$message.success("设置成功");
          }
        });
    }
  }
};
</script>

<style></style>