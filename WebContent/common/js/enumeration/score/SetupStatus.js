 define(function (require, exports, module) {

/**
 * 成绩录入时间设置(0-未设置，1-已设置)
 * @author liu.xiong
 *
 */
var SetupStatus = {
		 NotSetup : {
			 value : 1,
			 name : "未设置"
		 },
		 Setup : {
			 value : 2,
			 name : "已设置"
		 }
}
module.exports = SetupStatus;
});