/**
 * 用户登录
 */
define(function(require, exports, module) {

	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("configPath/url.udf");
	var title = require("configPath/title.config");
	/**
	 * 登录用户
	 */
	var login = {
		/**
		 * 页面初始化，绑定事件
		 */
		init : function() {
			// 判断是否为单点登录
			ajaxData.request(URL.USER_GETSSOLOGININFO, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if (data.data.openSSO) {
						var menuId = utils.getUrlParam('menuId');
						var urlLocation = data.data.ssoLoginUrl + '?service=' + location.protocol + '//' + location.host + '/cu/udf/user/loginCAS?reurl=' + location.protocol + '//' + location.host
								+ '/edu/index.html';
						if (utils.isNotEmpty(menuId)) {
							urlLocation += '?menuId=' + menuId;
						}
						// 是单点登录
						window.top.location.href = urlLocation;
					} else {
						// 不是单点登录
						// 提示信息
						$(".marked").addClass("hide");
						// 提交按钮
						$(".login-btn").click(function() {
							login.login();
						});
						// 回车提交
						$(document).keydown(function(e) {
							if (e.keyCode == 13) {
								login.login();
							}
						});

						$(".input-group-con").on("click", function() {
							$(this).parents(".form-group").siblings().children().children(".input-group-con").removeClass("focus-input");
							$(this).addClass("focus-input");
						})

						// 设置验证码
						$("#verification-img").attr("src", config.PROJECT_NAME + URL.COMMON_COMMON_VERIFICATIONCODE.url);
						$("#verification-img").click(function() {
							$(this).attr("src", config.PROJECT_NAME + URL.COMMON_COMMON_VERIFICATIONCODE.url + "?_=" + new Date().getTime());
						});
						login.loginCount();
					}
				}
			});
		},
		/**
		 * 点击登录
		 */
		login : function() {
			var _ = this;
			var param = {};
			param.name = $.trim($("#username").val());
			param.pwd = $.trim($("#password").val());
			param.code = $.trim($("#verificationcode").val());
			var menuId = utils.getUrlParam('menuId');
			if (this.validateLogin(param)) {
				ajaxData.request(URL.USER_LOGIN, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						// 成功 跳转						
						var urlLocation = "index.html";
						if (utils.isNotEmpty(menuId)) {
							urlLocation += "?menuId=" + menuId;
						}
						location.href = urlLocation;

					} else {
						_.showError(data.msg.msg);
						if (data.msg.loginCount >= 3) {
							$(".last-input-text").removeClass("hide");
						}
					}
				});
			}
		},
		/**
		 * 退出登录
		 */
		loginOut : function() {
			var menuId = utils.getUrlParam('menuId');
			ajaxData.request(URL.USER_GETSSOLOGININFO, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if (data.data.openSSO) {
						// 是单点登录
						var urlLocation =  data.data.ssoLogoutUrl + '?service=' + utils.getRootPathName() + "/login.html";
						if (utils.isNotEmpty(menuId)) {
							urlLocation += "?menuId=" + menuId;
						}
						window.top.location.href= urlLocation;						
					} else {
						// 不是单点登录
						ajaxData.request(URL.USER_LOGINOUT, null, function(data) {
							delete window.USER;							
							var urlLocation =  utils.getRootPathName() + "/login.html";
							if (utils.isNotEmpty(menuId)) {
								urlLocation += "?menuId=" + menuId;
							}
							window.top.location.href= urlLocation;	
						});
					}
				}
			});
		},
		/**
		 * 登录信息校验
		 * 
		 * @param param
		 */
		validateLogin : function(param) {
			if (utils.isEmpty(param.name)) {
				this.showError("用户名不能为空");
				return false;
			}
			if (utils.isEmpty(param.pwd)) {
				this.showError("密码不能为空");
				return false;
			}
			if (!$(".last-input-text").hasClass("hide") && utils.isEmpty(param.code)) {
				this.showError("验证码不能为空");
				return false;
			}
			$(".marked").addClass("hide")
			return true;
		},
		/**
		 * 提示信息显示
		 * 
		 * @param msg
		 */
		showError : function(msg) {
			$(".marked").removeClass("hide")
			$(".marked span").text(msg);
		},
		/**
		 * 获取登录次数
		 */
		loginCount : function() {
			ajaxData.request(URL.USER_LOGINCOUNT, null, function(data) {
				if (data.data >= 3) {
					$(".last-input-text").removeClass("hide");
				}
			});
		}
	}
	module.exports = login;
	window.dictionary = login;
});
