 define(function (require, exports, module) {

/**
 * 状态(0-未发布，1-已发布)
 * @author chen.qiaomei
 *
 */
var ReleaseStatus = {
		Unpublished : {
			 value : 0,
			 name : "未发布"
		 },
		 Published : {
			 value : 1,
			 name : "已发布"
		 }
}
module.exports = ReleaseStatus;
});