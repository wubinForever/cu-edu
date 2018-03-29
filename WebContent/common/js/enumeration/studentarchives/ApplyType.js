define(function(require, exports, module) {
	/**
	 * 标识是异动控制或分流控制
	 * 
	 * @version 2017.11.15
	 * @author zhang.qionglin
	 */
	var applyType = {
		AlienChange : {
			value : 1,
			name : "异动控制"
		},
		MajorSplit : {
			value : 2,
			name : "分流控制"
		}
	}
	module.exports = applyType;
});
