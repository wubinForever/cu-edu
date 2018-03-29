define(function(require, exports, module) {
	/**
	 * 异动处理状态
	 * 
	 * @version 2017.11.15
	 * @author zhang.qionglin
	 */
	var alienChangeStatus = {
		UNDEAL : {
			value : 3,
			name : "未处理"
		},
		PASS : {
			value : 1,
			name : "通过"
		},
		NOTPASS : {
			value : 0,
			name : "不通过"
		}
	}
	module.exports = alienChangeStatus;
});
