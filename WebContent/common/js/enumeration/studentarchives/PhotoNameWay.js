define(function(require, exports, module) {
	/**
	 * 照片命名方式
	 * 
	 * @version 2018.02.07
	 * @author qionglin.zhang
	 */
	var photoNameWay = {
		StudentNo : {
			value : 1,
			name : "学号"
		},
		StudentName : {
			value : 2,
			name : "姓名"
		},
		IdCard : {
			value : 3,
			name : "身份证号"
		},
		CandidateNo : {
			value : 4,
			name : "考生号"
		},
	}
	module.exports = photoNameWay;
});