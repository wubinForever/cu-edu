/**
 * 学校信息
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils");
	var ajaxData = require("basePath/ajaxData");
	var config = require("basePath/config");
	var URL = require("configPath/url.udf");
	var URL_DATA = require("configPath/url.data");
	var page = require("basePath/page");
	var popup = require("basePath/popup");
	var treeTable = require("basePath/treeTable");
	var ve = require("basePath/validateExtend");
	var common = require("basePath/common");
	var dictionary = require("configPath/data.dictionary");
	var simpleSelect = require("modulePath/select.simple");
	var base  =config.base;
	var data =[];//数据	

	/**
	 * 学校信息
	 */
	var school = {
		/**
		 * 修改页面初始化，绑定事件
		 */
		initUpdate : function() {
			// 加载学校性质
			simpleSelect.loadDictionarySelect("schoolQualityCode", dictionary.SCHOOL_SCHEDULE_CODE, {firstText: "--请选择--", firstValue: "", async: false});
			// 加载办学类型
			simpleSelect.loadDictionarySelect("schoolTypeCode", dictionary.SCHOOL_TYPE_CODE, {firstText: "--请选择--", firstValue: "", async: false});
			// 加载举办者
			simpleSelect.loadDictionarySelect("sponsorCode", dictionary.MERCY_RELIEF_CODE, {firstText: "--请选择--", firstValue: "", async: false});
			//加载月份
			school.loadSchoolDateMonth();
			//加载日期
			school.loadSchoolDateDay();
			//省市区三级联动
			simpleSelect.loadProvinces("province", "city", "area");
			//获取单条学校信息
			school.getItem();
			school.validateBind(); // 页面绑定验证事件
			$("#updateButton").bind("click", function() {
				var schoolIdVal= $("#schoolId").val();  
				if(schoolIdVal.length==0){  
					school.add();
				} else{
					school.update();
				}
			}); // 绑定修改事件

		},
		/**
		 * 获取单条学校信息
		 * 
		 */
		getItem : function() {
			ajaxData.request(URL_DATA.SCHOOL_GET, null, function(data) {
				if (data == null){
					return false;
				}
				if (data.code == config.RSP_SUCCESS) {
					var item = data.data;
					$("#schoolId").val(item.schoolId);
					$("#schoolCode").val(item.schoolCode);
					$("#schoolName").val(item.schoolName);
					$("#englishName").val(item.englishName);
					$("#schoolQualityCode").val(item.schoolQualityCode);
					$("#schoolTypeCode").val(item.schoolTypeCode);
					$("#sponsorCode").val(item.sponsorCode);
					$("#managementDepartment").val(item.managementDepartment);
					$("#legalPersonNo").val(item.legalPersonNo);
					$("#legalPersonCertificateNo").val(item.legalPersonCertificateNo);
					$("#principal").val(item.principal);
					$("#partycommitteeSuperintendent").val(item.partycommitteeSuperintendent);
					$("#schoolCreateYear").val(item.schoolCreateYear);
					$("#schoolDateMonth").val(item.schoolDateMonth);
					$("#schoolDateDay").val(item.schoolDateDay);
					$("#subjectCategoryAmount").val(item.subjectCategoryAmount);
					$("#history").val(item.history);
					
					//初始化加载省市区
					simpleSelect.loadProvincesInitialValue("province|"+item.province, "city|"+item.city, "area|"+item.area);
					
					$("#telephone").val(item.telephone);
					$("#fax").val(item.fax);
					$("#email").val(item.email);
					$("#postalCode").val(item.postalCode);
					$("#schoolAddress").val(item.schoolAddress);
					$("#website").val(item.website);
				} else {
					// 提示失败
					
				}
			})
		},
		/**
		 * 绑定验证事件
		 */
		validateBind : function() {
			// 校验
			ve.validateEx();
			// 验证
			$("#updateSchoolForm").validate({
				rules : {
					schoolCode : {
						required : true,
						maxlength : 10		//学校代码
					},
					schoolName : {
						required : true,
						maxlength : 100		//学校名称
					},
					englishName : {
						maxlength : 200		//学校英文名称
					},
					schoolQualityCode : {
						required : true
					},
					schoolTypeCode : {
						required : true
					},
					managementDepartment : {
						maxlength : 50		//主管部门
					},
					legalPersonNo : {
						maxlength : 20		//法定代表人号
					},
					legalPersonCertificateNo : {
						maxlength : 20		//法人证书号
					},
					principal : {
						maxlength : 50		//校长
					},
					partycommitteeSuperintendent : {
						maxlength : 50		//党委负责人
					},
					history : {
						maxlength : 1000	//历史沿革
					},
					email : {
						email : true,
						maxlength : 30		//电子信箱
					},
					telephone : {
						"isPhone" : true	//联系电话
					},
					fax : {
						"isTel" : true		//传真号码
					},
					postalCode:{
						"isPostalCode":true	//邮政编码
					},
					schoolAddress : {
						maxlength : 100		//学校地址
					},
					website : {
						url:true,
						maxlength : 100		//主页编码
					}
				},
				messages : {
					schoolCode : {
						required : '学校代码不能为空',
						maxlength : '学校代码不超过10个字符'
					},
					schoolName : {
						required : '学校名称不能为空',
						maxlength : '学校代码不超过100个字符'
					},
					englishName : {
						maxlength : '学校英文名称不超过200个字符'
					},
					schoolQualityCode : {
						required : '学校性质不能为空'
					},
					schoolTypeCode : {
						required : '办学类型不能为空'
					},
					managementDepartment : {
						maxlength : '主管部门不超过50个字符'
					},
					legalPersonNo : {
						maxlength : '法定代表人号不超过20个字符'
					},
					legalPersonCertificateNo : {
						maxlength : '法人证书号不超过20个字符'
					},
					principal : {
						maxlength : '校长不超过50个字符'
					},
					partycommitteeSuperintendent : {
						maxlength : '党委负责人不超过50个字符'
					},
					history : {
						maxlength : '历史沿革不超过1000个字符'
					},
					email : {
						email : '电子信箱格式不正确',
						maxlength : '电子信箱不超过30个字符'
					},
					telephone : {
						"isPhone" : "电话格式不正确，如：【13625684653】【0755-7125814】【400-8823823】"
					},
					fax : {
						"isTel" : "传真号码格式不正确，可由8-20位的数字及()-组成"
					},
					postalCode:{
						"isPostalCode":"邮政编码格式不正确，如：【121010】"
					},
					schoolAddress : {
						maxlength : '学校地址不超过100个字符'
					},
					website : {
						url : '主页地址格式不正确，如：【http://www.baidu.com】',
						maxlength : '主页编码不超过100个字符'
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
		},
		/**
		 * 新增学校记录
		 */
		add : function() {
			// 验证
			var v = $("#updateSchoolForm").valid();// 验证表单
			// 验证通过后保存
			if (v) {
				// 表单验证通过
				var reqData =utils.getQueryParamsByFormId("updateSchoolForm");//获取表单值
				var rvData = null; // 定义返回对象
				// post请求提交数据
				ajaxData.contructor(false); // 同步
				ajaxData.request(URL_DATA.SCHOOL_ADD, reqData, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("新增成功", function() {});
					// 刷新数据
					school.getItem();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
					return false;
				}
			} else {
				// 表单验证不通过
				return false;
			}
		},
		/**
		 * 编辑保存
		 */
		update : function() {
			// 验证
			var v = $("#updateSchoolForm").valid();// 验证表单
			// 验证通过后保存
			if (v) {
				// 表单验证通过
				var reqData =utils.getQueryParamsByFormId("updateSchoolForm");//获取表单值  
				var rvData = null; // 定义返回对象
				// post请求提交数据
				ajaxData.contructor(false); // 同步
				ajaxData.request(URL_DATA.SCHOOL_UPDATE, reqData, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("更新成功", function() {});
					// 刷新数据
					school.getItem();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
					return false;
				}
			} else {
				// 表单验证不通过
				return false;
			}
		},
		
        /**
		 * 校庆日：月份
		 */
        loadSchoolDateMonth : function() {
			var params = [];
			for(var i = 1; i <=12; i++){
				params.push({code: i, dataDictionaryName: i+"月"}); 
			}
			$("#dictionaryTmpl").tmpl(params).appendTo(
					'#schoolDateMonth');
		},
		/**
		 * 校庆日：日期
		 */
		loadSchoolDateDay : function() {
			var params = [];
			for(var i = 1; i <=31; i++){
				params.push({code: i, dataDictionaryName: i+"日"}); 
			}
			$("#dictionaryTmpl").tmpl(params).appendTo(
					'#schoolDateDay');
		}
        
	}
	module.exports = school;
	window.school = school;
});