 define(function (require, exports, module) {

/**
 * 操作类型（1新增2修改3删除）
 * @author chen.qiaomei
 *
 */
var OperateType = {
		Add : {
			 value : 1,
			 name : "新增"
		 },
		 Update : {
			 value : 2,
			 name : "修改"
		 },
		 Delete : {
			 value : 3,
			 name : "删除"
		 }
}
module.exports = OperateType;
});