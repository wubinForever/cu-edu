 define(function (require, exports, module) {

/**
 * 成绩构成是否允许修改（0不允许1允许）
 * @author chen.qiaomei
 *
 */
var EnableChanges = {
		NotAllow : {
			 value : 0,
			 name : "不允许"
		 },
		 Allow : {
			 value : 1,
			 name : "允许"
		 }
}
module.exports = EnableChanges;
});