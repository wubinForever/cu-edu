 define(function (require, exports, module) {

/**
 * 审核状态(1-暂存，2-已送审，3-已审核)
 * @author chen.qiaomei
 *
 */
var ApprovalStatus = {
		TemporaryMemory : {
			 value : 1,
			 name : "暂存"
		 },
		 Submitted : {
			 value : 2,
			 name : "已送审"
		 },
		 Actived : {
			 value : 3,
			 name : "已审核"
		 }  
}
module.exports = ApprovalStatus;
});