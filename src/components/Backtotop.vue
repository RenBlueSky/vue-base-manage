<template>
  <el-collapse-transition>
    <div id="Backtotop_vue" v-show="isShow" @click="toTop()">
      <i class="el-icon-caret-top"></i>
    </div>
  </el-collapse-transition>
</template>

<script>
export default {
  data: function() {
    return {
      isShow: false
    };
  },
  mounted: function() {
    window.onscroll = this.listenScroll;
  },
  methods: {
    toTop: function() {
      document.documentElement.scrollTop = document.body.scrollTop = 0;
    },
    listenScroll: function() {
      var scrolltop =
        document.documentElement.scrollTop || document.body.scrollTop;
      if (scrolltop >= 120) {
        this.isShow = true;
      } else {
        this.isShow = false;
      }
    }
  }
};
</script>

<style lang="scss">
#Backtotop_vue {
  background-color: #58b7ff;
  position: fixed;
  right: 30px;
  bottom: 50px;
  z-index: 99999999;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.4;
  &:hover {
    opacity: 1;
  }
  i {
    color: #fff;
    display: block;
    line-height: 50px;
    text-align: center;
    font-size: 22px;
  }
}
</style>