define(function(require, exports, module) {
	var popup = require("basePath/utils/popup");
	var URL_DATA = require("basePath/config/url.data");
	var simpleSelect = require("basePath/module/select.simple");
	var DICTIONARY = require("basePath/config/data.dictionary");
	var CONSTANT = require("basePath/config/data.constant");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var common = require("basePath/utils/common");
	var utils = require("basePath/utils/utils");
	/**
	 * 教室弹窗
	 */
	var teachgroup = {
		/**
		 * 绑定数据
		 */
		init : function() {
			this.bindEvent();			
			popup.setData("teachgroup", teachgroup);
		},
		/**
		 * 绑定事件
		 */
		bindEvent : function() {
			var semesterCourseData = popup.getData("semesterCourseData");// 查询当前学年学期该课程的教学组列表
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_TEACHGROUP, semesterCourseData, function(data) {
				$("#tbodycontent").html("");
				if (data != null && data.data.length > 0) {
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
				} else {
					// 没有数据时，默认显示10行空教学组
					var resultData = [];
					for (var i = 1; i <= 10; i++) {
						resultData.push({
							no : i
						});
					}
					$("#tbodycontent").html($("#tamplContent2").tmpl(resultData));
				}
			}, true);
		},
		/**
		 * 获取值
		 */
		getData : function() {
			var semesterCourseData = popup.getData("semesterCourseData");
			
			//01 判断该教学组是否被引用
			var flag = true;			
			var i = 0;
			$(".teachingGroupName").each(function() {
				var teachingGroupName = $(this).val();
				var id = $(this).attr("data-id");
				var exist = $(this).attr("data-exist");
				if (utils.isEmpty(teachingGroupName) && id != "" && exist=="true") {
					popup.warPop("第" + (i + 1) + "行教学组已关联教学任务，则此教学组名称不能为空");
					flag = false;
					return false;
				}			
				i++;
			});			
			if (!flag) {
				//被引用的教学名称不能为空
				return false;
			}
			
			//02 批量获取教学组名称、是否同上课地点
			var obj = [];
			var j = 0;
			$(".teachingGroupName").each(function() {
				var teachingGroupName = $(this).val();
				var id = $(this).attr("data-id");							
				if (utils.isNotEmpty(teachingGroupName)||utils.isNotEmpty(id)) {
					var isSamePlace = 0;
					if ($(".isSamePlace").eq(j).is(":checked")) {
						isSamePlace = 1;
					}
					obj.push({
						teachingGroupName : teachingGroupName,
						isSamePlace : isSamePlace,
						academicYear : semesterCourseData.academicYear,
						semesterCode : semesterCourseData.semesterCode,
						courseId : semesterCourseData.courseId,
						teachingGroupId:id
					});
				}
				j++;
			});			
			if (obj.length == 0) {
				popup.warPop("请填写教学组名称");
				return false;
			}		
			return obj;
		}
	}
	module.exports = teachgroup;
});