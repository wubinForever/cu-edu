define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var common = require("basePath/utils/common");
	var config = require("basePath/utils/config");
	//下拉框
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	//工具
	var popup = require("basePath/utils/popup");
	var weekNameArr = ["星期一","星期二","星期三","星期四","星期五","星期六","星期日"];
	var dayArr = ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18"];
	/**
	 * 调课选择节次
	 */
	var addsection = {
		init:function(){
			var me = this;
			me.timesettings = popup.getData("timesettings");
			me.task =  popup.getData("task");
			me.adjustOption =  popup.getData("adjustOption");
			me.weekNum =  popup.getData("weekNum");
			me.initTable();
			me.initBeforeTask();
			$(document).on("click", "#sectionTable td:not(.unable)[code],#sectionTable td.selected[code]", function(){
				me.checkTd(this);
			});
			me.loadConflict();
			popup.setData("addsection", this);
			me.initCheckData();
		},
		/**
		 * 初始化已选中的数据
		 */
		initCheckData:function(){
			var sections = this.task.afterCourseSection.split(",");
			$.each(sections, function(i, section){
				$("td[code="+section+"]").addClass("selected");
			});
		},
		/**
		 * 初始化节次表格
		 */
		initTable : function(){
			var thead = $("<thead></thead>");
			var theadTr = $("<tr></tr>");
			var weekNum = this.weekNum;
			theadTr.appendTo(thead);
			
			theadTr.append("<th width='60'>&nbsp;</th>");
			$.each(this.weekNum, function(i, item){
				theadTr.append("<th>"+weekNameArr[item - 1]+"</th>");
			});
			var length = this.weekNum.length;
			var sectionSize = this.getSectionSize();
			var tbody = $("<tbody></tbody>");
			for(var i = 1; i <= sectionSize ; i ++){
				var _tr = $("<tr></tr>");
				_tr.append("<td  width='60'>"+i+"</td>");
				for(var j = 0 ; j < length ; j ++){
					_tr.append("<td code=" + weekNum[j] + dayArr[i - 1] +"></td>");
				}
				_tr.appendTo(tbody);
			}
			$("#sectionTable").empty().append(thead).append(tbody);
		},
		/**
		 * 获取节次数量
		 */
		getSectionSize:function(){
			return this.timesettings.amSectionNumber + this.timesettings.pmSectionNumber + this.timesettings.nightSectionNumber;
		},
		/**
		 * 页面显示的调前排课任务信息
		 */
		initBeforeTask:function(){
			$("#beforeWeek").html(this.task.afterWeek);
			$("#beforeSection").html(this.task.afterSection);
			var room = "";
			this.task.afterBuildingName && (room += this.task.afterBuildingName);
			this.task.afterVenueName && (room += this.task.afterVenueName);
			if(room){
				$("#beforeRoom").parent().removeClass("hide")
				$("#beforeRoom").html(room);
			}else{
				$("#beforeRoom").parent().addClass("hide");
			}
			if(this.task.afterTeachers){
				$("#beforeTeacher").parent().removeClass("hide")
				$("#beforeTeacher").html(this.task.afterTeachers);
			}else{
				$("#beforeTeacher").parent().addClass("hide");
			}
		},
		/**
		 * 点击TD
		 */
		checkTd : function(obj){
			var _ = $(obj);
			var beforeSections = this.task.afterCourseSection.split(",");
			var length = beforeSections.length;
			if(!_.hasClass("selected")){
				if($("#sectionTable td[code].selected").length >= length){
					$("#sectionTable td[code].selected").removeClass("selected");
				} 
			}
			_.toggleClass("selected");
			
		},
		getData : function(){
			var code = [];
			$("#sectionTable td[code].selected").each(function(i, item){
				code.push($(item).attr("code"));
			});
			return code;
		},
		/**
		 * 校验节次数是否相同
		 */
		validate : function(){
			var sections = this.getData();
			var beforeSections = this.task.afterCourseSection.split(",");
			if(sections.length == 0){
				popup.errPop("请选择调整后的节次！");
				return false;
			}else if(sections.length != beforeSections.length){
				popup.errPop("选择的节次数与调前节次数不一致！");
				return false;
			}
			return true;
		},
		/**
		 * 获取冲突节次数据
		 */
		loadConflict : function(){
			var me = this;
			var task = this.task;
			var param = {};
			param.isSection = 1;
			param.academicYear = task.academicYear;
			param.semesterCode = task.semesterCode;
			param.scheduleTaskId = task.schedulingTaskId;
			param.week = task.afterWeek;
			param.beforeWeek = task.beforeWeek;
			if(me.adjustOption.indexOf("1") != -1){
				var adjustOption = me.adjustOption.split("");
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
						 if(data.data && data.data.length > 0){
							 $.each(data.data, function(i, item){
								 $("td[code="+item+"]").addClass("unable");
							 });
						 }
					 }else{
						 popup.errPop("加载数据失败：" + data.msg);
					 }
				 });
			}
			 
		}
	}
	module.exports = addsection; //根文件夹名称一致
});