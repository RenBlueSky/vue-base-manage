<template>
  <div id="Error_vue">
    <div class="container">
      <h2>
        <i class="fa fa-medkit" style="padding-right:10px;"></i>很遗憾，您所请求的页面暂时无法显示
      </h2>
      <img src="../assets/404.png" title="404"/>
      <ul>
        <li>
          <i class="fa fa-font-awesome"></i>可能填写了无效的地址，请检查地址栏
        </li>
        <li>
          <i class="fa fa-product-hunt"></i>可能因为您没权限查看上一个页面，请检查自己的权限，如需升级权限请联系管理员
        </li>
        <li>
          <i class="fa fa-rebel"></i>网络异常，请检查网络连接情况
        </li>
        <li>
          <i class="fa fa-gg-circle"></i>系统内部错误，请向管理员反馈
        </li>
      </ul>
    </div>
  </div>
</template>

<script></script>

<style lang="scss">
#Error_vue{
	.container{
		width:500px; margin:80px auto 0 auto;
		h2{ text-align:center; color:#636363; }
		img{ display:block;  margin:50px auto 30px auto; }
		ul{ 
			display:inline-block; list-style:none; 
			li{ 
				padding-bottom:15px; line-height:25px; color:#797979; 
				i{ padding-right:10px; }
			}
		}
	}
}
</style>