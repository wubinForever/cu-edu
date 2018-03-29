 define(function (require, exports, module) {
/**
 * 审核状态（（1待审核2已审核3审核通过4审核不通过）
 * @author jing.zhang
 *
 */
	 var AuditResult = {
			 PendingAudit : {
				 value : 1,
				 describe : "待审核"
			 },
			 Audited : {
				 value : 2,
				 describe : "已审核"
			 },
			 AuditPassed : {
				 value : 3,
				 describe : "审核不通过"
			 },
			 AuditNotThrough : {
				 value : 4,
				 describe : "审核通过"
			 } 
	 }
	 
	 module.exports = AuditResult;
 });