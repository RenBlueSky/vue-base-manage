<template>
  <el-submenu :index="index.toString()" v-if="!node.leaf">
    <template slot="title">
      <i class="fa fa-list-ul"></i>{{node.name}}
    </template>
    <el-menu-item v-for="child in node.children"  :index="child.index" :key="'nav_' + child.index" v-if="child.leaf">
      <i class="fa fa-hand-o-right"></i>{{child.name}}
    </el-menu-item>
    <nav-menu v-for="child in node.children" :index="'nav_' + index.toString()" :key="'nav_' + index.toString()" v-if="!child.leaf" :node="child"></nav-menu>
  </el-submenu>
</template>

<script>
export default {
    name: "nav-menu",
    props:["index","node"],
    data: function(){
        return {
            
        }
    },
    methods: {
        
    }
}
</script>