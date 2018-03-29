/**
 * 自动排课
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
	var autoArrange = {
		// 初始化
		init : function() {
			// 判断当前时间是否能进入
			regData = {};
			regData.enterPage = ScheduleSettingsEnterPage.ScheduleArrange.value;
			timeNotice.init(regData);

			// 默认加载当前排课学年学期
			var semester = simpleSelect.loadCourseSmester("academicSemester", true);
			this.semester = semester;

			/* 聚焦清空 */
			var arrangeWeek = $('#arrangeWeek');

			arrangeWeek.focus(function() {
				if (arrangeWeek.val() == "") {
					$(".weekName").hide();
				}
			});
			arrangeWeek.blur(function() {
				if (arrangeWeek.val() == "") {
					$(".weekName").show();
				}
			});

			var arrangeSection = $('#arrangeSection');

			arrangeSection.focus(function() {
				if (arrangeSection.val() == "") {
					$(".sectionName").hide();
				}
			});
			arrangeSection.blur(function() {
				if (arrangeSection.val() == "") {
					$(".sectionName").show();
				}
			});

			this.bindEvent();

			/** 测试自动排课 ** */
			// 初始加载列表数据，根据学年学期
			var param = {};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
            param.selectTheoreticalTask=0;
            param.arrangeType=0;
			ajaxData.request(urlCoursePlan.AUTO_ARRANGE_COURSE, param, function(data) {
				if (data.code === config.RSP_SUCCESS) {
					popup.okPop("成功");
				} else {
					// 提示失败
					popup.errPop("失败");
				}
			});
		},
		/*
		 * 设置时间范围，日期加载
		 */
		dateInit : function() {
			(function($) {
				$.getUrlParam = function(name) {
					var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
					var r = window.location.search.substr(1).match(reg);
					if (r != null)
						return unescape(r[2]);
					return null;
				}
			})(jQuery);
			var startTime = $.getUrlParam('startTime'), endTime = $.getUrlParam('endTime');

			$("#settingsTimeStart").html(startTime);
			$("#settingsTimeEnd").html(endTime);
		},
		/**
		 * 绑定事件
		 */
		bindEvent : function() {
			/*
			 * // 查询 $("#query").click(function(){
			 * autoArrange.pagination.setParam(autoArrange.getQueryParam()); }); //
			 * 手动排课弹窗 $(document).on("click", "[name='update']", function() {
			 * autoArrange.rangeClass(this); });
			 */
		},

		getQueryParam : function() {
			var param = {};
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
		}
	}

	module.exports = autoArrange; // 根文件夹名称一致
});