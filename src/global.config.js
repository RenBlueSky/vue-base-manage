
//是否处于调试模式
global.IS_DEBUG = true;

//http请求默认前缀
global.HTTP_PORT = global.IS_DEBUG ? "http://127.0.0.1:3000/" : "";


//权限票据
global.PERMITTOKEN = "base64code";