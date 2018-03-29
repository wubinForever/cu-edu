define(function (require, exports, module) {

	/**
	 * 通用配置
	 */
	var config = {
		PROJECT_NAME:"/cu",	//后台工程名
		RSP_SUCCESS : 0, //成功
		RSP_FAIL : -1,	//通用错误
		RSP_WARN : 1,	//提醒
		RSP_NO_LOGIN : 2,//未登录
		RSP_UNAUTHORIZED : 3,//没有权限
		RSP_NO_REGISTER : 4, //未进行在线注册
		base:window.document.location.pathname.substring(0, window.document.location.pathname.substr(1).indexOf('/') + 1)
	}
    module.exports = config;
});
