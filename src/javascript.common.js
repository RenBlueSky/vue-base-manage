'use strict';

typeof global === "undefined" ? window.global = this : "";

global.JavascriptCommon = {

    /**
    * 剪切字符串
    * @ str 原字符串
    * @ 最大长度   
    */
    MsgCutWord: function (str, num) {
        if (str == null) { str = ""; }
        var result = str;
        var wordLength = str.length;
        if (wordLength > num) {
            result = str.substr(0, num);
            result += "...";
        }
        return (result);
    },

    /**
    *  修改日期格式年月日
    *  @ jsondate json日期
    *  @ splitchar 分隔符
    */
    ChangeDateFormat: function (jsondate, splitchar) {
        if (!jsondate) { return ""; }
        var reg = /^\/Date\((\d+)\)\/$/g;
        var date = null;
        if (reg.test(jsondate)) {
            date = new Date(Number.parseInt(jsondate.replace(reg, "$1"), 10));
        } else {
            if (/^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}.\d+Z$/gi.test(jsondate)) {
                jsondate = jsondate.replace(/(^.+)(T)(.+)(\..+Z)/gi, "$1 $3");
                date = new Date(jsondate);
            } else {
                date = new Date(jsondate);
            }
        }
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        return date.getFullYear() + splitchar + month + splitchar + currentDate;
    },

    /**
    *  修改日期格式年月日
    *  @ jsondate json日期
    *  @ splitchar 分隔符
    */
    ChangeDateFormat_hhmmss: function (jsondate, splitchar) {
        if (!jsondate) { return ""; }
        var reg = /^\/Date\((\d+)\)\/$/g;
        var date = null;
        if (reg.test(jsondate)) {
            date = new Date(Number.parseInt(jsondate.replace(reg, "$1"), 10));
        } else {
            if (/^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}.\d+Z$/gi.test(jsondate)) {
                jsondate = jsondate.replace(/(^.+)(T)(.+)(\..+Z)/gi, "$1 $3");
                date = new Date(jsondate);
            } else {
                date = new Date(jsondate);
            }
        }
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var hh = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var mm = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        return date.getFullYear() + splitchar + month + splitchar + currentDate + " " + hh + ":" + mm;
    },


    /**
    *  获得当天对应的天数
    *  @ jsondate json日期
    *  @ splitchar 分隔符
    */
    GetDateDay: function (jsondate) {
        if (!jsondate) { return ""; }
        var reg = /^\/Date\((\d+)\)\/$/g;
        var date = null;
        if (reg.test(jsondate)) {
            date = new Date(Number.parseInt(jsondate.replace(reg, "$1"), 10));
        } else {
            if (/^\d{4}-\d{1,2}-\d{1,2}T\d{1,2}:\d{1,2}:\d{1,2}.\d+Z$/gi.test(jsondate)) {
                jsondate = jsondate.replace(/(^.+)(T)(.+)(\..+Z)/gi, "$1 $3");
                date = new Date(jsondate);
            } else {
                date = new Date(jsondate);
            }
        }
        return date.getDate();
    },

    /**
    * 获取请求参数
    * @ name 参数名
    * @ operation 操作 空时原样返回，lower转小写，upper转大写
    * 返回参数值，如果不存在返回null
    */
    GetQueryParamet: function (name, operation) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) {
            if (operation == "lower") {
                return unescape(r[2]).toLowerCase();
            } else if (operation == "upper") {
                return unescape(r[2]).toUpperCase();
            } else {
                return unescape(r[2]);
            }
        }
        return null; //toUpperCase 
    },

    /**
    * 设置Cookie 【js版】
    * @ name 名称
    * @ value 内容
    * @ time 保存时间
    * @ path [可选] 路径
    * 删除时time传 -1
    */
    MsgSetCookie: function (name, value, time, path) {
        path = path || "";
        var d = new Date();
        d.setTime(d.getTime() + (time * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        path = "path=" + path;
        document.cookie = name + "=" + value + "; " + expires + "; " + path;
    },

    /**
    * 读取Cookie 【js版】
    * @ name 名称
    */
    MsgGetCookie: function (name) {
        name = (name + "=");
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1);
            if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
        }
        return "";
    },

    /**
    * 生成Guid 唯一主键
    * 把英文和-全部替换成纯数字
    */
    Guid: function () {
        var result = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return result.replace(/-/ig, parseInt(Math.random() * 10)).replace(/[a-zA-Z]/ig, parseInt(Math.random() * 10));
    },

    /**
    * Base64加密解密类
    * @ .encode() 加密
    * @ .decode() 解密
    */
    Base64: function () {
        var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        this.encode = function (input) {
            input = input || "";
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = _utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                    _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
            }
            return output;
        };
        this.decode = function (input) {
            input = input || "";
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = _utf8_decode(output);
            return output;
        };
        var _utf8_encode = function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        };
        var _utf8_decode = function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        };
    },

    /**
    * 打印对象属性和方法
    * @ obj 对象
    */
    ShowObjectAttr: function (obj) {
        for (var name in obj) {
            console.log(name + ": " + obj[name]);
        }
    },

    /**
    * 获取纯文字
    * @ html 富文本/html标签
    * @ length 长度 可选[默认全部]
    */
    MsgGetPureText: function (html, length) {
        var text = html.replace(/<[^>]+>/g, "");
        length = isNaN(length) ? text.length : length;
        return text.substring(0, length) + "...";
    },

    /**
    * 翻译状态
    * @ state
    */
    TranslateState: function (state) {
        switch (state) {
            case "0": return "待受理";
            case "1": return "待受理";
            case "2": return "已受理";
            case "3": return "不受理";
            case "4": return "已取消";
            case "5": return "被取消";
            default: return "未定义";
        }
    },

    /**
    * 邮件判断
    * @ email
    */
    ValidateEmail: function (email) {
        var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        return myreg.test(email);
    },

    /**
    * 电话判断
    * @ phone
    */
    ValidatePhone: function (phone) {
        var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
        return myreg.test(phone);
    },

    /**
    * 加载js文件
    * @ path js文件路径
    * @ callback 回调方法
    */
    MsgRequirejs: function (path, callback) {
        String.prototype.endWith = function (endStr) {
            var d = this.length - endStr.length;
            return (d >= 0 && this.lastIndexOf(endStr) == d)
        }
        if (!path.endWith(".js")) { console.error("加载文件的类型不是js"); return; }
        var elem = document.createElement("script");
        var scripts = document.getElementsByTagName("script");
        elem.setAttribute("type", "text/javascript");
        elem.setAttribute("src", path);
        var total = scripts.length;
        for (var i = 0; i < total; i++) {
            if (scripts[i].getAttribute("src") === path) {
                var total = 0, timer = setInterval(function () {
                    try {
                        total++;
                        callback();
                        clearInterval(timer);
                    } catch (err) {
                        console.debug("正在加载文件，请稍候...");
                        if (total > 20) { clearInterval(timer); }
                    }
                }, 500);
                return;
            }
            if (i == total - 1) { document.body.appendChild(elem); }
        }
        if (typeof (callback) == "function") {
            elem.onload = elem.onreadystatechange = function () {
                callback();
            };
        }
    },

    /**
    * 判断文件是否为图片类型
    * @ filename 文件名
    */
    validateImageExt: function (filename) {
        if (!filename) { return false; }
        var extStart = filename.lastIndexOf(".");
        var ext = filename.substring(extStart, filename.length).toUpperCase();
        var exts = [".BMP", ".PNG", ".GIF", ".JPG", ".JPEG"];
        if (exts.indexOf(ext) > -1) {
            return true;
        } else {
            return false;
        }
    },

    /**
    * 路由过滤，获取当前页面token
    * 一般是路由beforeEach钩子中调用
    * [router.options.routes循环调用]
    */
    filterRouter: function (router, path) {
        if (router.path == path) {
            return router.token;
        } else if (!router.children) {
            return "";
        } else {
            for (var i = 0; i < router.children.length; i++) {
                var _token = this.filterRouter(router.children[i], path);
                if (_token) {
                    return _token;
                }
            }
        }
    },

    /**
    * 判断对象是否为空对象
    * @obj object
    */
    isEmptyObject: function (obj) {
        for (var name in obj) {
            return false;
        }
        return true;
    },

    /**
     * 系统token-session(外部不可见)
     */
    _SysTokenSession: {},

    /*
    * 设置token-session
    *   默认设置到JavascriptCommon中
    *   其次设置到sessionstorage中
    *   再次设置到cookie中
    */
    SetSysTokenSession: function (name, token) {
        this._SysTokenSession[name] = token;
        if (typeof window.localStorage === "object") {
            sessionStorage.setItem("SysTokenSession." + name, token);
        } else {
            this.MsgSetCookie("SysTokenSession." + name, token, (1 / 24 / 60) * 30);
        }
    },


    /**
    * 读取token-session
    *   默认读取JavascriptCommon
    *   其次读取sessionstorage
    *   再次读取cookie
    */
    GetSysTokenSession: function (name) {
        if (!this._SysTokenSession[name]) {
            if (typeof window.localStorage === "object") {
                return sessionStorage.getItem("SysTokenSession." + name);
            } else {
                return this.MsgGetCookie("SysTokenSession." + name);
            }
        } else {
            return this._SysTokenSession[name];
        }
    },

    /**
     * 清除token-session
     */
    RemoveSysTokenSession: function (name) {
        this._SysTokenSession[name] = undefined;
        if (typeof window.localStorage === "object") {
            sessionStorage.removeItem("SysTokenSession." + name);
        }
        this.MsgSetCookie("SysTokenSession." + name, "", -1);
    },

};
