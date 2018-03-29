/**
 * 开课计划维护时间控制
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var url = require("configPath/url.trainplan");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var dataDictionary = require("configPath/data.dictionary");
	// 下拉框
	var base = config.base;
	/**
	 * 开课计划维护时间控制
	 */
	var settime = {
		// 初始化
		init : function() {
			settime.getUnitList();
			// 保存
			$(document).on("click", "button[name='save']", function() {
				settime.save();
			});
			// 取消
			$(document).on("click", "button[name='cancel']", function() {
				settime.cancel();
			});
			// 初始化表单校验
			settime.initFormDataValidate($("#setForm"));
		},
		/**
		 * 保存
		 */
		save : function() {
			var saveParams = utils.getQueryParamsByFormObject($("#setForm"));// 获取要保存的参数
			
			var beginTime = $("#beginTime").val();
			var endTime = $("#endTime").val();
			if(endTime<beginTime){
				popup.warPop("结束时间必须大于开始时间");
				return false;
			}
			ajaxData.contructor(false);
			ajaxData.request(url.OPENTIME_UPDATE, saveParams, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("保存成功", function() {
					});
					// 刷新列表
					//settime.getUnitList();
				} else {
					// 提示失败
					popup.errPop(data.msg);
					return false;
				}
			});
		},
		/**
		 * 取消
		 */
		cancel : function() {
			settime.getUnitList();
		},
		// 查询开课单位信息
		getUnitList : function() {
			ajaxData.request(url.OPENTIME_LIST, null, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) 
				{
					rvData = data.data;
					if(utils.isNotEmpty(rvData.beginTime))
					{
						$("#beginTime").val( new Date(rvData.beginTime).format("yyyy-MM-dd hh:mm")); // 开始时间
					}
					if(utils.isNotEmpty(rvData.endTime))
					{
						$("#endTime").val( new Date(rvData.endTime).format("yyyy-MM-dd hh:mm")); // 结束时间
					}
				}
			});
		},
		/**
		 * 初始化新增、编辑表单校验 formJQueryObj 表单jquery对象
		 */
		initFormDataValidate : function(formJQueryObj) {
			ve.validateEx();
			formJQueryObj.validate({
				rules : {
					endTime : {
						"required" : true,
						"isDateTimeFormat" : true,
					},
					beginTime : {
						"required" : true,
						"isDateTimeFormat" : true,
					}
				},
				messages : {
					endTime : {
						"required" : '结束时间不能为空',
						"isDateTimeFormat" : '输入日期格式不正确，如：2017-11-9 10:30',
					},
					beginTime : {
						"required" : '开始时间不能为空',
						"isDateTimeFormat" : '输入日期格式不正确，如：2017-11-9 10:30',
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
		},
	}
	module.exports = settime;
	window.settime = settime;
});
