define(function(require, exports, module) {
	/**
	 * 周类型 SINGLE_OR_DOUBLE_WEEK
	 */
	var WeekType = {
		All : {
			value : "0",
			describe : "周"
		},
		Single : {
			value : "1",
			describe : "单周"
		},
		Double : {
			value : "2",
			describe : " 双周"
		}
	}

	module.exports = WeekType;
});