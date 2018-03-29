define(function(require, exports, module) {
	/**
	 * 账号类型
	 * @author chen.dongdong
	 *
	 */
	var AccountType = {
		SuperAdmin : {
			value : 1,
			describe : "超级管理员"
		},
		SystemAdmin : {
			value : 2,
			describe : "系统管理员"
		},
		Admin : {
			value : 3,
			describe : "普通管理员"
		},
		Teacher : {
			value : 4,
			describe : "教师用户"
		},
		Student : {
			value : 5,
			describe : "学生用户"
		}
	}
	module.exports = AccountType;
});