/**
 * 按时间区段查看
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var common = require("basePath/utils/common");
	var config = require("basePath/utils/config");
	//下拉框
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_UDF = require("basePath/config/url.udf");
	var URL_DATA = require("basePath/config/url.data");
	var DICTIONARY = require("basePath/config/data.dictionary");
	var simpleSelect = require("basePath/module/select.simple");
	var select = require("basePath/module/select");
	//工具
	var popup = require("basePath/utils/popup");
	var mapUtil = require("basePath/utils/mapUtil");
	var teacher = require("../../common/js/teacher");
	var openMessage = require("../../common/js/openMessage");
	/**
	 * 调停课新增
	 */
	 var lessonAdd = {
		 data:new mapUtil(),
			 
		 init:function(){
			 
			 popup.setData("lessonAdd", lessonAdd);
			 var me = this;
			 simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");
			 me.setDisabled();
			 if(utils.getUrlParam("tag")){
				 $("#teacherDiv").remove();
				 var user = window.top.USER;
				 if(user){
					 $("#teacherId").val(user.userId);
					 $("#semester").change(function(){
						 me.loadTimesettings();
						 me.formatHtml([]);
						 me.setDisabled();
						 me.getTeachWeek();
						 me.resetClash();
					 }).change();
				 }
			 }else{
				 me.initTeacher();
				 $("#semester").change(function(){
					 me.getTeacher();
					 me.loadTimesettings();
					 me.formatHtml([]);
					 me.setDisabled();
					 me.getTeachWeek();
					 me.resetClash();
				 }).change();
			 }
			 
			 
			 $("button[name=queryBtn]").click(function(){
				 me.resetClash();
				 if(!utils.getUrlParam("tag")){
					 if(me.teacherSelect.getValue()){
						 me.list();
					 }else{
						 popup.warPop("请选择教师！");
					 }
				 }else{
					 me.list();
				 }
				
			 });
			 me.list();
			 $("#afterWeek").blur(function(){
				 me.checkAfterWeek();
			 }).focus(function(){
				 return me.checkBeforeWeek();
			 });
			 $("#beforeWeek").blur(function(){
				 me.checkBeforeWeek();
			 });
			 $("#stopWeek").blur(function(){
				 me.checkStopWeek();
			 });
			//调停课新增切换
			$('.rangebtn').on('click',function(){
				$('.ctrl-cm').show();
				$('.tab-cm').show();
				$('.reason-range').show();
				$('.reason-cm').hide();
				$('.reason-stop').hide();
			});
			$('.stopbtn').on('click',function(){
				$('.ctrl-cm').hide();
				$('.tab-cm').hide();
				$('.reason-range').hide();
				$('.reason-cm').show();
				$('.reason-stop').show();
			});
			//选择某条记录进行调停课
			 $(document).on("click", "tr[scheduling]", function(){
				 var schedulingId = $(this).attr("scheduling");
				 if(schedulingId != me.schedulingId){
					 me.choiceTask($(this).attr("scheduling"));
					 me.removeDisabled();
					 me.resetClash();
				 }
			 });
			 //选择节次
			 $(".chooseclassnum").click(function(){
				 me.chooseSection();
			 });
			 //选择节次
			 $(".chooseroom").click(function(){
				 me.chooseRoom();
			 });
			 //选择节次
			 $(".chooseteacher").click(function(){
				 me.chooseTeacher();
			 });
			new limit($("#stopRemark"),$("#stopRemarkCount"),100);
			new limit($("#rangeRemark"),$("#rangeRemarkCount"),100);
		 },
		 
		 /**
		  * 重置冲突判断的选中状态
		  */
		 resetClash:function(){
			 $("#classAdjust,#teacherAdjust,#roomAdjust").prop("checked", true).parent().addClass("on-check");
		 },
		 /**
		  * 检测调前周次是否合理
		  */
		 checkBeforeWeek:function(){
			 var obj = $("#beforeWeek");
			 var me = this;
			 if(me.task){
				 var val = obj.val();
				 if(!utils.isWeek(val)){
					 popup.warPop("调整周次格式有误！");
					 return false;
				 } 
				 var beforeWeekList = utils.getWeekList(val);
				 var weekList = utils.getWeekList(me.task.courseArrangeWeekly);
				 if(!me.checkContains(weekList, beforeWeekList)){
					 popup.warPop("请选择"+me.task.courseArrangeWeekly+"周中的周次");
					 return false;
				 }else{
					 me.task.beforeWeek = val;
					 return true;
				 }
			 }
			 return false;
		 }, 
		 /**
		  * 检测停课周次是否合理
		  */
		 checkStopWeek:function(){
			 var obj = $("#stopWeek");
			 var me = this;
			 if(me.task){
				 var val = obj.val();
				 if(!utils.isWeek(val)){
					 popup.warPop("停课周次格式有误！");
					 return false;
				 } 
				 var stopWeekList = utils.getWeekList(val);
				 var weekList = utils.getWeekList(me.task.courseArrangeWeekly);
				 if(!me.checkContains(weekList, stopWeekList)){
					 popup.warPop("请选择"+me.task.courseArrangeWeekly+"周中的周次");
					 return false;
				 }else{
					 me.task.stopWeek = val;
					 return true;
				 }
			 }
			 return false;
		 },
		 /**
		  * 检测调后周次是否合理
		  */
		 checkAfterWeek:function(){
			 var obj = $("#afterWeek");
			 var me = this;
			 if(me.task){
				 var val = obj.val();
				 if(!utils.isWeek(val)){
					 popup.warPop("调至周次格式有误！");
					 return false;
				 } 
				 var beforeWeekList = utils.getWeekList(me.task.beforeWeek);
				 var afterWeekList = utils.getWeekList(val);
				 //判断单双周情况
				 if(me.task.singleOrDoubleWeek != 0){
					 beforeWeekList =  me.getWeek(beforeWeekList, me.task.singleOrDoubleWeek == 1 ? false : true);
				 }
				 if(afterWeekList.length != beforeWeekList.length){
					 popup.warPop("原周次中的调前周次数与调至周次数量必须相同！");
					 return false;
				 }else if(!this.checkWeek(afterWeekList) || !this.checkWeek(beforeWeekList)){
					 //调至周次不能大于校历最大周次
				 }else{
					 me.task.afterWeek = val;
					 return true;
				 }
			 }
			 return false;
		 },
		 /**
		  * 过滤单双周，flag:true 取双周数， flag:false 取单周数
		  */
		 getWeek:function(list, flag){
			 var resultList = [];
			 for(var i = 0 , length = list.length ; i < length ; i ++){
				 var week = parseInt(list[i]);
				 if(week % 2 == 1 && !flag){
					 //单
					 resultList.push(week);
				 }
				 if(week % 2 == 0 && flag){
					 //双
					 resultList.push(week);
				 }
			 }
			 return resultList;
		 },
		 /**
		  * 获取学年学期对应的教学周数
		  */
		 getTeachWeek:function(){
			 var me = this;
			 var param = this.getSemester();
			 if(!param){
				this.teachWeek = 0;
				return ;
			 }else{
				 ajaxData.request(URL_DATA.SCHOOLCALENDAR_GETTEACHWEEK, param, function(data){
					 if(data && data.code == config.RSP_SUCCESS){
						 me.teachWeek = data.data;
					 }else{
						 popup.errPop(data.msg);
					 }
				 }); 
			 }
		 },
		 /**
		  * 校验校历教学周数
		  */
		 checkWeek:function(week){
			var teachWeek = this.teachWeek;
			if(teachWeek){
				for(var i = 0 , length = week.length ; i < length ; i ++){
					var w = parseInt(week[i]);
					if(teachWeek < w){
						popup.warPop("请选择1-"+teachWeek+"周内的周次");
						return false;
					}
				}
			}
			return true;
			  
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
		  * 查询排课任务
		  */
		 list : function(){
			 var me = this;
			 var param = this.getSemester();
			 if(!param){
				return ;
			 }
			 if(utils.getUrlParam("tag")){
				 param.teacherId =$("#teacherId").val();
			 }else{
				 param.teacherId = me.teacherSelect.getValue();
			 }
			 if(param.teacherId){
				 ajaxData.request(URL_COURSEPLAN.ARRANGE_MANUALARRANGE_GETLIST, param, function(data){
					 if(data && data.code == config.RSP_SUCCESS){
						me.formatHtml(data.data);
					 }else{
						 popup.errPop(data.msg);
					 }
				 });
			 }else{
				 me.formatHtml([]);
			 }
			 me.setLesson();
		 },
		 /**
		  * 设置排课任务到私有集合中
		  */
		 setData:function(list){
			 var me = this;
			 me.data.clear();
			if(list && list.length > 0){
				$.each(list, function(i, item){
					me.data.put(item.schedulingTaskId, item);
				});
			} 
		 },
		 /**
		  * 设置html
		  */
		 formatHtml : function(list){
			 this.setData(list);
			 delete this.task;
			 $("#tbodycontent").html($("#tableTmpl").tmpl(list)).setNoDataHtml();
			 openMessage.message(".open-message", "行政班");
			 //添加title
			common.titleInit();
		 },
		 /**
		  * 获取学年学期对应的已排课的老师
		  */
		 getTeacher : function(){
			 var me = this;
			 var param = this.getSemester();
			 delete this.task;
			 me.setLesson();
			 ajaxData.request(URL_COURSEPLAN.ARRANGE_MANUALARRANGE_GETTEACHERLIST, param, function(data){
				 if(data && data.code == config.RSP_SUCCESS){
					 var list = [];
					 $.each(data.data, function(i, item){
						 list.push({name:"[" + item.teacherNo + "]" +item.teacherName, value:item.teacherId});
					 });
					 me.teacherSelect.reload(list);
				 }else{
					 popup.errPop(data.msg);
				 }
			 });
		 },
		 /**
		  * 获取当前页面的学年学期下拉框中的内容
		  */
		 getSemester : function(){
			 var param = {},
			 	semester = $("#semester").val();
			 if(semester && semester.split("_").length == 2){
				 param.academicYear = semester.split("_")[0];
				 param.semesterCode = semester.split("_")[1];
				 return param;
			 }else{
				 return null;
			 }
		 },
		 /**
		  * 初始化老师框
		  */
		 initTeacher: function(){
			this.teacherSelect = new select({
				 dom:$("#teacher")
			 }).init();
		 },
		 /**
		  * 点击选中的排课任务
		  */
		 choiceTask:function(taskId){
			 if(taskId){
				 var item = this.data.get(taskId);
				 item.beforeWeek = item.stopWeek = item.afterWeek = item.courseArrangeWeekly;
				 item.afterSection = item.arrangeSection;
				 item.stopSection = item.arrangeSection;
				 item.afterCourseSection = item.courseArrangeSection;
				 
				 item.afterTeachers = item.teachers;
				 item.afterTeacherIds = item.teacherIds;
				 
				 item.afterVenueId = item.venueId;
				 item.afterVenueName = item.venueName;
				 item.afterVenueTypeCode = item.venueTypeCode;
				 item.afterBuildingId = item.buildingId;
				 item.afterBuildingName = item.buildingName;
				 item.afterCampusId = item.campusId;
				 item.afterCampusName = item.campusName;
				 this.task = item;
				 this.setLesson();
			 }
		 },
		 /**
		  * 设置界面调停课数据
		  */
		 setLesson:function(){
			 var item = this.task;
			 if(item){
				 if(item.singleOrDoubleWeekString){
					 $("#beforeWeekHtml").html(item.courseArrangeWeekly + item.singleOrDoubleWeekString);
				 }else{
					 $("#beforeWeekHtml").html(item.courseArrangeWeekly);
				 }
				 $("#beforeWeek").val(item.beforeWeek);
				 $("#afterWeek").val(item.afterWeek);
				 $("#stopWeek").val(item.stopWeek);
				 $("#beforeSectionHtml").html(item.arrangeSection);
				 $("#stopSection").val(item.arrangeSection);
				 $("#stopSection").html(item.stopSection);
				 $("#afterSection").val(item.afterSection);
				 var room = afterRoom = "";
				 if(item.buildingName)  room += item.buildingName;
				 if(item.venueName)  room += item.venueName;
				 $("#beforeRoomHtml").html(room);
				 if(item.afterBuildingName)  afterRoom += item.afterBuildingName;
				 if(item.afterVenueName)  afterRoom += item.afterVenueName;
				 $("#afterRoom").val(afterRoom);
				 
				 $("#beforeTeacherHtml").html(item.teachers).attr("title", item.teachers);
				 $("#afterTeacher").val(item.afterTeachers);
				 this.schedulingId = item.schedulingTaskId;
			 }else{
				 delete this.schedulingId;
				 $("#beforeWeek,#afterWeek,#stopWeek,#stopSection,#afterSection,#afterRoom,#beforeTeacherHtml,#afterTeacher,#rangeRemark,#stopRemark").val("");
				 $("#beforeWeekHtml,#beforeSectionHtml, #beforeRoomHtml,#beforeTeacherHtml").html("");
			 }
		 },
		 loadTimesettings:function(){
			var param = this.getSemester();
			var me = this;
			if(param){
				var reqData = {};
				reqData.academicYear = param.academicYear;
				reqData.semesterCode = param.semesterCode;
				ajaxData.request(URL_COURSEPLAN.PARAMETER_TIME_GETITEM, reqData, function(data){
					if (data.code == config.RSP_SUCCESS) {
						me.timesettings = data.data;
						if(data.data){
							me.getCalendar(reqData);
						}
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				}); 
			}else{
				return null;
			}
		 },
		 /**
		  * 选择节次
		  * 1. 是否设置排课时间
		  * 2. 是否选择需要调整的排课任务
		  */
		 chooseSection : function(){
			 var me = this;
			 if(!(me.checkBeforeWeek() &&  me.checkAfterWeek())){
				 return false;
			 }
			 var timesettings = this.timesettings;
			 var task = this.task;
			 var weekNum = this.weekNum;
			 var param = this.getSemester();
			 if(task && timesettings){
				 popup.setData("timesettings", timesettings);
				 popup.setData("task", task);
				 popup.setData("weekNum", weekNum);
				 popup.setData("adjustOption", this.getAdjustOption());
				 popup.open('./courseplan/lesson/html/addsection.html', // 这里是页面的路径地址
					{
						id : 'chooseSection',// 唯一标识
						title : '节次选择',// 这是标题
						width : 800,// 这是弹窗宽度。其实可以不写
						height : 450,// 弹窗高度*/
						okVal : '确定',
						fixed: true,
					 	cancelVal : '取消',
						fixed: true,
						ok : function() {
							var addsection = popup.getData("addsection");
							var flag = addsection.validate();
							if(flag){
								var sections = addsection.getData();
								task.afterSection = utils.getSectionName(sections);
								task.afterCourseSection = sections.join(",");
								$("#afterSection").val(task.afterSection);
							} 
							return flag;
						},
						cancel:function(){return true;}
					});
			 }
		 },
		 /**
		  * 选择教室
		  */
		 chooseRoom:function(){
			 var me = this;
			 if(!(me.checkBeforeWeek() &&  me.checkAfterWeek())){
				 return false;
			 }
			 var task = this.task;
			 if(task){
				 popup.setData("task", task);
				 popup.setData("adjustOption", this.getAdjustOption());
				 popup.open('./courseplan/lesson/html/addaddress.html', // 这里是页面的路径地址
					{
						id : 'addaddress',// 唯一标识
						title : '教室选择',// 这是标题
						width : 1200,// 这是弹窗宽度。其实可以不写
						height : 650,// 弹窗高度*/
						okVal : '确定',
						//fixed: true,
					 	cancelVal : '取消',
						//fixed: true,
						ok : function() {
							var addaddress = popup.getData("addaddress");
						 
							 var item = addaddress.getData();
							 if(item){
								 task.afterBuildingId = item.buildingId;
								 task.afterBuildingName = item.buildingName;
								 task.afterCampusId = item.campusId;
								 task.afterCampusName = item.campusName;
								 task.afterVenueId = item.venueId;
								 task.afterVenueName = item.venueName;
								 task.afterVenueTypeCode = item.venueTypeCode;
							 }else{
								 popup.warPop("未选择调整的教室！");
								 task.afterBuildingId = "";
								 task.afterBuildingName = "";
								 task.afterCampusId = "";
								 task.afterCampusName = "";
								 task.afterVenueId = "";
								 task.afterVenueName = "";
								 task.afterVenueTypeCode = "";
							 }
							 var room = "";
							 if(task.afterBuildingName){
								 room += task.afterBuildingName;
							 }
							 if(task.afterVenueName){
								 room += task.afterVenueName;
							 }
							 $("#afterRoom").val(room);
							 
							return true;
						},
						cancel:function(){return true;}
					});
			 }
		 },
		 /**
		  * 选择教室
		  */
		 chooseTeacher:function(){
			 var me = this;
			 if(!(me.checkBeforeWeek() &&  me.checkAfterWeek())){
				 return false;
			 }
			 var task = this.task;
			 if(task){
				 me.loadTeacher(task.afterTeacherIds, function(teacherData){
					 //获取排课冲突的老师
					 me.loadConflict(function(teacherIdData){
						 teacher.chooseTeacher(teacherData, function(data){
								var teachers = [];
								var teacherIds = [];
								if(data && data.length == 0){
									popup.warPop("任课老师不能为空");
									return false;
								}
								$.each(data, function(i, item){
									if(i < 10){
										teachers.push('['+item.teacherNo+']'+item.teacherName);
										teacherIds.push(item.id);
									}
								});
								if(data &&  data.length > 10){
									popup.warPop("任课老师不能超过10个");
								}
								task.afterTeacherIds = teacherIds.join(",");
								task.afterTeachers = teachers.join(",");
								 $("#afterTeacher").val(task.afterTeachers);
							},{notInIdList:teacherIdData});
					 });
				 });
			 }
		 },
		/**
		 * 获取老师数据
		 */
		 loadTeacher:function(teacherIds, callback){
			if(utils.isNotEmpty(teacherIds)){
				var  teachers = teacherIds.split(",");
				var ids = [];
				$.each(teachers, function(i, item){
					ids.push(item);
				});
				 var param = {};
				param.teacherIds = ids;
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.COMMON_TEACHERINFO_GETLIST,JSON.stringify(param),function(data){
					if(data.code == config.RSP_SUCCESS){
						callback(data.data);
					}else{
						popup.errPop( + data.msg);
					}
				});
			 }else{
				 callback([]);
			 }
		 },
		 
		 /**
		  * 获取冲突检测项
		  */
		 getAdjustOption:function(){
			 var adjustOption = "";
			 $("#classAdjust").is(":checked") ? adjustOption += "1" : adjustOption += "0";
			 $("#teacherAdjust").is(":checked") ? adjustOption += "1" : adjustOption += "0";
			 $("#roomAdjust").is(":checked") ? adjustOption += "1" : adjustOption += "0";
			return adjustOption;
		 },
		 getCalendar:function(reqData){
			 var me = this;
			ajaxData.request(URL_DATA.SCHOOLCALENDAR_GETCALENDAR, reqData, function(data){
				if (data.code == config.RSP_SUCCESS) {
					var weekSize = me.timesettings.weekCourseDays;
					var weekStartDay = data.data.weekStartDay;
					var result = [];
					if(weekStartDay == 0){
						result.push(7);
						for(var i = 1; i < weekSize; i ++){
							result.push(i);
						}
					}else{
						for(var i = 1; i <= weekSize; i ++){
							result.push(i);
						}
					}
					me.weekNum = result;
					me.calendar = data.data;
				} 
			});
		 },
		 /**
		 * 获取冲突节次数据
		 */
		loadConflict : function(callback){
			var me = this;
			var task = this.task;
			var param = {};
			param.isTeacher = 1;
			param.academicYear = task.academicYear;
			param.semesterCode = task.semesterCode;
			param.scheduleTaskId = task.schedulingTaskId;
			param.week = task.afterWeek;
			param.beforeWeek = task.beforeWeek;
			param.section = task.afterCourseSection;
			if( $("#teacherAdjust").is(":checked")){
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.LESSON_CHECK_CONFLICT, JSON.stringify(param), function(data){
					 if(data && data.code == config.RSP_SUCCESS){
						callback(data.data);
					 }else{
						 popup.errPop( data.msg);
					 }
				 });
			}else{
				callback();
			}
		},
		/**
		 * 验证
		 */
		validate:function(){
			//验证是否有选择需要调整的排课任务
			var me = this;
			if(me.task){
				var item = this.task;
				var weekStartDay = $('input:radio[name=weekStartDay]:checked').val();
				item.adjustShutType = weekStartDay;
				//验证是否有调整
				if(weekStartDay == '0'){
					item.adjustShutType = 0;
					//停课
					if(!me.checkStopWeek()){
						return false;
					} 
					if($.trim($("#stopRemark").val()).length == 0){
						popup.warPop("停课原因不能为空");
						return false;
					}else{
						item.adjustShutReason = $.trim($("#stopRemark").val());
					}
				}else{
					item.adjustShutType = 1;
					//调课
					//验证周次
					item.adjustShutOption = "0000";
					var adjustShut = [];
					var flag = false;//是否有调整项
					if(!(me.checkBeforeWeek() &&  me.checkAfterWeek())){
						 return false;
					}
					
					if(item.beforeWeek && item.afterWeek){
						var weekList = utils.getWeekList(item.courseArrangeWeekly);
						var beforeWeekList = utils.getWeekList(item.beforeWeek);
						var afterWeekList = utils.getWeekList(item.afterWeek);
						 if(me.task.singleOrDoubleWeek != 0){
							 beforeWeekList =  me.getWeek(beforeWeekList, item.singleOrDoubleWeek == 1 ? false : true);
							 weekList =  me.getWeek(weekList, item.singleOrDoubleWeek == 1 ? false : true);
						 }
						if(!(me.checkContains(weekList, beforeWeekList) && me.checkContains(beforeWeekList, weekList))
							|| !(me.checkContains(beforeWeekList, afterWeekList) && me.checkContains(afterWeekList, beforeWeekList))){
							flag = true;
							adjustShut.push("1");
						}else{
							adjustShut.push("0");
						}
					} else{
						if(utils.isEmpty(item.beforeWeek)){
							popup.warPop("调整周次格式有误！");
						
						}else if(utils.isEmpty(item.afterWeek)){
							popup.warPop("调至周次格式有误！");
						}
						return false;
					}
					//验证节次
					var afterCourseSection = item.afterCourseSection.split(",");
					var courseArrangeSection = item.courseArrangeSection.split(",");
					if(!(me.checkContains(courseArrangeSection ,afterCourseSection ) && me.checkContains(afterCourseSection,courseArrangeSection ))){
						flag = true;
						adjustShut.push("1");
					} else{
						adjustShut.push("0");
					}
					//验证教室
					if(item.afterVenueId != item.venueId){
						flag = true;
						adjustShut.push("1");
					}else{
						adjustShut.push("0");
					}
					//验证教师
					if(item.teacherIds != item.afterTeacherIds){
						var afterTeacherIds = [];
						var teacherIds = [];
						if(item.teacherIds){
							teacherIds = item.teacherIds.split(",")
						}
						if(item.afterTeacherIds){
							afterTeacherIds = item.afterTeacherIds.split(",")
						}
						if(!(me.checkContains(afterTeacherIds ,teacherIds ) && me.checkContains(teacherIds,afterTeacherIds ))){
							flag = true;
							adjustShut.push("1");
						}else{
							adjustShut.push("0");
						}
					}else{
						adjustShut.push("0");
					}
					if(!flag){
						popup.warPop("您没有进行调整，请调整后再保存！");
						 return false;
					}else{
						item.adjustShutOption = adjustShut.join("");
					}
					//判断冲突
					me.loadSectionConflict(function(data){
						if(data && data.length > 0){
							if(me.checkContains(data , afterCourseSection )){
								flag = false;
							}
						}
					});
					if(!flag){
						popup.warPop("您选择的节次有冲突！");
						 return false;
					}
					
					if($.trim($("#rangeRemark").val()).length == 0){
						popup.warPop("调课原因不能为空");
						 return false;
					}else{
						item.adjustShutReason = $.trim($("#rangeRemark").val());
					}
				} 
				
			}else{
				popup.warPop("请先选择排课任务！");
				return false;
			}
			return true;
		},
		/**
		 * 保存
		 */
		save:function(){
			var item = this.task;
			var param = {};
			param.acadmemicYear = item.academicYear;
			param.scheduleingTaskId = item.schedulingTaskId; 
			param.semesterCode = item.semesterCode;
			param.adjustShutType = item.adjustShutType;
			param.adjustShutReason = item.adjustShutReason;
			if(param.adjustShutType == 0){
				param.adjustToWeek = item.stopWeek;
				param.adjustToSection = item.courseArrangeSection;
			}else{
				var adjustOption = this.getAdjustOption().split("");
				param.adjustBeforeWeek = item.courseArrangeWeekly;
				param.adjustWeek = item.beforeWeek;
				param.adjustToWeek = item.afterWeek;
				
				param.adjustBeforeSection = item.courseArrangeSection;
				param.adjustToSection = item.afterCourseSection;
				
				param.adjustBeforeTeacherIds = item.teacherIds;
				param.adjustToTeacherIds = item.afterTeacherIds;
				
				param.adjustBeforeClassroom = item.venueId;
				param.adjustToClassroom = item.afterVenueId;
				
				param.classClashStatus = adjustOption[0];
				param.teacherClashStatus = adjustOption[1];
				param.teachroomClashStatus = adjustOption[2];
				
				param.adjustShutOption = parseInt(item.adjustShutOption, 2);
			}
			 if(utils.getUrlParam("tag")){
				 param.isAdmin = 0;//后台管理 为1 ，教师服务为0
			 }else{
				 param.isAdmin = 1;//后台管理 为1 ，教师服务为0
			 }
			var flag = false;
			ajaxData.contructor(false);
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_COURSEPLAN.LESSON_SAVE, JSON.stringify(param), function(data){
				 if(data && data.code == config.RSP_SUCCESS){
					 flag = true;
				 }else{
					 popup.errPop(data.msg);
				 }
			 });
			return flag;
		},
		/**
		 * 获取冲突节次数据
		 */
		loadSectionConflict : function(callback){
			var me = this;
			var task = this.task;
			var param = {};
			param.isSection = 1;
			param.academicYear = task.academicYear;
			param.semesterCode = task.semesterCode;
			param.scheduleTaskId = task.schedulingTaskId;
			param.week = task.afterWeek;
			param.beforeWeek = task.beforeWeek;
			var meAdjustOption = me.getAdjustOption();
			if(meAdjustOption.indexOf("1") != -1){
				var adjustOption = meAdjustOption.split("");
				//班级
				if(adjustOption[0] == "1" && task.classIds){
					param.checkClass = 1;
					param.classIdList = task.classIds.split(",");
				}
				//教师
				if(adjustOption[1] == "1" && utils.isNotEmpty(task.afterTeacherIds)){
					param.checkTeacher = 1;
					param.teacherIdList = task.afterTeacherIds.split(",");
				}
				//教室
				if(adjustOption[2] == "1" && utils.isNotEmpty(task.afterVenueId)){
					param.checkRoom = 1;
					param.roomId = task.afterVenueId;
				}
				ajaxData.contructor(false);
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.LESSON_CHECK_CONFLICT, JSON.stringify(param), function(data){
					 if(data && data.code == config.RSP_SUCCESS){
						 callback(data.data);
					 }else{
						 popup.errPop(data.msg);
					 }
				 });
			}
			 
		},
		setDisabled:function(){
			$(".chooseclassnum,.chooseroom,.chooseteacher").removeClass("btn-success").addClass("disabled").prop("disabled", true);
		} ,
		removeDisabled:function(){
			$(".chooseclassnum,.chooseroom,.chooseteacher").addClass("btn-success").removeClass("disabled").prop("disabled", false);
		}
		
	 }
	 
	module.exports = lessonAdd; //根文件夹名称一致
});