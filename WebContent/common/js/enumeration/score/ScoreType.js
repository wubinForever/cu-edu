 define(function (require, exports, module) {

/**
 * 成绩类型(1首考2补考3重修（暂时没用）)
 * @author chen.qiaomei
 *
 */
var ScoreType = {
		FirstTest : {
			 value : 1,
			 name : "首考"
		 },
		 MakeUp : {
			 value : 2,
			 name : "补考"
		 },
//		 Rebuild : {
//			 value : 3,
//			 name : "重修"
//		 }
}
module.exports = ScoreType;
});