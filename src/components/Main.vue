<template>
  <div id="Main_vue">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <img src="../assets/investor.png" class="image">
          <div style="padding: 14px;">
            <span>投资机构 爬虫程序</span>
            <div class="bottom clearfix">
              <small>将在每周早上9:30爬取信息</small>
              <el-button type="text" class="button" @click="downloadexe('investor')">下载程序</el-button>
              <el-button type="text" class="button" @click="reptileInvestor()">立即执行</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <img src="../assets/investment.png" class="image">
          <div style="padding: 14px;">
            <span>投融事件 爬虫程序</span>
            <div class="bottom clearfix">
              <small>将在每天早上9:30爬取信息</small>
              <el-button type="text" class="button" @click="downloadexe('investment')">下载程序</el-button>
              <el-button type="text" class="button" @click="reptileInvestment()">立即执行</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <img src="../assets/liuliang.png" class="image">
          <div style="padding: 14px;">
            <span>访问流量 定时任务</span>
            <div class="bottom clearfix">
              <small>将在每天凌晨0:00重置流量</small>
              <el-button type="text" class="button" @click="downloadexe('liuliang')">下载程序</el-button>
              <el-button type="text" class="button">敬请期待</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <img src="../assets/liuliang.png" class="image">
          <div style="padding: 14px;">
            <span>分词搜索 任务调度</span>
            <div class="bottom clearfix">
              <small>后台实时对文章进行分词</small>
              <el-button type="text" class="button">敬请期待</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      exes: {
        investor: "/resource/exe/vc.investor.exe",
        investment: "/resource/exe/vc.investment.exe",
        liuliang: "/resource/exe/vc.liuliang.exe"
      }
    };
  },
  created() {},
  methods: {
    downloadexe(name) {
      this.$confirm("是否下载该应用程序到本地？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          window.open(
            document.location.protocol +
              "//" +
              window.location.host +
              this.exes[name]
          );
        })
        .catch(() => {});
    },
    reptileInvestor() {
      this.$confirm("是否立即启动该程序？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          this.$http
            .post(
              "Http/Msg/MainServer.ashx?method=reptile_investor",
              { random: Math.random() },
              { emulateJSON: true }
            )
            .then(res => {
              if (res.data.flag === "True") {
                this.$notify({
                  title: "成功",
                  message: res.data.message,
                  type: "success"
                });
              }
            });
        })
        .catch(() => {});
    },
    reptileInvestment() {
      this.$confirm("是否立即启动该程序？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          this.$http
            .post(
              "Http/Msg/MainServer.ashx?method=reptile_investment",
              { random: Math.random() },
              { emulateJSON: true }
            )
            .then(res => {
              if (res.data.flag === "True") {
                this.$notify({
                  title: "成功",
                  message: res.data.message,
                  type: "success"
                });
              }
            });
        })
        .catch(() => {});
    }
  }
};
</script>

<style>
#Main_vue img.image {
  width: 128px;
  height: 128px;
  display: block;
  margin: 0 auto;
  border-radius: 6px;
}

#Main_vue .bottom small {
  color: #888;
}
</style>
