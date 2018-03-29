/**
 * 报到注册设置
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("basePath/config/url.udf");	
	var URL_DATA = require("basePath/config/url.data");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var simpleSelect = require("basePath/module/select.simple");//公用下拉框
	var reportStatus = require("basePath/enumeration/studentarchives/ReportStatus");//状态枚举
	var applyTypeEnum = require("basePath/enumeration/studentarchives/ApplyType");
	var validateSet = require("basePath/utils/validateExtend");
	var base  =config.base;	
	
	/**
	 * 报到注册
	 */
	var setting = {
		// 初始化
		init : function() {

			// 日历控件
		    $("#reportBeginDate").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm', maxDate:'#F{$dp.$D(\'reportEndDate\')}'});
            });	    
		    $("#reportEndDate").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm', minDate:'#F{$dp.$D(\'reportBeginDate\')}'});
            });	

			// 日历控件
		    $("#registerBeginDate").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm', maxDate:'#F{$dp.$D(\'registerEndDate\')}'});
            });	    
		    $("#registerEndDate").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm', minDate:'#F{$dp.$D(\'registerBeginDate\')}'});
            });		    	    
			ajaxData.request(URL_STUDENTARCHIVES.REGISTERSETTING_GETITEM,
						null, function(data) {
							if (data.code == config.RSP_SUCCESS && data.data) {
								var reportBeginDate=data.data.reportBeginDate;
								var reportEndDate=data.data.reportEndDate;
								var registerBeginDate=data.data.registerBeginDate;
								var registerEndDate=data.data.registerEndDate;
								$("#reportBeginDate").val(reportBeginDate==null?"":new Date(reportBeginDate).format("yyyy-MM-dd hh:mm"));
								$("#reportEndDate").val(reportEndDate==null?"":new Date(reportEndDate).format("yyyy-MM-dd hh:mm"));
								$("#registerBeginDate").val(registerBeginDate==null?"":new Date(registerBeginDate).format("yyyy-MM-dd hh:mm"));
								$("#registerEndDate").val(registerEndDate==null?"":new Date(registerEndDate).format("yyyy-MM-dd hh:mm"));
								$("#settingId").val(data.data.settingId);
							}
						});
			//必填验证
			setting.validation();
		
			 // 保存设置
			$(document).on("click", "button[name='btnSave']", function() {
				report.save();
			});

		},
		/**
		 * 保存设置
		 */
		save:function(){
			var result=setting.validate();
			if(!result)
				return ;
			var reqData=utils.getQueryParamsByFormObject($("#addForm"));
			ajaxData.request(URL_STUDENTARCHIVES.REGISTERSETTING_SAVE, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("保存成功", function() {});
				}else{
					// 提示失败
					popup.errPop(data.msg);		
				}
			});
		},
		/**
		 * 验证
		 * @returns {Boolean}
		 */
		validate:function(){
			var reportBeginDate=$("#reportBeginDate").val();
			var reportEndDate=$("#reportEndDate").val();
			var registerBeginDate=$("#registerBeginDate").val();
			var registerEndDate=$("#registerEndDate").val();
			
			if(utils.isEmpty(reportBeginDate) || utils.isEmpty(reportEndDate) || utils.isEmpty(registerBeginDate) ||utils.isEmpty(registerEndDate)){
				popup.warPop("必填项不能为空");
				return false;
			}
			if(reportBeginDate && reportEndDate && reportBeginDate>reportEndDate){
				popup.warPop("报到结束时间必须大于开始时间");
				return false;
			}
			
			var registerBeginDate=$("#registerBeginDate").val();
			var registerEndDate=$("#registerEndDate").val();
			if(registerBeginDate && registerEndDate && registerBeginDate>registerEndDate){
				popup.warPop("注册结束时间必须大于开始时间");
				return false;
			}
			
			return true;
			
		},
		/**
		 * 绑定验证事件
		 */
		validation : function() {
			// 校验
			validateSet.validateEx();
			// 验证
			$("#addForm").validate({
			    rules : {
					reportBeginDate : {
						required : true,
					},
					reportEndDate : {
					    required : true,
					},
					registerBeginDate:{
						required : true,
					},
					registerEndDate:{
						required : true,
					}
				},
			    messages : {
			    	reportBeginDate : {
						required : "报到开始时间不能为空",
					},
					reportEndDate : {
					    required : "报到结束时间不能为空",
					},
					registerBeginDate:{
						required : "注册开始时间不能为空",
					},
					registerEndDate:{
						required : "注册结束时间不能为空",
					}
				},
				// 定义公用的错误提示内容，暂时保留
				errorPlacement : function(error, element) {
					var parent = $(element).parent("div.tips-text")
							.append(error);
				},
				onfocusout : function(ele) {
					$(ele).valid();
				},
				onfocusin : function(ele) {
					$(ele).valid();
				}

			})
		}

		
	}
	module.exports = setting;
	window.report = setting;
});
