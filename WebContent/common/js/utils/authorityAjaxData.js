 define(function (require, exports, module) {
	var popup = require("./popup");
	var utils = require("./utils");
	var config = require("./config");
	/**ajax提交数据封装的方法**/
	function AjaxData(async){
		this.url = "";
		this.requestTimeOut = 5000;
		this.dataType = "json";
		this.method = 'POST';
		this.async = (async == undefined ||async)?true:false;//true为异步，false为同步 默认为true
	}
	
	AjaxData.prototype = {
		contructor : AjaxData,
		setMethod:function(method){
			this.method = method;
		},
		setUrl:function(url){
			this.url = url;
		},
		parseData:function(object){
			var dataStr = '';
			for (var i in object){
				var objStr = object[i];
				if("string" == typeof objStr) {
					objStr = objStr.replace(new RegExp("%", 'g'), "%25");
					objStr = objStr.replace(/\+/g,'%2B');//转义参数中的特殊字符
					objStr = objStr.replace(/\?/g,"%3F");
					objStr = objStr.replace(new RegExp("&", 'g'), "%26");
					objStr = objStr.replace(new RegExp("&", 'g'), "");
				}
				dataStr += i +"="+objStr+"&";
			}
			this.data = dataStr.substr(0,dataStr.length-1);
		},
		SetRequestTimeOut : function(t){
			this.requestTimeOut=t;
		},
		request: function (req,data,callback){
			if(data != undefined) {
				this.parseData(data);
			}else{
				data = {};
			}
			if(req != undefined){
				if(req.method != 'POST' && req.method != 'GET'){
					data._method = req.method;
					this.method = "POST";
				}else{
					this.method = req.method;
				}
				var url = req.url;
				if(url != undefined) {
					if(url.indexOf("?") != -1){
						url += '&_='+new Date().getTime();
					}else{
						url += "?_="+new Date().getTime();
					}
					this.url= utils.getRootPath() + config.PROJECT_NAME + url;
				}
				$.ajax({
					type:this.method,
					url:this.url,
					data:data,
					cache:false,
					timeout:this.timeOut,
					dataType:this.dataType,
					async:this.async,
					success: function(data,textStatus,xhr) {
						if(typeof callback == "function"){
							var json = JSON.stringify(data);
							json = json.replace(new RegExp("%2B", 'g'),'+');
							json = json.replace(new RegExp("%3F", 'g'),"?");
							json = json.replace(new RegExp("%26", 'g'), "&");
							json = json.replace(new RegExp("%25", 'g'), "%");
							data = JSON.parse(json);
							if(data.code == config.RSP_NO_LOGIN){
								//未登录
								window.top.location.href= utils.getRootPathName() + "/login.html";
							}else if(data.code == config.RSP_FAIL){
								//通用错误
								popup.errPop(data.msg);
							}else if(data.code == config.RSP_UNAUTHORIZED){
								//没有权限
								popup.tipsPop(data.msg);
							}else{
								callback(data,textStatus,xhr);
							}							
						};
			    },
				error: function(xhr, textStatus, errorThrown){
							  
			    }
			  });
			}
		}	
      };
	window.AjaxData = new AjaxData;
    module.exports = new AjaxData;
 });