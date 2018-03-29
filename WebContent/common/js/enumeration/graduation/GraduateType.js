 define(function (require, exports, module) {

/**
 * 毕业类型(1-正常，2-往届，3-提前，4-延迟)
 * @author 崔家骝
 *
 */
var GraduateType = {
		Normal : {
			 value : 1,
			 name : "正常"
		},
		Former : {
			 value : 2,
			 name : "往届"
		},
		Advanced : {
			 value : 3,
			 name : "提前"
		},
		Postponed : {
			 value : 4,
			 name : "延迟"
		}
}
module.exports = GraduateType;
});