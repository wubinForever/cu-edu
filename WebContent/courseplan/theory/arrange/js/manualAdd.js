/**
 * 手动排课弹窗
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
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); // 复选单选
	var pagination = require("basePath/utils/pagination");

	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");

	// URL
	var url = require("basePath/config/url.udf");
	var urlData = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var urlDictionary = require("basePath/config/data.dictionary");

	// 枚举
	var weekType = require("basePath/enumeration/courseplan/WeekType");
	

	var scheduleUtil = require("../../../common/js/schedule");
	var openMessage = require("../../../common/js/openMessage");
	
	// 与当前文件名一致
	var manualAdd = {
		init : function() {
			var reqData = popup.getData("data");
			manualAdd.getItem(reqData);
			
			this.bindEvent();
		},
		/**
		 * 绑定事件
		 */
		bindEvent : function() {
			// 新增排课任务
			$("#addTask").click(function() {
				manualAdd.addArrangeTask();
			});
			// 修改排课任务
			$(document).on("change","[updatename='update']",function(){
				var obj = $(this).parent().parent().find("input[name='isSeleted']");
				var checkType = manualAdd.checkWeek(obj.parent());
				manualAdd.updateArrangeTask(this);
				if(!checkType){
					$(this).parent().parent().find("input[name='ArrangeWeeks']").val("");
					$(this).parent().parent().find("td[name='section']").attr("section","");
					var data=[];
					manualAdd.schedule.changeStatus(data);
					return false;
				}
				if(obj.prop("checked")){
					manualAdd.checkArrangeTask(obj.parent());
				}
			})
			// 删除排课任务
			$(document).on("click", "[name='delete']", function() {
				manualAdd.deleteArrangeTask(this);
			});
			// 选中排课任务 ，冒泡执行 ，此事件需绑定到DIV上，保证公共方法先执行（否则选中状态无法正常取消）
			$(document).on("click", ".radio-con", function() {
				manualAdd.checkArrangeTask(this);
			});
			// 点击检测班级时间冲突选择框
			$("#detectionClass").click(function() {
				manualAdd.changeDetection();
			});
			// 点击检测教师时间冲突选择框
			$("#detectionTeacher").click(function() {
				manualAdd.changeDetection();
			});
			// 选择教室
			$(document).on("click", "[name='chooseTeachRoom']", function(event) {
				manualAdd.chooseTeachRoom(this);
			});
			// 删除教室
			$(document).on("click", "[name='deleteTeachRoom']", function(event) {
				manualAdd.deleteTeachRoom(this);
			});
			openMessage.message(".open-message", "行政班");
			// 手动排课锁
			manualAdd.isLock = false;
		},
		
		/**
		 * 加载理论任务信息
		 */
		getItem : function(param) {
			ajaxData.request(urlCoursePlan.ARRANGE_MANUALARRANGE_GETITEM, param, function(data) {
				if (data.code === config.RSP_SUCCESS && data.data) {
					manualAdd.setParam(data.data);
				}
			});
		},
		
		/**
		 * 理论任务信息HTML
		 */
		setParam : function(data) {
			$("#courseName").html(data.courseName);
			$("#teachers").html(data.teachers).prop("title", data.teachers);
			$("#teachingMethodsName").html(data.teachingMethodsName);
			$("#totalPeriod").html(data.totalPeriod);
			$("#theoryPeriod").html(data.theoryPeriod);
			$("#experiPeriod").html(data.experiPeriod);
			$("#practicePeriod").html(data.practicePeriod);
			$("#otherPeriod").html(data.otherPeriod);
			$("#weeklyHours").html(data.weeklyHours);
			$("#continBlwdwnCount").html(data.continBlwdwnCount);
			$("#arrangeWeeks").html(data.arrangeWeeks).prop("title", data.arrangeWeeks);

			var sinDouWeek = "";
			switch (data.singleOrDoubleWeek) {
			case 1: {
				sinDouWeek = "单周";
				break;
			}
			case 2: {
				sinDouWeek = "双周";
				break;
			}
			}
			$("#singleOrDoubleWeek").html(sinDouWeek);
			$("#teachingClassNo").html(data.teachingClassNo);
			$("#teachingClassMemberCount").html(data.teachingClassMemberCount);
//			$("#teachingGroupName").html(data.teachingGroupName);
			
			var venue="";
			if (data.teachRoomTypeName) {
				venue += data.teachRoomTypeName + "-";
			}
			if (data.campusName) {
				venue += data.campusName + "-";
			}
			if (data.buildingName) {
				venue += data.buildingName + "-";
			}
			if (data.teachRoomName) {
				venue += data.teachRoomName + "-";
			}
			venue = venue.substr(0,venue.length-1);
			$("#site").html(venue).prop("title", venue);
			$("#solidForbiddenSection").html(data.solidForbiddenSection).prop("title", data.solidForbiddenSection);
			$("#classes").html(data.classes).addClass("open-message").attr("data", data.classes.split(",").join("#@#"));

			this.theoreticalItem = data;
			this.loadDaySectionNum();
		},		
		/**
		 * 加载日排课节次
		 */
		loadDaySectionNum:function(){
			var me = this;
			var reqData = {};
			reqData.academicYear = me.theoreticalItem.academicYear;
			reqData.semesterCode = me.theoreticalItem.semesterCode;
			ajaxData.request(urlCoursePlan.PARAMETER_TIME_GETITEM, reqData, function(data) {
				var dayCount;
				if (data.code === config.RSP_SUCCESS && data.data) {
					dayCount = Number(data.data.amSectionNumber) + Number(data.data.pmSectionNumber)
							+ Number(data.data.nightSectionNumber);
				}

				var section = [];
				for (var i = 1; i <= dayCount && i <= 6; i++) {
					section.push(i);
				}
				me.timeSetting = data.data;
				me.timeSetting.weekNum = me.getWeekNum();
				me.daySectionNumSection = section;
			});
		},
		/**
		 * 获取星期
		 */
		getWeekNum : function(){
			var me = this;
			var reqData = {};
			reqData.academicYear = me.theoreticalItem.academicYear;
			reqData.semesterCode = me.theoreticalItem.semesterCode;
			ajaxData.request(urlData.SCHOOLCALENDAR_GETCALENDAR, reqData, function(data){
				if (data.code == config.RSP_SUCCESS) {
					var weekStartDay = data.data.weekStartDay;
					var result = [];
					var weekSize = me.timeSetting.weekCourseDays;
					for(var i=1;i<weekSize+1;i++){
						if(weekStartDay == 0){
							if(i===1){
								result.push(7);
							}else{
								result.push(i-1);
							}
						}else{
							result.push(i);
						}
					}
					me.weekNum = result;
				}else{
					popup.errPop("查询失败："+data.msg);
				}

				me.loadArrangeTask();
			});
		},
		/**
		 * 加载排课任务
		 */
		loadArrangeTask:function(){
			var me = this;
			var param = {};
			param.theoreticalTaskId = me.theoreticalItem.theoreticalTaskId;
			ajaxData.request(urlCoursePlan.ARRANGE_MANUALARRANGE_GETSCHEDULINGTASKITEM, param, function(data) {
				if (data.code === config.RSP_SUCCESS && data.data && data.data.length > 0) {
					var itemList = [];
					$.each(data.data,function(i,obj){
						var item =obj;
						item.continBlwdwnCountList = me.daySectionNumSection;
						itemList.push(item);
					});
					me.formatTaskHtml(itemList);
				} else {
					me.addArrangeTask();
				}
				
				//时间设置 -- 一天多少节次
				var timesettings = me.timeSetting;
				//获取一周中从哪天开始上课
				me.schedule = new scheduleUtil("scheduleId",{
					weekNum: me.weekNum,
					section:{
						am: timesettings.amSectionNumber,
						pm: timesettings.pmSectionNumber,
						night: timesettings.nightSectionNumber
					},
					data:data.data,
					invok:manualAdd
				});
			});
		},
		
		/**
		 * 添加单条排课任务
		 */
		addArrangeTask : function() {
			var item = {};
			var me = this;
			item.courseArrangeWeekly = me.theoreticalItem.arrangeWeeks;
			item.singleOrDoubleWeek = me.theoreticalItem.singleOrDoubleWeek;
			item.continBlwdwnCountList = me.daySectionNumSection;
			item.continBlwdwnCount = me.theoreticalItem.continBlwdwnCount;

			me.formatTaskHtml(item);
		},
		
		/**
		 * 排课周次校验
		 */
		checkWeek : function(obj) {
			var me = this;
			var seleteTr = $(obj).parent().parent().parent();
			var reqParam = me.getTaskHtml(seleteTr);
			var me = this;
			if (me.timeSetting) {
				var val = reqParam.courseArrangeWeekly;
				if (!utils.isWeek(val)) {
					popup.warPop("排课周次格式有误！");
					return false;
				}
				var beforeWeekList = utils.getWeekList(val);
				var weekList = utils.getWeekList("1-" + me.timeSetting.schoolWeek);
				if (me.checkContains(weekList, beforeWeekList)) {
					return true;
				} else {
					popup.warPop("最大周次不能超过" + me.timeSetting.schoolWeek + "！");
					return false;
				}
			}
			return false;
		},

		 /**
		  * list2中的元素是否全在list1中
		  * @param list1
		  * @param list2
		  * @returns
		  */
		 checkContains:function(list1, list2){
			 for(var i in list2){
				 var flag = false;
				 for(var j in list1){
					 if(list1[j] == list2[i]){
						 flag = true;
					 }
				 }
				 if(!flag){
					 return false;
				 }
			 }
			 return true;
		 },
		 
		/**
		 * 保存排课任务
		 */
		saveArrangeTask:function(obj){
			var me = manualAdd;	// 回调函数中不能用this赋值
			
			if(me.isLock){
				return false;
			}
			me.isLock = true;
			var item = $("#tbodyContent").find("input[name='isSeleted']:checked").parent().parent().parent().parent();
			if (item.length > 0) {
				var reqParam = me.getTaskHtml(item);
				reqParam.courseArrangeSection = $(obj).attr("section");
				ajaxData.request(urlCoursePlan.ARRANGE_MANUALARRANGE_ADD, reqParam, function(data) {
					if (data.code === config.RSP_SUCCESS && data.data) {
						var checkedRadio = $("#tbodyContent").find("input[name='isSeleted']:checked").parent().parent()
								.parent().parent();
						checkedRadio.prop("id", data.data.schedulingTaskId);
						checkedRadio.find("td[name='section']").html(data.data.arrangeSection).attr("section",
								data.data.courseArrangeSection);
						checkedRadio.find("td[name='teachRoom']").html(data.data.teachRoom);
						me.refreshSchedule();
					} else {
						// 提示失败
						popup.errPop("保存失败");
						return false;
					}
					me.isLock=false;
				});
			}
		},
		/**
		 * 修改排课任务
		 */
		updateArrangeTask:function(obj){
			var me = this;
			var seleteTr = $(obj).parent().parent();
			var id = seleteTr.prop("id");
			if (id) {
				me.deleteRequest(id);
			}
		},
		
		/**
		 * 删除单条排课任务
		 */
		deleteArrangeTask : function(obj) {
			var me = this;
			popup.askDeletePop("排课任务",function(){
				var seleteTr = $(obj).parent().parent();
				var id = seleteTr.prop("id");
				if (id) {
					me.deleteRequest(id);
				}
				seleteTr.remove();
				me.resetSequence();
			});
		},
		
		/**
		 * 删除排课任务请求
		 */
		deleteRequest:function(id){
			var me = this;
			var ids = [];
			ids.push(id);
			
			var reqData = {};
			reqData.schedulingTaskIds = ids;
			ajaxData.request(urlCoursePlan.ARRANGE_MANUALARRANGE_DELETE, reqData, function(data) {
				if (data.code === config.RSP_SUCCESS) {
					var checkedRadio = $("#tbodyContent").find("#"+id);
					if(checkedRadio.length>0){
						checkedRadio.prop("id", "");
						checkedRadio.find("td[name='section']").html("").attr("section", "");
						checkedRadio.find("td[name='teachRoom']").html("");
					}
					me.refreshSchedule();
				}else{
					// 提示失败
					popup.errPop("删除失败");
					return false;
				}
			});
		},
		
		/**
		 * 绑定排课任务到列表
		 * @param item 排课任务
		 */
		formatTaskHtml : function(item) {
			$("#tbodyContent").append($("#arrangeTaskTmpl").tmpl(item)).setNoDataHtml();
			this.resetSequence();
		},

		/**
		 * 重置序号
		 */
		resetSequence : function() {
			var list = $("#tbodyContent tr");
			list.each(function(i, tr) {
				if (list.length === 1) { // 排课任务只剩一行 不能删除
					$(tr).find("button[name=delete]").attr("disabled", "disabled").addClass("disabled");
				} else {
					$(tr).find("button[name=delete]").removeAttr("disabled").removeClass("disabled");
				}
				$(tr).find("td:eq(1)").html(i + 1);
			})
		},
		/**
		 * 刷新课表内容
		 */
		refreshSchedule:function(){
			var me = this;
			var param = {};
			param.theoreticalTaskId = me.theoreticalItem.theoreticalTaskId;
			ajaxData.request(urlCoursePlan.ARRANGE_MANUALARRANGE_GETSCHEDULINGTASKITEM, param, function(data) {
				if (data.code === config.RSP_SUCCESS) {
					me.schedule.setData(data.data);

					var checkedRadio = $("#tbodyContent").find("input[name='isSeleted']:checked").parent();
					if(checkedRadio.length>0){
						me.checkArrangeTask(checkedRadio);
					}else{
						me.schedule.checkedRadio();
					}
				}
			});
		},
		/**
		 * 选中排课任务 
		 */
		checkArrangeTask:function(obj){
			var me = this;
			var seleteTr = $(obj).parent().parent().parent();
			var reqParam = me.getTaskHtml(seleteTr);
			
			if(utils.isEmpty(reqParam.courseArrangeWeekly)){
				$(obj).find("input[name='isSeleted']").removeProp("checked");
				$(obj).parent().removeClass("on-radio");
				popup.warPop("排课周次不能为空");
				return false;
			}
			ajaxData.request(urlCoursePlan.ARRANGE_MANUALARRANGE_GETSECTIONLIST, reqParam, function(data) {
				if (data.code === config.RSP_SUCCESS) {
					me.schedule.changeStatus(data.data);
				}
			});
		},
		/**
		 * 获取页面排课任务信息
		 */
		getTaskHtml:function(obj){
			var me = this;
			var reqParam = {};
			var seleteTr = $(obj);
			reqParam.theoreticalTaskId = me.theoreticalItem.theoreticalTaskId;
			reqParam.academicYear = me.theoreticalItem.academicYear;
			reqParam.semesterCode = me.theoreticalItem.semesterCode;
			reqParam.courseId = me.theoreticalItem.courseId;
			reqParam.schedulingTaskId = seleteTr.prop("id");
			reqParam.courseArrangeWeekly = seleteTr.find("input[name='ArrangeWeeks']").val();
			reqParam.singleOrDoubleWeek = seleteTr.find("#singleOrDoubleWeek").val();
			reqParam.continBlwdwnCount = seleteTr.find("#continBlwdwnCount").val();
			reqParam.detectionClass = $("#detectionClass").prop("checked") ? 1 : 0;
			reqParam.detectionTeacher = $("#detectionTeacher").prop("checked") ? 1 : 0;
			reqParam.isArrangeRoom = $("#isArrangeRoom").prop("checked") ? 1 : 0;
			
			return reqParam;
		},
		/**
		 * 变更检测冲突条件
		 */
		changeDetection : function() {
			var checkRadio = $("#tbodyContent").find("input[name='isSeleted']:checked").parent();
			if (checkRadio.length > 0) {
				manualAdd.checkArrangeTask(checkRadio);
			}
		},
		/**
		 * 选择教室
		 */
		chooseTeachRoom:function(obj){
			var me = this;
			var selectDiv = $(obj).parent().parent();
			var param = {};
			param.academicYear = me.theoreticalItem.academicYear;
			param.semesterCode = me.theoreticalItem.semesterCode;
			param.minSeatNum = me.theoreticalItem.teachingClassMemberCount;
			param.campusId = me.theoreticalItem.campusId;
			param.buildingId = me.theoreticalItem.buildingId;
			param.venueTypeCode = me.theoreticalItem.teachRoomTypeCode;
			param.courseArrangeWeekly = selectDiv.find("p[name='weekSection']").attr("week");
			param.courseArrangeSection = selectDiv.find("p[name='weekSection']").attr("section");
			param.singleOrDoubleWeek = selectDiv.find("p[name='weekSection']").attr("singleOrDoubleWeek");
			popup.setData("chooseVenue",param);
			popup.open('./courseplan/theory/arrange/html/classroomlist.html', // 这里是页面的路径地址
			{
				id : 'classroomlist',// 唯一标识
				title : '教室选择',// 这是标题
				width : 1000,// 这是弹窗宽度。其实可以不写
				height : 450,// 弹窗高度*/
				okVal : '确定',
				fixed : true,
				ok : function() {
					var checkedVenue = popup.getData("checkedVenue");
					if (checkedVenue !== -1 && $(checkedVenue).length > 0) {
						var checkedInput = $(checkedVenue);
						var updateParam = {};
						updateParam.schedulingTaskId = selectDiv.attr("schedulingTaskId");
						updateParam.campusId = checkedInput.find("input").attr("campusId");
						updateParam.buildingId = checkedInput.find("input").attr("buildingId");
						updateParam.venueId = checkedInput.find("input").attr("venueId");
						updateParam.venueTypeCode = checkedInput.find("input").attr("venueTypeCode");
						updateParam.teachRoom = checkedInput.find("td[name='buildingName']").html()
								+ checkedInput.find("td[name='venueName']").html();

						me.updateTask(updateParam);
					} else {
						popup.warPop("请选择教室");
						return false;
					}
				},
			});
		},
		/**
		 * 删除教室
		 */
		deleteTeachRoom:function(obj){
			var me = this;
			var selectDiv = $(obj).parent().parent();
			var updateParam={};
			updateParam.schedulingTaskId = selectDiv.attr("schedulingTaskId");
			
			me.updateTask(updateParam);
		},
		/**
		 * 修改排课任务请求
		 */
		updateTask:function(reqData){
			var me = this;
			var td = $("#"+reqData.schedulingTaskId+" > td[name=teachRoom]");
			ajaxData.request(urlCoursePlan.ARRANGE_MANUALARRANGE_UPDATE, reqData, function(data) {
				if (data.code === config.RSP_SUCCESS) {
					td.html(reqData.teachRoom ? reqData.teachRoom : "").prop("title",
							reqData.teachRoom ? reqData.teachRoom : "");
					me.refreshSchedule();
				}else{
					// 提示失败
					popup.errPop("删除失败");
					return false;
				}
			});
		}
	}

	module.exports = manualAdd; // 与当前文件名一致
});