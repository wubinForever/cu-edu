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
	var base = config.base;	

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
			$("#autoArrange").click(function(){
				popup.open(base+'/courseplan/theory/arrange/html/autoaddtips.html', // 这里是页面的路径地址
				{
					id : 'autoaddtips',// 唯一标识
					title : '提示信息',// 这是标题
					width : 440,// 这是弹窗宽度。其实可以不写
					height :155,// 弹窗高度
					okVal : '确定',
					cancelVal : '取消',
					ok : function(iframeObj) {
						// 确定逻辑
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						var deleteLocked = iframe.$("#deleteLocked").is(":checked");//设置项：删除已排已锁定数据并重排
						var deleteUnlocked = iframe.$("#deleteUnlocked").is(":checked");//设置项：删除已排未锁定数据并重排
						var params=autoArrange.getQueryParam(deleteLocked, deleteUnlocked);
						// post请求提交数据
						ajaxData.request(urlCoursePlan.AUTO_ARRANGE_COURSE, params,
							function(rvData) {
								if (rvData == null)
									return false;
								if (rvData.code == config.RSP_SUCCESS) {
									// 提示成功
									popup.okPop("自动排课成功", function() {});
								} else {
									// 提示失败
									popup.errPop(rvData.msg);
									return false;
								}
							},true);
					},
					cancel : function() {
						// 取消逻辑
					}
				});
			})
		},

		getQueryParam : function(deleteLocked, deleteUnlocked) {
			var param = {};
			//学年
			param.academicYear = this.semester.getAcademicYear();
			//学期
			param.semesterCode = this.semester.getSemesterCode();
			//排课预处理
			param.shieldMajor = $("#shieldMajor").is(":checked") ? 1 : 0;
			param.shieldRoom = $("#shieldRoom").is(":checked") ? 1 : 0;
			param.shieldCourse = $("#shieldCourse").is(":checked") ? 1 : 0;
			param.shieldTeacher = $("#shieldTeacher").is(":checked") ? 1 : 0;
			param.shieldSectionRequire = $("#shieldSectionRequire").is(":checked") ? 1 : 0;
			param.shieldRoomTypeRequire = $("#shieldRoomTypeRequire").is(":checked") ? 1 : 0;
			param.shieldBuildRequire = $("#shieldBuildRequire").is(":checked") ? 1 : 0;
			param.shieldRoomRequire = $("#shieldRoomRequire").is(":checked") ? 1 : 0;
			//排课时间
			param.arrangeWeek = $("#arrangeWeek").val();
			param.arrangeSection = $("#arrangeSection").val();
			//排课范围
			param.selectTheoreticalTask = $("#selectTheoreticalTask").is(":checked") ? 1 : 0;
			//教室安排
			param.roomCondition = $("[name=roomCondition]:checked").val();
			//教师安排
			param.teacherTransCampus = $("#teacherTransCampus").is(":checked") ? 1 : 0;
			param.teacherSameRoom = $("#teacherSameRoom").is(":checked") ? 1 : 0;
			param.teacherContinuousTime = $("#teacherContinuousTime").is(":checked") ? 1 : 0;
			//冲突安排
			param.detectionClass = $("#detectionClass").is(":checked") ? 1 : 0;
			//体育课安排
			param.peNoSection = $("#ckPeNoSection").is(":checked") ? $("#peNoSection").val() : "";
			param.peNoCourse = $("#peNoCourse").is(":checked") ? 1 : 0;
			
			//重排规则
			if(deleteLocked && deleteUnlocked)
			{
				param.arrangeType = 3;
			}
			else if(deleteUnlocked){
				param.arrangeType = 2;
			}
			else if(deleteLocked){
				param.arrangeType = 1;
			}
			else
			{
				param.arrangeType = 0;
			}
			
			return param;
		}
	}

	module.exports = autoArrange; // 根文件夹名称一致
});