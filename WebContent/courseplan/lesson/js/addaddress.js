define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var common = require("basePath/utils/common");
	var config = require("basePath/utils/config");
	//下拉框
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_DATA = require("basePath/config/url.data");
	var simpleSelect = require("basePath/module/select.simple");
	var DICTIONARY = require("basePath/config/data.dictionary");
	var CONSTANT = require("basePath/config/data.constant");
	//工具
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var mapUtil = require("basePath/utils/mapUtil");
	/**
	 * 调课选择节次
	 */
	var addaddress = {
		data : new mapUtil(),
		init:function(){
			var me = this;
			me.task =  popup.getData("task");
			me.adjustOption =  popup.getData("adjustOption");
			popup.setData("addaddress", this);
			$("#minSeatAmount").val(me.task.teachingClassMemberCount);
			simpleSelect.loadCampus("campus", false, "-1",CONSTANT.SELECT_ALL,"-1", false  );
			simpleSelect.loadDictionarySelect("teachroomType", DICTIONARY.ID_FOR_VENUE_TYPE_CODE, {defaultValue:"-1",firstText:CONSTANT.SELECT_ALL, firstValue:"-1"});
			simpleSelect.loadBuilding("building", $("#campus").val(),{defaultValue:"-1",firstText:CONSTANT.SELECT_ALL, firstValue:"-1"});
			me.loadConflict();
			//分页
			ajaxData.contructor(true);
			this.pagination = new pagination({
				id: "pagination", 
				url: URL_DATA.VENUE_GET_PAGEDLIST, 
				param: this.getParam()
			},function(data){
				me.data.clear();
				$.each(data, function(i, item){
					me.data.put(item.venueId, item);
				});
				$("#tbodycontent").html($("#tableTmpl").tmpl(data)).setNoDataHtml($("#pagination"));
			}).init();
			
			$("button[name=queryBtn]").click(function(){
				me.pagination.setParam(me.getParam());
			});
			$("#campus").change(function(){
				simpleSelect.loadBuilding("building", $("#campus").val(),{defaultValue:me.task.buildingId,firstText:CONSTANT.SELECT_ALL, firstValue:"-1"});
			});
		},
		getData : function(){
			var venueId = $("input[name=venueId]:checked").val();
			var item;
			if(venueId ){
				item = this.data.get(venueId);
			} 
			return item
		},
		getParam:function(){
			var param = {};
			param.campusId = $("#campus").val();
			param.buildingId = $("#building").val();
			param.venueTypeCode = $("#teachroomType").val();
			param.minSeatAmount = $("#minSeatAmount").val();
			param.maxSeatAmount = $("#maxSeatAmount").val();
			param.venueName = $("#room").val();
			param.venueTypeCode == '-1' && delete param.venueTypeCode;
			param.buildingId == '-1' && delete param.buildingId;
			param.campusId == '-1' && delete param.campusId;
			!param.minSeatAmount && delete param.minSeatAmount;
			!param.maxSeatAmount && delete param.maxSeatAmount;
			if(this.conflictRoom){
				param.notInId = this.conflictRoom.join(",");
			}
			return param;
		},
		 /**
		 * 获取冲突节次数据
		 */
		loadConflict : function(){
			var me = this;
			var task = this.task;
			var param = {};
			var adjustOption = me.adjustOption;
			param.isRoom = 1;
			param.academicYear = task.academicYear;
			param.semesterCode = task.semesterCode;
			param.scheduleTaskId = task.schedulingTaskId;
			param.week = task.afterWeek;
			param.beforeWeek = task.beforeWeek;
			param.section = task.afterCourseSection;
			
			if(adjustOption && adjustOption.indexOf("1") != -1 && adjustOption.split("")[2] == "1"){
				ajaxData.contructor(false);
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.LESSON_CHECK_CONFLICT, JSON.stringify(param), function(data){
					 if(data && data.code == config.RSP_SUCCESS){
						me.conflictRoom = data.data;
					 }else{
						 popup.errPop("加载数据失败：" + data.msg);
					 }
				 });
			} 
		}
	}
	module.exports = addaddress; //根文件夹名称一致
});