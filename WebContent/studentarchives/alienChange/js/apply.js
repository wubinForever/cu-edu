/**
 * 开放学生申请学籍异动
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var simpleSelect = require("basePath/module/select.simple");
	var urlData = require("configPath/url.data");
	var url = require("configPath/url.studentarchives");
	var applyTypeEnum = require("basePath/enumeration/studentarchives/ApplyType");
	var base = config.base;	
	
	/**
	 * 开放学生申请学籍异动
	 */
	var apply = {			
		// 初始化
		init : function() {
			// 日历控件
		    $("#beginTime").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm', maxDate:'#F{$dp.$D(\'endTime\')}'});
            });
		    $("#beginTime").val(new Date().format("yyyy-MM-dd hh:mm"));// 初始化默认时间		    
		    $("#endTime").on('focus', function() { //绑定日历控件
                WdatePicker({dateFmt: 'yyyy-MM-dd HH:mm', minDate:'#F{$dp.$D(\'beginTime\')}'});
            });		    
			// 校验
			apply.initFormDataValidate($("#addForm"));
			
			// 学年学期
			simpleSelect.loadCommonSmester("academicYearSemester", urlData.COMMON_GETSEMESTERLIST,"-1","--请选择--","");			
			// 加载数据
			apply.loadItem();
			// 保存
			$('#btnSave').click(function() {
				var v = $("#addForm").valid(); // 验证表单						
				if (v) { // 表单验证通过
					apply.save();
				} else { // 表单验证不通过				
					return false;
				}
			});
		},
		
		/**
		 * 加载数据
		 */
		loadItem:function(){
			// 加载属性
			ajaxData.request(url.ALIENCHANGE_GETAPPLYSETTINGITEM, {
				applyType : applyTypeEnum.AlienChange.value
			}, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					var rvData = data.data;
					if (rvData != null && rvData.settingId != null){
						$("#settingId").val(rvData.settingId);
						// 时间
					    $("#beginTime").val(rvData.beginTime);
					    $("#endTime").val(rvData.endTime);
						// 学年学期
						simpleSelect.loadCommonSmester("academicYearSemester",
								        urlData.COMMON_GETSEMESTERLIST, 
										rvData.academicYearSemester,
										"--请选择--", 
										"");						
					}
				}
			},true);
		},
		
		/**
		 * 保存
		 */
		save:function(){			
			var saveParams=utils.getQueryParamsByFormObject("#addForm");//获取要保存的参数				
			ajaxData.request(url.ALIENCHANGE_APPLYSETTING, saveParams, function(data) {				
				if (data.code == config.RSP_SUCCESS) {					
					// 提示成功
					popup.okPop("保存成功", function() {
						apply.loadItem();
					});	
					
					// 刷新列表
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
					},
					academicYearSemester: {
						"required" : true
					}					
				},
				messages : {
					beginTime : {
						"required" : '申请开始时间不能为空',
					},
					endTime : {
						"required" : '申请结束时间不能为空'
					},
					academicYearSemester : {
						"required" : '生效学年学期不能为空'
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
	module.exports = apply;
	window.apply = apply;
});
