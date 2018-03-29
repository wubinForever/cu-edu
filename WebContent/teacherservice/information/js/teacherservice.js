/**
 * 教师服务
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var urlData = require("configPath/url.data");// 基础数据url
	var urlUdf = require("basePath/config/url.udf");// 基础框架url
	var urlStu = require("configPath/url.studentarchives");// 学籍url
	var url = require("configPath/url.studentservice");// 学生服务url
	var ve = require("basePath/validateExtend"); 
	var helper = require("basePath/utils/tmpl.helper");// 帮助，如时间格式化等
	var base = config.base;	
	
	/**
	 * 个人信息
	 */
	var information = {			
		
		/**
		 * 初始化个人信息
		 */
		init : function() {
			information.validateBind(); // 页面绑定验证事件
		},
		/**
		 * 页面绑定验证
		 */
		validateBind : function() {
			// 校验
			ve.validateEx();
			// 验证
			$("#updateInfoForm").validate({
				rules : {
					officePhone : {
						required : true,
						maxlength : 50		//办公电话
					},
					mobilePhone : {
						required : true,
						"isPhone" : true	//移动电话
					},
					fax : {
						required:true,
						"isTel" : true		//传真号码
					},
					qq : {
						required : true,
						maxlength : 15    //qq号
					},
					wechat : {
						required : true,
						maxlength : 20    //微信号
					},
					email : {
						required : true,
						"isEmail":true,
						maxlength : 30,    //电子邮箱
					},
					postcode : {
						required : true,
						maxlength : 20    //邮政编码
					},
					address : {
						required : true,
						maxlength : 100   //通信地址
					}
					
				},
				messages : {
					officePhone : {
						required : '办公电话不能为空',
						maxlength : '办公电话不超过50个字符'
					},
					mobilePhone : {
						required : '移动电话不能为空',
						"isPhone" : '移动电话格式不正确'
					},
					fax : {
						required:"传真号码不能为空",
						"isTel" : "传真号码格式不正确，可由8-20位的数字及()-组成"
					},
					qq : {
						required : 'qq',
						maxlength : 'qq号码不超过15个字符'
					},
					wechat : {
						required : '微信号不能为空',
						maxlength : '传真不超过20个字符'
					},
					email : {
						maxlength : '主管部门不超过50个字符'
					},
					postcode : {
						required : '邮政编码不能为空',
					    "isPostalCode":"邮政编码格式不正确，如：【121010】"
					},
					address : {
						required : '通信地址不能为空',
						maxlength : '通信地址不超过100个字符'   //通信地址
					}
				},
				// 定义公用的错误提示内容，暂时保留
				errorPlacement : function(error, element) {
					$(element).parent("div.tips-text").append(error);
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
		}
	}
	module.exports = teachingTask;
	window.teachingTask = teachingTask;
});
