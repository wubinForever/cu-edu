 define(function (require, exports, module) {

/**
 * 初修绩点计算方法(0-公式计算，1-分段计算)
 * @author chen.qiaomei
 *
 */
var Calculate = {
		FormulaCalculator : {
			 value : 0,
			 name : "公式计算"
		 },
		 StagesCalculated : {
			 value : 1,
			 name : "分段计算"
		 }
}
module.exports = Calculate;
});