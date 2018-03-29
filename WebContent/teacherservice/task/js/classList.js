/**
 * 教学班查看
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
	 * 教学班查看
	 */
	var classList = {			
		
		/**
		 * 初始化教学班
		 */
		init : function() {
			//初始化列表
			this.loadList();
		},
		/**
		 * 初始化列表
		 */
		 loadList:function(){
		 	var param = popup.data("param");
				param.teachingClassId = popup.data("teachingClassId");
			// 理论课程教学任务列表
			ajaxData.request(urlTeacher.TEACHER_SCORE_GET_COURSETEACHINGTASKTEACHINGCLASS, param, function(resData) {
				var infoData = resData.data;
				if (resData.code === config.RSP_SUCCESS && infoData.length > 0) {
					var course = "["+popup.data("courseNo")+"]"+popup.data("courseName");
					var classNameNo = popup.data("teachingClassNo");
					var classCount = popup.data("classCount");
					$("#course").text(course).attr("title",course);
				    $("#classNameNo").text(classNameNo).attr("title",classNameNo);
				    $("#classCount").text(classCount).attr("title",classCount);
                    $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(infoData)).removeClass("no-data-html");
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
				}
			});
		 }
	}
	module.exports = classList;
	window.classList = classList;
});
