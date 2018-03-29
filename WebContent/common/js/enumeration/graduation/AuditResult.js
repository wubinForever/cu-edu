 define(function (require, exports, module) {

/**
 * 审核结果(0-未审核，1-通过，2-未通过)
 * @author 崔家骝
 *
 */
var AuditResult = {
		Passed : {
			 value : 1,
			 name : "通过"
		},
		Rejected : {
			 value : 2,
			 name : "未通过"
		}
}
module.exports = AuditResult;
});