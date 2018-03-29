define(function(require, exports, module) {
	/**
	 * 培养层次
	 * 
	 * @version 2017.12.07
	 * @author zhang.qionglin
	 */
	var trainingLevel = {
		DOCTOR : {
			value : 1,
			name : "博士"
		},
		MASTER : {
			value : 2,
			name : "硕士"
		},
		BACHELOR : {
			value : 3,
			name : "本科"
		},
		JUNIOR : {
			value : 4,
			name : "专科"
		},
		OTHER : {
			value : 5,
			name : "其他"
		}
	}
	module.exports = trainingLevel;
});

