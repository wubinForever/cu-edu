 define(function (require, exports, module) {

/**
 * 审核未通过原因(1-未达到毕业课程要求;2-未达到毕业学分要求;3-未达到毕业学分要求，未达到毕业课程要求延迟毕业)
 * @author 崔家骝
 *
 */
var AuditRejectReason = {
		CourseNotPassed : {
			 value : 1,
			 name : "未达到毕业课程要求"
		},
		CreditNotPassed : {
			 value : 2,
			 name : "未达到毕业学分要求"
		},
		CourseCreditNotPassed : {
			 value : 3,
			 name : "未达到毕业学分要求，未达到毕业课程要求"
		},
		Postpone : {
			 value : 4,
			 name : "延迟毕业"
		}
}
module.exports = AuditRejectReason;
});