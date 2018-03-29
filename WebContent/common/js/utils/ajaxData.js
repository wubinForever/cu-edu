define(function(require, exports, module) {
	var popup = require("./popup");
	var utils = require("./utils");
	var config = require("./config");
	var authority = require("./authority");
	/** ajax提交数据封装的方法* */
	function AjaxData(async) {
		this.url = "";
		this.requestTimeOut = 5000;
		this.dataType = "json";
		this.method = 'POST';
		this.async = (async == undefined || async) ? true : false;// true为异步，false为同步
		// 默认为true
		this.contentType = "application/x-www-form-urlencoded";
	}

	AjaxData.prototype = {
		contructor : AjaxData,
		setMethod : function(method) {
			this.method = method;
		},
		setUrl : function(url) {
			this.url = url;
		},
		parseData : function(object) {
			var dataStr = '';
			for ( var i in object) {
				var objStr = object[i];
				if ("string" == typeof objStr) {
					objStr = objStr.replace(new RegExp("%", 'g'), "%25");
					objStr = objStr.replace(/\+/g, '%2B');// 转义参数中的特殊字符
					objStr = objStr.replace(/\?/g, "%3F");
					objStr = objStr.replace(new RegExp("&", 'g'), "%26");
					objStr = objStr.replace(new RegExp("&", 'g'), "");
				}
				dataStr += i + "=" + objStr + "&";
			}
			this.data = dataStr.substr(0, dataStr.length - 1);
		},
		SetRequestTimeOut : function(t) {
			this.requestTimeOut = t;
		},
		setContentType : function(contentType) {
			this.contentType = contentType;
		},
		request : function(req, data, callback, loading) {
			var me = this;
			if (data != undefined) {
				this.parseData(data);
			} else {
				data = {};
			}
			if (req != undefined) {
				if (req.method != 'POST' && req.method != 'GET') {
					data._method = req.method;
					this.method = "POST";
				} else {
					this.method = req.method;
				}
				var url = req.url;
				if (url != undefined) {
					if (url.indexOf("?") != -1) {
						url += '&_=' + new Date().getTime();
					} else {
						url += "?_=" + new Date().getTime();
					}
					this.url = utils.getRootPath() + config.PROJECT_NAME + url;
				}
				if (loading) {
					this.async = true;
				}

				$.ajax({
					type : this.method,
					url : this.url,
					data : data,
					cache : false,
					timeout : this.timeOut,
					dataType : this.dataType,
					async : this.async,
					contentType : this.contentType,
					beforeSend : function(xhr) {
						if (loading) {
							$("body").append("<div class='loading'></div>");
							$("body").append("<div class='loading-back'></div>");

							if ($(".loading").length > 0) {
								if (AjaxData.count) {
									AjaxData.count++;
								} else {
									AjaxData.count = 1
								}
							}
						}
					},
					success : function(data, textStatus, xhr) {
						if (typeof callback == "function") {
							var json = JSON.stringify(data);
							json = json.replace(new RegExp("%2B", 'g'), '+');
							json = json.replace(new RegExp("%3F", 'g'), "?");
							json = json.replace(new RegExp("%26", 'g'), "&");
							json = json.replace(new RegExp("%25", 'g'), "%");
							data = JSON.parse(json);
							me.checkStatus(data);
							callback(data, textStatus, xhr);
							authority.init();

						}
						;
					},
					error : function(xhr, textStatus, errorThrown) {
						// popup.errPop(errorThrown);
					},
					complete : function(xhr) {
						if (loading) {
							if (!AjaxData.count || AjaxData.count == 1) {
								$(".loading,.loading-back").remove();
								delete AjaxData.count;
							} else {
								AjaxData.count--;
							}
						}
					}
				});
			}
		},
		/**
		 * 文件导出 组装成form表单提交，主要解决的是post请求问题，也可以直接使用location.href
		 * 
		 * @param req
		 * @param data
		 */
		exportFile : function(req, data) {
			var form = $("<form></form>");
			if (data) {
				$.each(data, function(item) {
					if (data[item] instanceof Array) {
						var dataArr = data[item];
						$.each(dataArr, function(i) {
							var input = $("<input/>");
							input.prop({
								name : item + "[" + i + "]",
								value : dataArr[i]
							}).appendTo(form);
						});
					} else {
						var input = $("<input/>");
						input.prop({
							name : item,
							value : data[item]
						}).appendTo(form);
					}
				});
			}
			form.prop({
				action : config.PROJECT_NAME + req.url,
				method : req.method
			}).appendTo("body");
			form.hide();
			form.submit();
			form.remove();
		},
		checkStatus : function(data) {
			if (data.code == config.RSP_NO_REGISTER) {
				// 未进行在线注册
				window.top.location.href = utils.getRootPathName() + "/onlineregister/html/grant.html?applyId=" + encodeURIComponent(data.applyId);
			}
			if (data.code == config.RSP_NO_LOGIN) {
				// 未登录
				var menuId = utils.getUrlParam('menuId');
				var urlLocation = utils.getRootPathName() + "/login.html";
				if (utils.isNotEmpty(menuId)) {
					urlLocation += "?menuId=" + menuId;
				}
				window.top.location.href = urlLocation;
			} else if (data.code == config.RSP_FAIL) {
				// 通用错误
				popup.errPop(data.msg);
				// location.href= utils.getRootPathName() +
				// "/common/html/404.html";
			} else if (data.code == config.RSP_UNAUTHORIZED) {
				// 没有权限
				// popup.tipsPop(data.msg);
				location.href = utils.getRootPathName() + "/common/html/401.html";
			} else {
				return data;
			}
		}
	};
	window.AjaxData = new AjaxData;
	module.exports = new AjaxData;
});