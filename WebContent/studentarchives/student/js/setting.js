/**
 * 学生修改个人信息控制
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var simpleSelect = require("basePath/module/select.simple");
	var dataurl = require("configPath/url.data");
	var url = require("configPath/url.studentarchives");
	var base  =config.base;
	/**
	 * 学生修改个人信息控制
	 */
	var setting = {
		// 初始化
		init : function() {
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
			// 日历控件
		    $("#beginTime").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm', maxDate:'#F{$dp.$D(\'endTime\')}'});
            });		    	    
		    $("#endTime").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm', minDate:'#F{$dp.$D(\'beginTime\')}'});
            });
			// 加载数据
		    setting.loadItem();	
			
			// 保存
			$('#btnSave').click(function() {
				var v = $("#addForm").valid(); // 验证表单						
				if (v) { // 表单验证通过
					setting.save();
				} else { // 表单验证不通过				
					return false;
				}
			});		
			
			// 校验
			setting.initFormDataValidate($("#addForm"));
		},
		
		/**
		 * 加载数据
		 */
		loadItem:function(){
			// 加载属性
			ajaxData.request(url.STUDENT_GETSETTINGITEM, "", function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					var rvData = data.data;
					if (rvData.settingId != null){
						$("#settingId").val(rvData.settingId);
						// 时间
					    $("#beginTime").val(rvData.beginTime);
					    $("#endTime").val(rvData.endTime);
					    // 绑定字段表内容
					    var fields = rvData.fields;	
					    $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(fields));
					}
				}
			},true);
		},
		
		/**
		 * 保存
		 */
		save:function(){
			var saveParams = utils.getQueryParamsByFormObject("#addForm");// 获取要保存的参数
			var ids = [];
			$("ul input[type='checkbox']:checked").each(function() {
				var obj = $(this).attr("fieldId");
				ids.push(obj);
			});
			saveParams["ids"] = ids;
			ajaxData.request(url.STUDENT_SETTING, saveParams, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("保存成功", function() {
					});
					// 刷新列表
					setting.loadItem();
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}
			});		
		},
		
		/**
		 * 初始化新增、编辑表单校验
		 * 
		 * formJQueryObj 表单jquery对象
		 */
		initFormDataValidate:function(formJQueryObj){
			formJQueryObj.validate({
				rules : {
					beginTime : {
						"required" : true
					},
					endTime : {
						"required" : true
					}				
				},
				messages : {
					beginTime : {
						"required" : '开始时间不能为空',
					},
					endTime : {
						"required" : '结束时间不能为空'
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			})
		}
	}
	module.exports = setting;
	window.student = setting;
});
