/**
 * 教室课表
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
	var treeSelect = require("basePath/module/select.tree");//公用下拉树

	// URL
	var url = require("basePath/config/url.udf");
	var urlData = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var urlDictionary = require("basePath/config/data.dictionary");
	var constant = require("basePath/config/data.constant");

	var scheduleUtil = require("./schedule"); // 课表初始化
	var setting = {
			view : {
				showLine : false,
				nameIsHTML : true
			},
			data : {
				simpleData : {
					enable : true,
					idKey : "id",
					pIdKey : "pId",
					rootPId : "0"
				},
				key : {
					title : "name"
				}
			},
			callback : {
				onDblClick : function(event, treeId, treeNode) {
				},
				onClick : function(event, treeId, treeNode) {
					$("#treeCode").hide();
					$("#departmentName").val(treeNode.name);
					$("#departmentId").val(treeNode.id);
					$("#departmentId").next().remove();

				}
			}
		};
	// 变量名跟文件夹名称一致
	var teachroomlist = {
		// 初始化
		init : function() {
			// 默认加载当前排课学年学期
			var semester = simpleSelect.loadCommonSmester("academicSemester", urlData.COMMON_GETSEMESTERLIST,"");
//			var semester = simpleSelect.loadCourseSmester("academicSemester", true);
			this.semester = semester;

			// 绑定校区下拉框
			simpleSelect.loadCampus("campusId", false, "", constant.SELECT_ALL, "");
			// 绑定楼房下拉框
			simpleSelect.loadAllBuilding("buildingId", "",{firstText:constant.SELECT_ALL, firstValue:""});
			// 绑定教室类型下拉框
			simpleSelect.loadDictionarySelect("venueTypeCode", urlDictionary.ID_FOR_VENUE_TYPE_CODE, {firstText:constant.SELECT_ALL, firstValue:""});
			// 绑定所属单位下拉框
			var opt = {
					idTree : "treeCode", // 树Id
					id : "departmentId", // 下拉数据隐藏Id
					name : "departmentName", // 下拉数据显示name值
					code : "", // 下拉数据隐藏code值（数据字典）
					url : urlData.DEPARTMENT_ZTREE, // 下拉数据获取路径
					defaultValue : "" // 默认值（修改时显示值）
				};
			treeSelect.loadTree(opt);

			this.loadSchool(); // 加载学校信息
			this.loadDaySectionNum(); // 加载教室课表集合

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
				param.venueId = me.teachRoomList[me.teachRoomNo].venueId;
				me.loadList(param);
			});
			$("#query").click(function(){
				me.teachRoomNo=0;
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
		 * 查询所有单位信息
		 */
		getDepartmentList : function() {
			ajaxData.contructor(false);
			ajaxData.request(urlData.DEPARTMENT_GETALLLIST, null, function(
					data) {
				$("#departmentSelectTmpl").tmpl(data.data).appendTo(
						'#departmentId');
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
		 * 加载教室课表集合
		 */
		loadList:function(param){
			var me = this;
			ajaxData.request(urlCoursePlan.ARRANGE_SCHEDULE_GETTEACHROOMSCHEDULELIST, param, function(data) {
				if (data.code === config.RSP_SUCCESS && data.data && data.data.length > 0) {
					var teachRoomSchedule = data.data[0];
					
					if (me.teachRoomNo) {
						me.teachRoomNo = me.teachRoomNo + 1;
						me.schedule.formatHtml(data.data[0],me.teachRoomNo);
					} else {
						$("#teachRoomCount").html(teachRoomSchedule.teachRoomCount);
						//时间设置 -- 一天多少节次
						var timesettings = me.timeSetting;
						//获取一周中从哪天开始上课
						me.schedule = new scheduleUtil("divBody",{
							weekNum: me.weekNum,
							fromhtml:"teachRoom", // class,teacher,teachRoom,course
							section:{
								am: timesettings.amSectionNumber,
								pm: timesettings.pmSectionNumber,
								night: timesettings.nightSectionNumber
							},
							data:data.data[0],
							invok:me
						});
						me.teachRoomNo = 1;
						me.teachRoomCount = teachRoomSchedule.teachRoomCount;
						me.teachRoomList = teachRoomSchedule.teachRoomList;
					}
					
					if (me.teachRoomCount > me.teachRoomNo) {
						$("#btnLoadMore").show();
					} else {
						$("#btnLoadMore").hide();
					}
				} else {
					if(!me.teachRoomNo){
						$("#teachRoomCount").html("0");
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
			param.campusId = $("#campusId").val();
			param.buildingId = $("#buildingId").val();
			param.venueTypeCode = $("#venueTypeCode").val();
			param.departmentId = $("#departmentId").val();
			param.venueName = $("#venueName").val();
			
			this.queryParam = param;
			return param;
		},
		printHtml:function(){
			var me = this;
			var param = me.queryParam;
			param.isPrint = 1;
			
			// 若数据为空，不打印
			if($("#teachRoomCount").html()==="0"){
				$("#printBody").jqprint();
				$("#printBody").empty();
				return false;
			}

			ajaxData.request(urlCoursePlan.ARRANGE_SCHEDULE_GETTEACHROOMSCHEDULELIST, param, function(data) {
				if (data.code === config.RSP_SUCCESS && data.data) {
					var data = data.data;
					//时间设置 -- 一天多少节次
					var timesettings = me.timeSetting;
					//获取一周中从哪天开始上课
					me.printSchedule = new scheduleUtil("printBody",{
						weekNum: me.weekNum,
						fromhtml:"teachRoom", // class,teacher,teachRoom,course
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

	module.exports = teachroomlist; // 根文件夹名称一致
});