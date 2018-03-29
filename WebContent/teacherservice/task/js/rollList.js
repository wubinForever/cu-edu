/**
 * 环节查看
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
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var urlData = require("configPath/url.data");// 基础数据url
	var urlUdf = require("basePath/config/url.udf");// 基础框架url
	var urlTeacher = require("configPath/url.teacherservice");// 教师服务url
	
	/**
	 * 环节查看
	 */
	var rollList = {			
		
		/**
		 * 初始化环节
		 */
		init : function() {
			//初始化列表
			this.loadList();
		},
		/**
		 * 初始化列表
		 */
		 loadList:function(){
		 	var practicalArrangeId = popup.data("practicalArrangeId");
			// 课程教学任务列表
			ajaxData.request(urlTeacher.TEACHER_SCORE_GET_PRACTICETEACHINGTASKCLASS,{practicalArrangeId : practicalArrangeId}, function(resData) {
				var infoData = resData.data;
				if (resData.code === config.RSP_SUCCESS && infoData.length > 0) {
				    $("#courseName").text(popup.data("courseName")).attr("title",popup.data("courseName"));
				    $("#groupNo").text(popup.data("groupNo")).attr("title",popup.data("groupNo"));
				    $("#memberCount").text(popup.data("memberCount")).attr("title",popup.data("memberCount"));
                    $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(infoData)).removeClass("no-data-html");
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
				}
			});
		 }
	}
	module.exports = rollList;
	window.rollList = rollList;
});
