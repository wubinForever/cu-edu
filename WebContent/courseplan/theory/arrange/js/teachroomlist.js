/**
 * 专业禁排设置
 */
define(function(require, exports, module) {
	/**
	 * 导入JS
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var helper = require("basePath/utils/tmpl.helper");
	var base = config.base;
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); // 复选单选
	var pagination = require("basePath/utils/pagination");
	var openMessage = require("../../../common/js/openMessage");
	var mapUtil = require("basePath/utils/mapUtil");
	
	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");

	// URL
	var url = require("basePath/config/url.udf");
	var urlData = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var urlDictionary = require("basePath/config/data.dictionary");
	var constant = require("basePath/config/data.constant");

	// 枚举
	var weekType = require("basePath/enumeration/courseplan/WeekType");

	var teachroomlist = {
		dataMap: new mapUtil(),
		retentionWeek:"", // 留用周次
		remark:"", // 备注
		init : function() {
			// 加载当前排课学年学期
			teachroomlist.semester = simpleSelect.loadCourseSmester("semester", true);
			// 加载校区
			teachroomlist.getCampusList();
			teachroomlist.getVenueTypeList();
			// 校区改变事件
			teachroomlist.campusChange("全部");
			// 初始化列表
			teachroomlist.getPagedList();
			
			teachroomlist.getTimeSettings();
			//查询按钮
			$("#query").on("click",function(){
				teachroomlist.pagination.setParam(teachroomlist.queryObject());
				teachroomlist.getPagedList();
			});
			// 批量设置
			$(document).on("click", "button[name = 'batchSetup']", function(){
				if($("#semester").val() == "" || $("#semester").val() == -1 ){
					popup.warPop("请选择学年学期");
					return false;
				}
				var ids = [];
				var venueNames="";
				$("tbody input[type='checkbox']:checked").each(function() {
					var obj = $(this).parent().find("input[name='checNormal']").val();
					ids.push(obj.split("|")[0]);
					venueNames += obj.split("|")[1] + "、";
				});
				venueNames = venueNames.substring(0,venueNames.length -1);
				if (ids.length == 0) {
					popup.warPop("请先选择记录！");
					return false;
				}
				teachroomlist.chooseSection(this,ids,venueNames,true);
			});
			// 设置
			$(document).on("click", "button[name = 'setup']", function(){
				var ids = [];
				var venueName="";
				ids.push($(this).attr("value").split("|")[0]);
				venueName = $(this).attr("value").split("|")[1];
				teachroomlist.chooseSection(this,ids,venueName,false);
			});
		},
		
		/**
		 * 获取查询条件
		 */
		queryObject : function() {
			var param = utils.getQueryParamsByFormId("queryForm");
			if (param.semester) {
				param.academicYear = param.semester.split("_")[0];
				param.semesterCode = param.semester.split("_")[1];
			}		
			delete param.semester;
			return param;
		},
		
		/**
		 * 查询所有校区信息
		 */
		getCampusList : function() {

			ajaxData.contructor(false);
			ajaxData.request(urlData.CAMPUS_GETALL, null, function(data) {
				$("#campusSelectTmpl").tmpl(data.data).appendTo('#campusId');
			});

		},
		
		/**
		 * 根据校区查询楼房信息
		 */
		getBuildingList : function(campusId) {
			var param = {
				"campusId" : campusId
			}
			ajaxData.contructor(false);
			ajaxData.request(urlData.BUILDING_GET_LIST_BY_CAMPUS_ID, param,
					function(data) {
						$("#buildingSelectTmpl").tmpl(data.data).appendTo(
								'#buildingId');
					});
		},
		
		/**
		 * 获取场地类型信息
		 */
		getVenueTypeList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
			reqData["parentCode"] = "JSLX";
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(url.DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE, reqData,
					function(data) {
						$("#venueTypeSelectTmpl").tmpl(data.data).appendTo( '#venueTypeCode');
					});
		},
		
		campusChange : function(firstText) {
			$("#campusId").on("change keyup", function() {
				$("#buildingId").empty();
				$("#buildingId").prepend("<option value=''>"+firstText+"</option>"); //为Select插入一个Option(第一个位置) 
				teachroomlist.getBuildingList($("#campusId").val());
			});
		},
		
		/**
		 * 绑定专业禁排设置列表
		*/
		getPagedList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			var me = this;
			//初始化列表数据
			teachroomlist.pagination = new pagination({
				id: "pagination", 
				url: urlCoursePlan.ARRANGE_CLASSROOMFORBIDDEN_GETPAGEDLIST, 
				param: reqData
			},function(data, totalRows){
				 if(data != null && data.length > 0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass("no-data-html");
					 $("#pagination").show();
					 $.each(data, function(i, item){
						me.dataMap.put(item.venueId, item);
						 if(item.forbiddenLineSection){
								item.forbiddenSection = item.forbiddenLineSection.split(",");
							}else{
								item.forbiddenSection = [];
						 }
					 });
					
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
			}).init();
			$("#chkDiv").attr("class", "checkbox-con");
		},
		
		/**
		 * 查询排课时间
		 */
		getTimeSettings : function(){
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			ajaxData.request(urlCoursePlan.PARAMETER_TIME_GETITEM, reqData, function(data){
				if (data.code == config.RSP_SUCCESS) {
					teachroomlist.timesettings = data.data;
					teachroomlist.getWeekNum();
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		getWeekNum : function(){
			var weekSize = teachroomlist.timesettings.weekCourseDays;
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			ajaxData.request(urlData.SCHOOLCALENDAR_GETCALENDAR, reqData, function(data){
				if (data.code == config.RSP_SUCCESS) {
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
					teachroomlist.weekNum = result;
					popup.setData("weekNum", result);
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		
		/**
		 * 设置禁排节次
		 */
		chooseSection : function(obj,ids,venueNames,isBatch){
			var retentionWeek,remark;
			if(!isBatch){
				retentionWeek = $(obj).attr("value").split("|")[2];
				remark = $(obj).attr("value").split("|")[3];
			}
			var button = $(obj),
				me = this,
				tr = button.parents("tr"),
				code = tr.attr("code"),
				item = me.dataMap.get(code);
			this.openSection(item,venueNames,retentionWeek,remark, function(data){
				me.setSection(button,ids, data, item);
			});
		},
		
		/**
		 * 选择节次弹窗
		 * data 禁排节次
		 * venueNames 要选教室
		 * retentionWeek 留用周次
		 * remark 备注
		 */
		openSection:function(data,venueNames,retentionWeek,remark, callback){
        	popup.setData("retentionWeek", retentionWeek);
            popup.setData("remark", remark);
			popup.setData("sectionData", data);
			popup.setData("venueNames", venueNames);
			popup.setData("timesettings", teachroomlist.timesettings);
			popup.open('./courseplan/theory/arrange/html/teachroomlistset.html', {
				id : 'section',// 唯一标识
				title : '教室禁排设置',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 650,// 弹窗高度*/
				button:[
				        {name:'保存',
				        focus:true,
				        callback:function(){
				        	var iframe = this.iframe.contentWindow;// 弹窗窗体
				        	teachroomlist.retentionWeek = iframe.$("#retentionWeek").val();
				        	teachroomlist.remark = iframe.$("#remark").val();
				        	var section = popup.getData("teachroomlistset");
							return callback(section.getData());        
			            },
			            autofocus: true},
			            {name:"置空",
			            callback:function(){
			            	var section = popup.getData("teachroomlistset");
			            	section.setData([[],[]]);
			            	teachroomlist.retentionWeek="";
			            	teachroomlist.remark= null;
							return callback(section.getData());        
			            }},
			            {name:"取消"}]
			});
		},
		
		/**
		 * 设置禁排节次-保存
		 */
		setSection:function(obj,ids,sectionData, item){
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			var param = {};
			param.academicYear = reqData.semester.split("_")[0];
			param.semesterCode = reqData.semester.split("_")[1];
			param.venueIdList = ids.toString(); // 场地ID集合
			param.retentionWeek = teachroomlist.retentionWeek; // 留用周次
			param.forbiddenLineSection = sectionData.toString(); // 禁排节次
			param.remark = teachroomlist.remark; // 备注
			ajaxData.contructor(false);
			ajaxData.request(urlCoursePlan.ARRANGE_CLASSROOMFORBIDDEN_BATCHSETUP,param,function(data){
				if (data.code == config.RSP_SUCCESS){
					teachroomlist.getPagedList();
				}
				else{
					popup.errPop("保存失败");
				}
			});
		},
	};

	module.exports = teachroomlist; // 与当前文件名一致
	window.teachroomlist = teachroomlist; // 根据文件夹名称一致
});