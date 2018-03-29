/**
 * 自定义校验
 * li.zhang
 */
define(function(require, exports, module) {
	var validateExtend = {
		validateEx : function() {
			jQuery.validator.addMethod("isPhone",function(value, element) {
								var length = value.length;
								//var mobile = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
								//var phone = /(^(\d{3,4}-)?\d{6,8}$)|(^(\d{3,4}-)?\d{6,8}(-\d{1,5})?$)|(\d{11})/;
								var mobile=/(^([0-9]{3,4}\-)?[0-9]{7,8}$)|(^(\+86)?1[0-9]{10}$)/;
								return this.optional(element)||mobile.test(value);
							}, "电话格式不正确，如：【13625684653】【0755-7125814】【400-8823823】");// 可以自定义默认提示信息
			jQuery.validator.addMethod("isTelephone",function(value, element) {
				var length = value.length;
				var phone = /(^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$)/;
				return this.optional(element)||phone.test(value);
			}, "固定电话格式不正确，如：【0755-7125814】【400-8823823】");// 可以自定义默认提示信息
			jQuery.validator.addMethod("isMobilePhone",function(value, element) {
				var length = value.length;
				// var phone = /^[1][3,4,5,7,8][0-9]{9}$/;
				var phone =  /^1\d{10}$/;
				return this.optional(element)||phone.test(value);
			}, "手机号码格式不正确，如：【13666666666】");// 可以自定义默认提示信息
			jQuery.validator.addMethod("isEmail",function(value, element) {
				var length = value.length;
				var email = /(^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$)/;
				return this.optional(element)||email.test(value);
			}, "电子邮箱格式不正确，如：【huoxing@163.com】");// 可以自定义默认提示信息
			jQuery.validator.addMethod("isPostalCode",function(value, element) {
				var length = value.length;
				var postalCode = /(^[0-9]{6}$)/;
				return this.optional(element)||postalCode.test(value);
			}, "邮政编码格式不正确，如：【121010】");// 可以自定义默认提示信息
			jQuery.validator.addMethod("isQQ",function(value, element) {
				var length = value.length;
				var postalCode = /(^[0-9]{1,15}$)/;
				return this.optional(element)||postalCode.test(value);
			}, "QQ号格式不正确，如：【13333333】");// 可以自定义默认提示信息
			jQuery.validator.addMethod("isTel",function(value, element) {
								var length = value.length;
								//var phone = /(^(\d{3,4}-)?\d{6,8}$)|(^(\d{3,4}-)?\d{6,8}(-\d{1,5})?$)|(\d{11})/;
								//var phone=/^[0-9-()]{8,20}$/;
								var fax=/^(\d{3,4}-)?\d{7,8}$/
								return this.optional(element)|| (fax.test(value));
							}, "输入格式不正确，可由8-20位的数字及()-组成");// 可以自定义默认提示信息
			
			//重置密码时，当去掉默认密码复选框的√时，校验指定密码框不能为空
			jQuery.validator.addMethod("customPasswordRequired", function(value, element, param) {
				if(!element.disabled){
					if (value.length <=0) {
						return false;
					} else {
						return true;
					}
				}		
			}, "指定密码不能为空");
			
			//重置密码时，当去掉默认密码复选框的√时，校验指定密码长度应该在6到30个字符间
			jQuery.validator.addMethod("customPasswordLength", function(value, element, param) {
				if(!element.disabled){
					if (value.length <6 || value.length>30) {
						return false;
					} else {
						return true;
					}
				}		
			}, "请输入长度在6 到30 之间的字符串");
			
			//时间格式控制 如：10:30
			jQuery.validator.addMethod("isHourMinute",function(value, element) {
				var length = value.length;				
				var reDateTime = /^[0-5][0-9]:[0-5][0-9]$/;
				return this.optional(element)|| (reDateTime.test(value));
			}, "输入时分格式不正确，如：10:30");// 可以自定义默认提示信息
			
			//培养方案，添加课程信息时的学分（1-2位大于等于0的数字，可以有1位小数）
			jQuery.validator.addMethod("creditFormat",function(value, element) {
				var fax=/^\d{1,2}(\.\d{1})?$/;
				return this.optional(element)|| (fax.test(value));
			}, "学分由1-2位正数组成，可有1位小数");// 可以自定义默认提示信息
			
			//培养方案，添加课程信息时的学时（1-2位大于等于0的整数）
			jQuery.validator.addMethod("periodFormat",function(value, element) {
				var fax=/^\d{1,2}$/;
				return this.optional(element)|| (fax.test(value));
			}, "学时由1-2位非负整数组成,ddddd整数dddd");// 可以自定义默认提示信息
			
			//日期时间格式控制 如：2017-11-9 10:30
			jQuery.validator.addMethod("isDateTimeFormat",function(value, element) {
				var length = value.length;				
				var reDateTime = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d$/;
				return this.optional(element)|| (reDateTime.test(value));
			}, "输入日期格式不正确，如：2017-11-9 10:30");// 可以自定义默认提示信息
			
			// 校验年级长度应该不小于4
			jQuery.validator.addMethod("customGradeLength", function(value, element, param) {				
				if (value.length <4) {
					return false;
				}else{
					return true;
				}						
			}, "请输入长度不小于4的年级");
			
			//成绩只能0-9999.99之间
			jQuery.validator.addMethod("isEntranceScore",function(value, element) {
				var length = value.length;
				var entranceScore = /^(?!0+(?:\.0+)?$)(?:[1-9]\d{0,3}|0)(?:\.\d{1,2})?$|0$/;
				return this.optional(element)|| (entranceScore.test(value));
			}, "输入成绩格式不正确");// 可以自定义默认提示信息
			//成绩，0-100之间，可保留一位小数
			jQuery.validator.addMethod("usualRatioFormat",function(value, element) {
				var fax=/^(\d|[1-9]\d|100)((\.[0-9]))?$/;
				return this.optional(element)|| (fax.test(value));
			}, "0-100之间，可保留一位小数");// 可以自定义默认提示信息
			
		}
	}
	module.exports = validateExtend;
});