/**
 * 查询班级课表
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
	var urlTeacher = require("basePath/config/url.teacherservice");// 教师服务url
	var urlData = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var scheduleUtil = require("./schedule"); // 课表初始化

	var classList = {
		// 初始化
		init : function() {
			var me =this;
			//学年学期 默认当前学年学期
			var semester = simpleSelect.loadCommonSmester("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "");
		    this.semester = semester;
		    var  academicYearSemester = $("#academicYearSemesterSelect").val();
		    //班级
		    var academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
		    var semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
			 // 班级
			simpleSelect.loadSelect("classSelect",urlTeacher.TEACHER_GETCLASSINFOINSCHOOL,{academicYear:academicYear,semesterCode:semesterCode}, {async:false});
		   
		    //学年学期联动班级
		    $("#academicYearSemesterSelect").change(function(){
		    	 console.log(111)
	             academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
		         semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
	             simpleSelect.loadSelect("classSelect",urlTeacher.TEACHER_GETCLASSINFOINSCHOOL,{academicYear:academicYear,semesterCode:semesterCode}, {async:false});
			});
			// 加载学校信息
            this.loadSchool(); 
            // 加载班级课表集合
			classList.loadDaySectionNum(); 
			// 查询
			$("#query").click(function() {
				classList.loadDaySectionNum();
			});

			//打印
			$("#print").click(function() {
				classList.print();
			});
		},
		/**
		 * 加载班级课表集合
		 */
		loadList:function(){
			var me = this;
			var param = {
				academicYear:me.semester.getAcademicYear(),
				semesterCode:me.semester.getSemesterCode(),
				classId:$("#classSelect").val(),
				isCoreCurriculum:$("#isCoreCurriculum").val(),
			}
			ajaxData.request(urlTeacher.TEACHER_SCHEDULE_GETCLASSSCHEDULELIST, param, function(resData) {
				if (resData.code === config.RSP_SUCCESS && resData.data && resData.data.length > 0) {
                    $("#print").prop("disabled",false).addClass("btn-success");
					var classSchedule = resData.data[0];
					
					//时间设置 -- 一天多少节次
					var timesettings = me.timeSetting;
					//获取一周中从哪天开始上课
					me.schedule = new scheduleUtil("divBody",{
						weekNum: me.weekNum,
						fromhtml:"class", // class,teacher,teachRoom,course
						section:{
							am: timesettings.amSectionNumber,
							pm: timesettings.pmSectionNumber,
							night: timesettings.nightSectionNumber
						},
						data:resData.data[0],
						invok:me
					});
					
					me.classScheduleList = resData.data[0];
					me.classNo = 0;
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

	module.exports = classList; // 根文件夹名称一致
	window.classList = classList;
});