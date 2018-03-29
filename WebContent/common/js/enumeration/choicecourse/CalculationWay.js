define(function(require, exports, module) {
	/**
	 * 计算类型
	 * @author yuan.xiaoming
	 *
	 */
	var CalculationWay = {
		Add : {
			value : 1,
			describe : "加"
		},
		Subtract : {
			value : 2,
			describe : "减"
		},
		Multiply : {
			value : 3,
			describe : "乘"
		},
		Divide : {
			value : 4,
			describe : "除"
		}
	}
	module.exports = CalculationWay;
});