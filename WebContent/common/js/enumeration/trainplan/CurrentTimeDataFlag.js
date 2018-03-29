define(function (require, exports, module) {
	/**
	 * 获取哪些数据标识
	 */
	var CurrentTimeDataFlag = {
			AllData:{ value:1, name:"所有数据" }, 
			CurrentTimeData: { value:2, name:"当前时间开放数据" }
	}
    module.exports = CurrentTimeDataFlag;
});
