/**
 * 查询个人课表
 */
define(function(require, exports, module) {
	/**
	 * 导入JS
	 */
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	// 下拉框
	var simpleSelect = require("basePath/module/select.simple");
	// URL
	var urlStu = require("basePath/config/url.studentservice");// 学生服务url
	var urlData = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var isYesNoEnum = require("basePath/enumeration/common/IsYesOrNo");//状态枚举
    var scheduleUtil = require("./schedule"); // 课表初始化

	var personalTimetable = {
		// 初始化
		init : function() {
			var me =this;
			//学年学期 默认当前学年学期
			var semester = simpleSelect.loadCommonSmester("academicYearSemesterSelect",urlStu.ARCHIVESREGISTER_GET_ACADEMICYEARSEMESTER, "", "", "");
            this.semester = semester;
            // 加载学校信息
            this.loadSchool(); 
            //加载个人课表集合
			this.loadDaySectionNum(); 
			
			// 查询
			$("#academicYearSemesterSelect").on("change",function() {
				me.loadDaySectionNum();
			});

			//打印
			$("#print").click(function() {
		        me.print();
			});
		},
		/**
		 * 加载个人课表集合
		 */
		loadList : function() {
			var me = this;
			var reqData = {
				academicYear:me.semester.getAcademicYear(),
				semesterCode:me.semester.getSemesterCode(),
				publishStatus:isYesNoEnum.Yes.value
			}
			ajaxData.request(urlStu.CHOICECENTER_GETSTUDENTSCHEDULELIST, reqData, function(resdata) {
				if (resdata.code === config.RSP_SUCCESS && resdata.data) {
						if (resdata.data.studentId == null) {
							$("#divBody").empty().append($('<table class="table"><tbody class="no-data-html"><tr><td></td></tr></tbody></table>'));
						    $("#print").prop("disabled",true).removeClass("btn-success");
						} else {
							$("#print").prop("disabled",false).addClass("btn-success");
                            var practice = resdata.data.practiceWeek
							// 时间设置 -- 一天多少节次
							var timesettings = me.timeSetting;
							// 获取一周中从哪天开始上课
							me.schedule = new scheduleUtil("divBody", {
								weekNum : me.weekNum,
								fromhtml:"class",
								section : {
									am : timesettings.amSectionNumber,
									pm : timesettings.pmSectionNumber,
									night : timesettings.nightSectionNumber
								},
								data : resdata.data,
								invok : me
							});
						}
				} else {
					$("#divBody").empty().append($('<table class="table"><tbody class="no-data-html"><tr><td></td></tr></tbody></table>'));
				    $("#print").prop("disabled",true).removeClass("btn-success");
				}
			});
		},
		/**
		 * 加载学校信息
		 */
		loadSchool:function(){
			var me = this;
			ajaxData.contructor(false);
			ajaxData.request(urlData.SCHOOL_GET, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					me.school = data.data.schoolName;
				}
			});	
		},
		/**
		 * 加载日排课节次
		 */
		loadDaySectionNum : function() {
			var me = this;
			var reqData = {};
			reqData.academicYear = me.semester.getAcademicYear();
			reqData.semesterCode = me.semester.getSemesterCode();
			ajaxData.request(urlCoursePlan.PARAMETER_TIME_GETITEM, reqData, function(data) {
				me.timeSetting = data.data;
				me.getWeekNum();
			});
		},
		/**
		 * 获取星期
		 */
		getWeekNum : function() {
			var me = this;
			var reqData = {};
			reqData.academicYear = me.semester.getAcademicYear();
			reqData.semesterCode = me.semester.getSemesterCode();
			ajaxData.request(urlData.SCHOOLCALENDAR_GETCALENDAR, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var weekStartDay = data.data.weekStartDay;
					var result = [];
					if(me.timeSetting){
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
		 * 打印
		 */
		print : function(){
		  	$("#divBody").jqprint();
	    }

	}

	module.exports = personalTimetable; 
	window.personalTimetable = personalTimetable;
});