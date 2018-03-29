 define(function (require, exports, module) {

/**
 * 课程属性
 * @author jing.zhang
 *
 */
var CourseAttribute = {
		Required : {
			 value : "01",
			 describe : "必修"
		 },
		 LimitedSelection : {
			 value : "02",
			 describe : "限选"
		 },
		 Optional : {
			 value : "03",
			 describe : "任选"
		 }
}
module.exports = CourseAttribute;
 });