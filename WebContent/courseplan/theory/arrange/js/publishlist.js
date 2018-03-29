/**
 * 排课结果发布
 */
define(function(require, exports, module) {
	/**
	 * 导入JS
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var helper = require("basePath/utils/tmpl.helper");

	// URL
	var urlCoursePlan = require("basePath/config/url.courseplan");


	var publishlist = {
		init : function() {
			publishlist.loadTable();
			
			// 发布按钮
			$(document).on("click", "button[name='publish']", function() {
				publishlist.savePublish(this);
			});
		},
		loadTable:function(){
			// 加载列表
			ajaxData.request(urlCoursePlan.ARRANGE_PUBLISH_GETALLPUBLISHLIST, null, function(data) {
				if (data.code === config.RSP_SUCCESS) {
					$("#tbodycontent").empty().append($("#tableTmpl").tmpl(data.data, helper)).setNoDataHtml();
				}
			});
		},
		/**
		 * 保存
		 */
		savePublish:function(obj){
			var param = publishlist.getQueryParam(obj);
			
			var msg = "";
			if (param.publishStatus === 1) {
				msg = "发布";
			} else {
				msg = "取消发布";
			}
			popup.askPop("确认" + msg + "此课表吗？", function() {
				// 保存信息
				ajaxData.request(urlCoursePlan.ARRANGE_PUBLISH_INSERTORUPDATEPUBLISH, param, function(data) {
					if (data.code === config.RSP_SUCCESS) {
						publishlist.loadTable();
						popup.okPop(msg + "成功");
					} else {
						// 提示失败
						popup.okPop(msg + "失败");
						return false;
					}
				});
			});
		},
		/**
		 * 获取保存的信息
		 */
		getQueryParam : function(obj) {
			var item = $(obj).parent().parent();
			var param={};
			param.timeSettingsId = item.attr("timeSettingsId");
			param.publishStatus = item.attr("publishStatus") && item.attr("publishStatus") === "1" ? 0 : 1;
			return param;
		}
	};

	module.exports = publishlist; // 与当前文件名一致
});