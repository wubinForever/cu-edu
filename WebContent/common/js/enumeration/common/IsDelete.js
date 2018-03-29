 define(function (require, exports, module) {

/**
 * 是否删除（1已删除，0未删除）
 * @author jing.zhang
 *
 */
var IsDelete = {
		Deleted : {
			 value : 1,
			 describe : "已删除"
		 },
		NotDeleted : {
			 value : 0,
			 describe : "未删除"
		 } 
}
module.exports = AuditResult;
});