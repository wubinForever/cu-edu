 define(function (require, exports, module) {

/**
 * 毕业状态(0-未处理，1-毕业，2-结业)
 * @author 崔家骝
 *
 */
var GraduateStatus = {
		NotHandled : {
			 value : 0,
			 name : "未处理"
		},
		Graduated : {
			 value : 1,
			 name : "毕业"
		},
		Completed : {
			 value : 2,
			 name : "结业"
		}
}
module.exports = GraduateStatus;
});