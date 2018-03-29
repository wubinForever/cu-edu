/**
 * 学生选课课表
 */
define(function(require, exports, module) {
	/**
	 * 导入JS
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var base = config.base;
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");

	// URL
	var urlData = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var URL_STUDENTSERVICE = require("basePath/config/url.studentservice");
	var constant = require("basePath/config/data.constant");

	var scheduleUtil = require("./schedule"); // 课表初始化

	// 变量名跟文件夹名称一致
	var studentschedule = {
		/**
		 * 初始化
		 */
		init : function() {
			this.loadDaySectionNum(); // 加载班级课表集合
		},
		/**
		 * 查询条件
		 */
		queryObject : function() {
			var reqData = {};
			reqData.academicYear = $("#academicYear").val();
			reqData.semesterCode = $("#semesterCode").val();
			return reqData;
		},
		/**
		 * 加载日排课节次
		 */
		loadDaySectionNum : function() {
			var me = this;
			var reqData = choiceresult.queryObject();
			if (utils.isNotEmpty(reqData.academicYear)) {
				ajaxData.request(urlCoursePlan.PARAMETER_TIME_GETITEM, reqData, function(data) {
					me.timeSetting = data.data;
					me.getWeekNum();
				});
			}
			else {
				studentschedule.getNoDataHtml();
			}
		},
		/**
		 * 获取星期
		 */
		getWeekNum : function() {
			var me = this;
			var reqData = choiceresult.queryObject();
			ajaxData.request(urlData.SCHOOLCALENDAR_GETCALENDAR, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var weekStartDay = data.data.weekStartDay;
					var result = [];
					if (me.timeSetting) {
						var weekSize = me.timeSetting.weekCourseDays;
						for (var i = 1; i < weekSize + 1; i++) {
							if (weekStartDay == 0) {
								if (i === 1) {
									result.push(7);
								} else {
									result.push(i - 1);
								}
							} else {
								result.push(i);
							}
						}
					}
					me.weekNum = result;
				} else {
					popup.errPop("查询失败：" + data.msg);
				}

				me.loadList();
			});
		},
		/**
		 * 加载班级课表集合
		 */
		loadList : function() {
			var me = this;
			var reqData = choiceresult.queryObject();
			ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_GETSTUDENTSCHEDULELIST, reqData, function(data) {
				if (data.code === config.RSP_SUCCESS && data.data) {
					if (data.data.studentId == null) {
						studentschedule.getNoDataHtml();
					} else {
						// 时间设置 -- 一天多少节次
						var timesettings = me.timeSetting;
						// 获取一周中从哪天开始上课
						me.schedule = new scheduleUtil("divBody", {
							weekNum : me.weekNum,
							section : {
								am : timesettings.amSectionNumber,
								pm : timesettings.pmSectionNumber,
								night : timesettings.nightSectionNumber
							},
							data : data.data,
							invok : me
						});
					}
				} else {
					studentschedule.getNoDataHtml();
				}
			},true);
		},
		/**
		 * 课表无数据
		 */
		getNoDataHtml : function() {
			$("#divBody").empty().append(
					$('<table class="table"><tbody class="no-data-html"><tr><td></td></tr></tbody></table>'));

		}
	}

	module.exports = studentschedule; // 根文件夹名称一致
});