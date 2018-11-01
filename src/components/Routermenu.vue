<template>
    <el-submenu :index="index.toString()" v-if="!node.leaf">
      <template slot="title">
        <i :class="node.iconCls"></i>{{node.name}}
      </template>
      <el-menu-item v-for="child in node.children"  :index="child.path" :key="child.path" v-if="!child.hidden && child.leaf">
        <i :class="child.iconCls"></i>{{child.name}}
      </el-menu-item>
      <router-menu v-for="child in node.children" :index="child.path + index.toString()" :key="child.path + index.toString()" v-if="!child.hidden && !child.leaf" :node="child"></router-menu>
    </el-submenu>
</template>

<script>
export default {
  name: "router-menu",
  props: ["index", "node"],
  data: function() {
    return {};
  },
  methods: {}
};
</script>