 define(function (require, exports, module) {

/**
 * 是否达标（0没有达标1达标）
 * @author chen.qiaomei
 *
 */
var IsMeetTheMark = {
		NotUp : {
			 value : 0,
			 name : "没有达标"
		 },
		 Up : {
			 value : 1,
			 name : "达标"
		 }
}
module.exports = IsMeetTheMark;
});