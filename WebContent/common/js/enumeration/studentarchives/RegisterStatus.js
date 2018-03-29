define(function(require, exports, module) {
	/**
	 * 注册状态
	 * 
	 * @version 2017.11.21
	 * @author chen.qiaomei
	 */
	var registerStatus = {
			notHandled : {
			value : -1,
			name : "未办理"
		},
		registered : {
			value : 1,
			name : "已注册"
		},
		suspension : {
			value : 2,
			name : "暂缓注册"
		},
		notRegister : {
			value : 3,
			name : "未注册"
		},
	}
	module.exports = registerStatus;
});