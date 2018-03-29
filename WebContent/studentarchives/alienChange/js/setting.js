/**
 * 异动设置
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var url = require("configPath/url.studentarchives");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var dataDictionary=require("configPath/data.dictionary");
	var simpleSelect = require("basePath/module/select.simple");
	var canBeConfirmedClassEnum = require("basePath/enumeration/studentarchives/CanBeConfirmedClass");
	var isEnabledEnum = require("basePath/enumeration/common/IsEnabled");
	var dataConstant = require("configPath/data.constant");// 公用常量 
	
	var base  =config.base;	
	
	/**
	 * 学籍异动设置
	 */
	var setting = {
			
		/**
		 * 初始化
		 */ 
		init : function() {
			// 加载列表
			setting.loadList();
			
			// 设置
			$(document).on("click", "button[name='set']", function() {
				setting.set(this);
			});
			
			// 启用/禁用
			$(document).on("click", "button[name='setStatus']", function() {
				setting.setStatus(this);
			});
		},
		
		/**
		 * 加载列表
		 */
		loadList : function() {
			// 请求数据
			ajaxData.request(url.ALIENCHANGESETTING_GETLIST, "",
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData && rvData.length > 0) {
								$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(rvData));
							} else {
								$("#tbodycontent").empty().append("<tr><td colspan='10'></td></tr>").addClass("no-data-html");								
							}
						}
					},true);
		},
		
		/**
		 * 设置 弹窗
		 * @param obj this对象
		 */
		set: function(obj){
			var settingId = $(obj).parent().attr("td-data-id");
			popup.open('./studentarchives/alienChange/html/set.html?settingId='+settingId, // 这里是页面的路径地址
				{
					id : 'set',// 唯一标识
					title : '异动规定设置',// 这是标题
					width : 460,// 这是弹窗宽度。其实可以不写
					height : 440,// 弹窗高度
					okVal : '保存',
					cancelVal : '取消',
					ok : function(iframeObj) {
						// 保存
						setting.save(iframeObj);
					},
					cancel : function() {
						// 取消逻辑
					}
				});
		},
		
		/**
		 * 初始化设置页面
		 */
		initSet : function() {			
			// 获取url参数
			var settingId = utils.getUrlParam('settingId');
			// 加载默认数据
			setting.loadSetItem(settingId);
		},		
		
		/**
		 * 加载设置默认项
		 * @param id 设置Id
		 */
		loadSetItem : function(id) {
			// 请求数据
			ajaxData.request(url.ALIENCHANGESETTING_GETITEM, {settingId : id},
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData.settingId != null) {
								utils.setForm($("#addForm"),rvData); // 表单自动绑定
								// 绑定表单无法绑定的值
								$("#categoryName").text(rvData.categoryName);
								if(rvData.trainingLevelCodeName != null){
									$("#trainingLevelCodeName").text(rvData.trainingLevelCodeName);	
								}
								// 绑定下拉选项
								if (rvData.categoryCode == dataDictionary.ALIENCHANGE_CATEGORY_OTHER){
									// 异动类别为其他
									// 在校状态
									simpleSelect.loadDictionarySelect(
													"schoolStatusCode",
													dataDictionary.SCHOOL_STATUS_CODE,{
														defaultValue : rvData.schoolStatusCode,
														firstText : dataConstant.PLEASE_SELECT,
														firstValue : ""
													});
									// 学生当前状态
									simpleSelect.loadDictionarySelect(
													"currentStatusCode",
													dataDictionary.CURRENT_STATUS_CODE,{
														defaultValue : rvData.currentStatusCode,
														firstText : dataConstant.PLEASE_SELECT,
														firstValue : ""
													});
									// 学籍状态
									simpleSelect.loadDictionarySelect(
													"archievesStatusCode",
													dataDictionary.ARCHIEVES_STATUS_CODE,{
														defaultValue : rvData.archievesStatusCode,
														firstText : dataConstant.PLEASE_SELECT,
														firstValue : ""
													});
									// 是否确定班级
									simpleSelect.loadDictionarySelect(
													"confirmClassCode",
													dataDictionary.STUDENT_CONFIRM_CLASS_CODE,{
														defaultValue : rvData.confirmClassCode,
														firstText : dataConstant.PLEASE_SELECT,
														firstValue : ""
													});
								}else{
									// 在校状态
									simpleSelect.loadDictionarySelect(
													"schoolStatusCode",
													dataDictionary.SCHOOL_STATUS_CODE,{
														defaultValue : rvData.schoolStatusCode
													});
									// 学生当前状态
									simpleSelect.loadDictionarySelect(
													"currentStatusCode",
													dataDictionary.CURRENT_STATUS_CODE,{
														defaultValue : rvData.currentStatusCode
													});
									// 学籍状态
									simpleSelect.loadDictionarySelect(
													"archievesStatusCode",
													dataDictionary.ARCHIEVES_STATUS_CODE,{
														defaultValue : rvData.archievesStatusCode
													});
									if (rvData.canBeConfirmedClass == canBeConfirmedClassEnum.YES.value){
										// 是否确定班级
										simpleSelect.loadDictionarySelect(
												"confirmClassCode",
												dataDictionary.STUDENT_CONFIRM_CLASS_CODE,{
													defaultValue : rvData.confirmClassCode
												});
										
									}else{
										$('#confirmClassCode').prop("disabled",true);
									}
								}
							}
						}
					});			
		},	
		
		/**
		 * 保存设置
		 * 
		 * @param iframeObj 窗体对象
		 */
		save : function(iframeObj) {
			var saveParams = utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));// 获取要保存的参数
			ajaxData.request(url.ALIENCHANGESETTING_SAVE, saveParams, function(
					data) {
				if (data.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("保存成功", function() {
					});
					// 刷新列表
					setting.loadList();
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}
			});
		},
		
		/**
		 * 启用/禁用
		 * 
		 * @param obj this对象
		 */
		setStatus : function(obj) {
			var settingId = $(obj).parent().attr("td-data-id");
			var status = $(obj).parent().attr("td-status");// 状态
			var categoryName = $(obj).parent().attr("td-categoryName");// 类别名称
			status = status == isEnabledEnum.Enable.value ? isEnabledEnum.Disable.value
					: isEnabledEnum.Enable.value;// 状态为已启用时设置为禁用
			setting.setStatus_isEnabled(settingId, status, categoryName);
		},		
		
		/**
		 * 更新启用/禁用状态
		 * 
		 * @param id 设置Id
		 * @param status 状态1/0
		 * @param categoryName 类别名称
		 */
		setStatus_isEnabled : function(id, status,categoryName) {
			// 参数
			var param = {
				"settingId" : id,
				"status" : status
			};
			var msg = (status == isEnabledEnum.Enable.value) ? "启用" : "禁用";
			popup.askPop("确认" + msg + categoryName + "吗？", function() {
				ajaxData.request(url.ALIENCHANGESETTING_SAVESTATUS, param,
						function(data) {
							if (data.code == config.RSP_SUCCESS) {
								// 提示成功
								popup.okPop(msg + "成功", function() {
								});
								// 刷新列表
								setting.loadList();
							} else {
								// 提示失败
								popup.errPop(data.msg);
							}
						});

			});
		}
	}
	module.exports = setting;
	window.alienChange = setting;
});
