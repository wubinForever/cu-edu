define(function(require, exports, module) {
	/**
	 * 确定班级，已经存在于数据字典，修改必须同步
	 * 
	 * @version 2017.11.24
	 * @author zhang.qionglin
	 */
	var confirmedClass = {
		ADDONE : {
			value : 1,
			name : "年级加1"
		},
		ADDTWO : {
			value : 2,
			name : "年级加2"
		},
		ADDTHREE : {
			value : 3,
			name : "年级加3"
		},
		CONSTANT : {
			value : 0,
			name : "年级不变"
		},
		REDUCEONE : {
			value : -1,
			name : "年级减1"
		},
		REDUCETWO : {
			value : -2,
			name : "年级减2"
		},
		UNLIMITED : {
			value : 7,
			name : "年级不限"
		}
	}
	module.exports = confirmedClass;
});
