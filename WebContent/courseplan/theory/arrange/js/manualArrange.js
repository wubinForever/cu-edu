/**
 * 手动排课
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); // 复选单选
	var pagination = require("basePath/utils/pagination");
	var timeNotice = require("../../../common/js/timeNotice");

	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");

	// URL
	var URL = require("basePath/config/url.udf");
	var URLDATA = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var dictionary = require("basePath/config/data.dictionary");
	var constant = require("basePath/config/data.constant");
	var ScheduleSettingsEnterPage = require("basePath/enumeration/courseplan/ScheduleSettingsEnterPage");

	// 变量名跟文件夹名称一致
	var manualArrange = {
		// 初始化
		init : function() {
			//判断当前时间是否能进入
			regData ={};
			regData.enterPage = ScheduleSettingsEnterPage.ScheduleArrange.value;
			timeNotice.init(regData);
			
			// 默认加载当前排课学年学期
			var semester = simpleSelect.loadCourseSmester("academicSemester", true);
			this.semester = semester;

			// 绑定校区下拉框
			simpleSelect.loadCampus("campusId", true, "", constant.SELECT_ALL, "");
			// 绑定开课单位下拉框
			simpleSelect.loadAuthStartClass("departmentId", {isAuthority : true}, "", constant.SELECT_ALL, "");
			// 绑定课程类别下拉框(数据字典获取)
			simpleSelect.loadDictionarySelect("courseTypeCode",dictionary.COURSE_TYPE_CODE,{firstText:constant.SELECT_ALL,firstValue:""});
			// 绑定课程熟悉下拉框(数据字典获取)
			simpleSelect.loadDictionarySelect("courseAttributeCode",dictionary.COURSE_ATTRIBUTE_CODE,{firstText:constant.SELECT_ALL,firstValue:""});

			// 初始加载列表数据，根据学年学期
			var param = {};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();

			manualArrange.pagination = new pagination({
				url : urlCoursePlan.ARRANGE_MANUALARRANGE_GETPAGEDLIST,
				param : param
			}, function(data) {
				if (data.length > 0) {
					$("#tbodycontent").empty().append($("#tableTmpl").tmpl(data)).removeClass("no-data-html");
					$("#pagination").show();
					//添加title
					common.titleInit();
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='16'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			}).init();

			this.bindEvent();
		},
		/*
		 * 设置时间范围，日期加载
		 */
		dateInit : function(){
			(function ($) {
                $.getUrlParam = function (name) {
                    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
                    var r = window.location.search.substr(1).match(reg);
                    if (r != null) return unescape(r[2]); return null;
                }
            })(jQuery);
             var startTime = $.getUrlParam('startTime'),
             	 endTime = $.getUrlParam('endTime');
            
			$("#settingsTimeStart").html(startTime);
			$("#settingsTimeEnd").html(endTime);
		},
		/**
		 * 绑定事件
		 */
		bindEvent:function(){
			// 查询
			$("#query").click(function(){
				manualArrange.pagination.setParam(manualArrange.getQueryParam());
			});
			
			// 手动排课弹窗
			$(document).on("click", "[name='update']", function() {
				manualArrange.rangeClass(this);
			});
		},
		
		getQueryParam:function(){
			var param={};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
			param.campusId = $("#campusId").val();
			param.departmentId = $("#departmentId").val();
			param.courseNoOrName = $("#courseNoOrName").val();
			param.courseTypeCode = $("#courseTypeCode").val();
			param.courseAttributeCode = $("#courseAttributeCode").val();
			param.teacherNoOrName = $("#teacherNoOrName").val();
			param.isCoreCurriculum = $("#isCoreCurriculum").val();
			param.arrangeStatus = $("#arrangeStatus").val();
			
			return param;
		},

		// 手动排课设置
		rangeClass : function(obj) {
			var me = this;
			popup.setData("data",{theoreticalTaskId:$(obj).attr("data-tt-id")});
			popup.open('./courseplan/theory/arrange/html/add.html', // 这里是页面的路径地址
			{
				id : 'rangeClass',// 唯一标识
				title : '手动排课',// 这是标题
				width : 1280,// 这是弹窗宽度。其实可以不写
				height : 650,// 弹窗高度*/
				okVal : '关闭',
				fixed : true,
				ok : function() {
				},
				close : function() {
					me.pagination.loadData();
				}
			});
		},
	}

	module.exports = manualArrange; // 根文件夹名称一致
});