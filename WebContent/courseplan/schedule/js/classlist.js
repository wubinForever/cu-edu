/**
 * 班级课表
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
	var urlTrainplan = require("basePath/config/url.trainplan");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var urlDictionary = require("basePath/config/data.dictionary");
	var constant = require("basePath/config/data.constant");

	var scheduleUtil = require("./schedule"); // 课表初始化

	// 变量名跟文件夹名称一致
	var classlist = {
		// 初始化
		init : function() {
			
			// 默认加载当前排课学年学期
			var semester = simpleSelect.loadCommonSmester("academicSemester", urlData.COMMON_GETSEMESTERLIST,"");
			this.semester = semester;

			// 绑定校区下拉框
			simpleSelect.loadCampus("campusId", true, "", constant.SELECT_ALL, "");
			// 加载年级列表
			simpleSelect.loadCommon("grade", urlTrainplan.GRADEMAJOR_GRADELIST, null, "", constant.SELECT_ALL, "", null);
			// 加载院系
			simpleSelect.loadSelect("departmentId", urlData.DEPARTMENT_GETDEPTLISTBYCLASS, {
				departmentClassCode : "1",
				isAuthority : true
			}, {
				firstText : constant.SELECT_ALL,
				firstValue : "",
				async : false
			});
			// 加载专业
		    simpleSelect.loadCommon("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,null,"","全部","");
			// 年级联动专业
			$("#grade").change(function(){
				var reqData={};
				reqData.grade =$(this).val();
			    reqData.departmentId=$("#departmentId").val();
			    if(utils.isEmpty($(this).val())&& utils.isEmpty($("#departmentId").val())){
				    simpleSelect.loadCommon("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,null,"","全部","");
			    	return false;
			    }
			    simpleSelect.loadCommon("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,reqData,"","全部","");
			});
			// 院系联动专业
			$("#departmentId").change(function(){
				var reqData={};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade").val();
				if(utils.isEmpty($(this).val()) && utils.isEmpty($("#grade").val())  && $("#grade").val()==''){
				    simpleSelect.loadCommon("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,null,"","全部","");
		    	  return false;
				}
				simpleSelect.loadCommon("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,reqData,"","全部","");
			});
			this.loadSchool(); // 加载学校信息
			this.loadDaySectionNum(); // 加载班级课表集合

			this.bindEvent();
		},
		/**
		 * 绑定事件
		 */
		bindEvent:function(){
			var me = this;
			me.queryStatus=0;// 查询按钮禁用多次点击
			
			$("#btnLoadMore").click(function(){
				var param={};
				param.academicYear = me.queryParam.academicYear;
				param.semesterCode = me.queryParam.semesterCode;
				param.classId = me.classList[me.classNo].classId;
				me.loadList(param);
			});
			$("#query").click(function(){
				if (me.queryStatus === 0) {
					me.queryStatus = 1;
					me.classNo = 0;
					me.loadDaySectionNum();
				}
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
		 * 加载班级课表集合
		 */
		loadList:function(param){
			var me = this;
			ajaxData.request(urlCoursePlan.ARRANGE_SCHEDULE_GETCLASSSCHEDULELIST, param, function(data) {
				if (data.code === config.RSP_SUCCESS && data.data && data.data.length>0) {
					var classSchedule = data.data[0];
					
					if (me.classNo) {
						me.classNo = me.classNo + 1;
						me.schedule.formatHtml(data.data[0],me.classNo);
					} else {
						$("#classCount").html(classSchedule.classCount);
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
								data:data.data[0],
								invok:me
							});
						me.classNo = 1;
						me.classCount = classSchedule.classCount;
						me.classList = classSchedule.classList;
					}
					
					if (me.classCount > me.classNo) {
						$("#btnLoadMore").show();
					} else {
						$("#btnLoadMore").hide();
					}
				}else{
					if(!me.classNo){
						$("#classCount").html("0");
						$("#divBody").empty().append($('<table class="table"><tbody class="no-data-html"><tr><td></td></tr></tbody></table>'));
					}
				}
				me.queryStatus=0;
			},true);
		},
		/**
		 * 获取保存查询条件
		 */
		getQueryParam:function(){
			var param={};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
			param.campusId = $("#campusId").val();
			param.grade = $("#grade").val();
			param.departmentId = $("#departmentId").val();
			param.majorId = $("#majorId").val();
			param.className = $("#className").val();
			param.isCoreCurriculum = $("#isCoreCurriculum").val();
			
			this.queryParam = param;
			return param;
		},
		printHtml:function(){
			var me = this;
			var param=me.queryParam;
			param.isPrint=1;
			// 若数据为空，不打印
			if($("#classCount").html()==="0"){
				$("#printBody").jqprint();
				$("#printBody").empty();
				return false;
			}

			ajaxData.request(urlCoursePlan.ARRANGE_SCHEDULE_GETCLASSSCHEDULELIST, param, function(data) {
				if (data.code === config.RSP_SUCCESS && data.data) {
					var data = data.data;
					//时间设置 -- 一天多少节次
					var timesettings = me.timeSetting;
					//获取一周中从哪天开始上课
					me.printSchedule = new scheduleUtil("printBody",{
						weekNum: me.weekNum,
						fromhtml:"class", // class,teacher,teachRoom,course
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

	module.exports = classlist; // 根文件夹名称一致
});