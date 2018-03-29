/**
 * 教师课表
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
	var authority = require("basePath/utils/authority");

	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");

	// URL
	var url = require("basePath/config/url.udf");
	var urlData = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var urlDictionary = require("basePath/config/data.dictionary");
	var constant = require("basePath/config/data.constant");

	var scheduleUtil = require("./schedule"); // 课表初始化

	// 变量名跟文件夹名称一致
	var teacherlist = {
		// 初始化
		init : function() {
			// 默认加载当前排课学年学期
			var semester = simpleSelect.loadCommonSmester("academicSemester", urlData.COMMON_GETSEMESTERLIST,"");
//			var semester = simpleSelect.loadCourseSmester("academicSemester", true);
			this.semester = semester;

			// 绑定院系开课单位下拉框
			simpleSelect.loadDepartmentStartClass("departmentId", {isAuthority : true}, "", constant.SELECT_ALL, "");

			this.loadSchool(); // 加载学校信息
			this.loadDaySectionNum(); // 加载教师课表集合

			this.bindEvent();
		},
		/**
		 * 绑定事件
		 */
		bindEvent:function(){
			var me = this;
			$("#btnLoadMore").click(function(){
				var param={};
				param.academicYear = me.queryParam.academicYear;
				param.semesterCode = me.queryParam.semesterCode;
				param.teacherId = me.teacherList[me.teacherNo].teacherId;
				me.loadList(param);
			});
			$("#query").click(function(){
				me.teacherNo=0;
				me.loadDaySectionNum();
			});
			$("#print").click(function(){
				me.printHtml();
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

				var param = me.getQueryParam();
				me.loadList(param);
			});
		},
		/**
		 * 加载教师课表集合
		 */
		loadList:function(param){
			var me = this;
			ajaxData.request(urlCoursePlan.ARRANGE_SCHEDULE_GETTEACHERSCHEDULELIST, param, function(data) {
				if (data.code === config.RSP_SUCCESS && data.data && data.data.length > 0) {
					var teacherSchedule = data.data[0];
					
					if (me.teacherNo) {
						me.teacherNo = me.teacherNo + 1;
						me.schedule.formatHtml(data.data[0],me.teacherNo);
					} else {
						$("#teacherCount").html(teacherSchedule.teacherCount);
						//时间设置 -- 一天多少节次
						var timesettings = me.timeSetting;
						//获取一周中从哪天开始上课
						me.schedule = new scheduleUtil("divBody",{
							weekNum: me.weekNum,
							fromhtml:"teacher", // class,teacher,teachRoom,course
							section:{
								am: timesettings.amSectionNumber,
								pm: timesettings.pmSectionNumber,
								night: timesettings.nightSectionNumber
							},
							data:data.data[0],
							invok:me
						});
						me.teacherNo = 1;
						me.teacherCount = teacherSchedule.teacherCount;
						me.teacherList = teacherSchedule.teacherList;
					}
					
					if (me.teacherCount > me.teacherNo) {
						$("#btnLoadMore").show();
					} else {
						$("#btnLoadMore").hide();
					}
				} else {
					if(!me.teacherNo){
						$("#teacherCount").html("0");
						$("#divBody").empty().append($('<table class="table"><tbody class="no-data-html"><tr><td></td></tr></tbody></table>')); 
					}
				}
			},true);
		},
		/**
		 * 获取保存查询条件
		 */
		getQueryParam:function(){
			var param={};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
			param.departmentId = $("#departmentId").val();
			param.teacherNoOrName = $("#teacherNoOrName").val();
			
			this.queryParam = param;
			return param;
		},
		printHtml:function(){
			var me = this;
			var param=me.queryParam;
			param.isPrint=1;
			
			// 若数据为空，不打印
			if($("#teacherCount").html()==="0"){
				$("#printBody").jqprint();
				$("#printBody").empty();
				return false;
			}

			ajaxData.request(urlCoursePlan.ARRANGE_SCHEDULE_GETTEACHERSCHEDULELIST, param, function(data) {
				if (data.code === config.RSP_SUCCESS && data.data) {
					var data = data.data;
					//时间设置 -- 一天多少节次
					var timesettings = me.timeSetting;
					//获取一周中从哪天开始上课
					me.printSchedule = new scheduleUtil("printBody",{
						weekNum: me.weekNum,
						fromhtml:"teacher", // class,teacher,teachRoom,course
						type:"print",//类型：打印 print
						section:{
							am: timesettings.amSectionNumber,
							pm: timesettings.pmSectionNumber,
							night: timesettings.nightSectionNumber
						},
						data:data[0],
						invok:me
					});
					
					$.each(data,function(i,item){
						if(i>0){
							me.printSchedule.formatHtml(data[i],i+1);
						}
					});
					
					$("#printBody").jqprint();
					$("#printBody").empty();
				}
			},true);
		}
	}

	module.exports = teacherlist; // 根文件夹名称一致
});