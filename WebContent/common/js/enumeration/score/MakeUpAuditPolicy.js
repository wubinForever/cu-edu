 define(function (require, exports, module) {

/**
 * 补考成绩审核规则(1-新总评成绩=原总评成绩；2-新总评成绩=补考成绩，3-新总评成绩=分数，4-新总评成绩=60，5-新总评成绩=(补考成绩+60)/2)
 * @author chen.qiaomei
 *
 */
var MakeUpAuditPolicy = {
		OriginalScore : {
			 value : 1,
			 name : "新总评成绩=原总评成绩"
		 },
		 MakeUpScore : {
			 value : 2,
			 name : "新总评成绩=补考成绩"
		 },
		 Score : {
			 value : 3,
			 name : "新总评成绩=分数"
		 },
		 FixedValue : {
			 value : 4,
			 name : "新总评成绩=60"
		 },
		 FormulaCalculator : {
			 value : 5,
			 name : "新总评成绩=(补考成绩+60)/2)"
		 }
}
module.exports = MakeUpAuditPolicy;
});