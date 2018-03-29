define(function(require, exports, module) {
	/**
	 * 报到状态
	 * 
	 * @version 2017.11.21
	 * @author chen.qiaomei
	 */
	var reportStatus = {
		notHandled : {
			value : -1,
			name : "未办理"
		},
		reported : {
			value : 1,
			name : "已报到"
		},
		suspension : {
			value : 2,
			name : "暂缓报到"
		},
		notReported : {
			value : 3,
			name : "未报到"
		},
	}
	module.exports = reportStatus;
});