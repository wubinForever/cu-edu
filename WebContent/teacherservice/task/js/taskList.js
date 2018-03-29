/**
 * 教学任务
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
    var urlTeacher = require("configPath/url.teacherservice");// 教师服务url
	var base = config.base;	
	
	/**
	 * 教学任务
	 */
	var teachingTask = {				
		/**
		 * 初始化教学任务
		 */
		init : function() {
			//学年学期 默认当前学年学期
			simpleSelect.loadCommonSmester("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "");
			//初始化列表
			this.loadList();


			 //查询
		    $("#academicYearSemesterSelect").change(function(){
		    	teachingTask.loadList();
			});

			// 教学班查看
			$(document).on("click","button[name='classCheck']",function() {
				var courseNo = $(this).parents("tr").find("td[courseno]").attr("courseno");
				var courseName = $(this).parents("tr").find("td[coursename]").attr("courseName");
				var teachingClassId = $(this).parents("tr").find("td[teachingclassid]").attr("teachingclassid");
				var teachingClassNo = $(this).parents("tr").find("td[teachingclassno]").attr("teachingClassNo");
				var classCount = $(this).parents("tr").find("td.classCount").attr("title");
				popup.data("courseNo",courseNo);
				popup.data("courseName",courseName);
				popup.data("teachingClassId",teachingClassId);
				popup.data("teachingClassNo",teachingClassNo);
				popup.data("classCount",classCount);
				teachingTask.showClass();
			});
			// 环节人数查看
			$(document).on("click","button[name='rollCheck']",function() {
				var practicalArrangeId = $(this).parent().attr("practicalarrangeid");
				var courseName = $(this).parents("tr").find("td.courseName").attr("title");
				var groupNo =  $(this).parents("tr").find("td.groupNo").attr("title");
				var memberCount =  $(this).parents("tr").find("td.memberCount").attr("title");
				popup.data("practicalArrangeId",practicalArrangeId);
				popup.data("courseName",courseName);
				popup.data("groupNo",groupNo);
				popup.data("memberCount",memberCount);
				teachingTask.showRoll();
			});
		},
		/**
		 * 初始化列表
		 */
		 loadList:function(){
			var param = {
				academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
				semesterCode:$("#academicYearSemesterSelect").val().split("_")[1]
			}
			// 理论课程教学任务列表
			ajaxData.request(urlTeacher.TEACHER_SCORE_GET_COURSETEACHINGTASKLIST, param, function(resData) {
				if (resData.code === config.RSP_SUCCESS && resData.data && resData.data.length > 0) {
					$("#coursecount").text(resData.data.length);
                    $("#tbodycontentone").empty().append($("#bodyContentImplOne").tmpl(resData.data)).removeClass("no-data-html");
				} else {
					$("#coursecount").text(0);
					$("#tbodycontentone").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
				}
			},true);
            var rollParam = {
            	academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
				semesterCode:$("#academicYearSemesterSelect").val().split("_")[1]
            }
			// 实践环节教学任务列表
			ajaxData.request(urlTeacher.TEACHER_SCORE_GET_PRACTICETEACHINGTASKLIST, rollParam, function(resData) {
				if (resData.code === config.RSP_SUCCESS && resData.data && resData.data.length > 0) {
					$("#practicecount").text(resData.data.length);
                    $("#tbodycontenttwo").empty().append($("#bodyContentImplTwo").tmpl(resData.data)).removeClass("no-data-html");
				} else {
					$("#practicecount").text(0);
					$("#tbodycontenttwo").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
				}
			},true);
		 },
		/**
		 * 教学班查看
		 */
		showClass : function() {
		    var academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
			var	semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
			popup.data("param", {academicYear : academicYear,semesterCode : semesterCode});
			var showClass =  popup.open('./teacherservice/task/html/classList.html',{
				id : 'showClass',// 唯一标识
				title : '教学班查看',// 这是标题
				width : 900,// 这是弹窗宽度。其实可以不写
				height : 500,// 弹窗高度
				cancelVal: '关闭',
			    cancel: true //为true等价于function(){}
			});
		},
		/**
		 * 环节人数查看
		 */
		showRoll : function() {
			var showRoll =  popup.open('./teacherservice/task/html/rollList.html',{
				id : 'showRoll',// 唯一标识
				title : '环节人数查看',// 这是标题
				width : 1000,// 这是弹窗宽度。其实可以不写
				height : 600,// 弹窗高度
				cancelVal: '关闭',
			    cancel: true //为true等价于function(){}
			});
		},
	}
	module.exports = teachingTask;
	window.teachingTask = teachingTask;
});
