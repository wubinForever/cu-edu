/**
 * 教师固排禁排设置
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
	var treeSelect = require("basePath/module/select.tree");

	// URL
	var url = require("basePath/config/url.udf");
	var urlData = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var urlDictionary = require("basePath/config/data.dictionary");
	var constant = require("basePath/config/data.constant");

	// 枚举
	var weekType = require("basePath/enumeration/courseplan/WeekType");

	var teacherlist = {
		dataMap: new mapUtil(),
		dayCourseSectionCount:"",
		remark:"",
		init : function() {
			// 加载当前排课学年学期
			teacherlist.semester = simpleSelect.loadCourseSmester("semester", true);
			//所属单位
			treeSelect.loadTree({
				idTree : "teachingUnitTree", // 树Id
				id : "teachingUnitId", // 下拉数据隐藏Id
				name : "teachingUnitName", // 下拉数据显示name值
				url : urlData.DEPARTMENT_ZTREE, // 下拉数据获取路径
				onclick : function() {
				} // 选择之后的事件
			});
			
			// 初始化绑定数据
			teacherlist.getPagedList();
			
			this.getTimeSettings();
			//查询按钮
			$("#query").on("click",function(){
				teacherlist.pagination.setParam(teacherlist.queryObject());
				teacherlist.getPagedList();
			});
			// 批量设置
			$(document).on("click", "button[name = 'batchSetup']", function(){
				if($("#semester").val() == "" || $("#semester").val() == -1 ){
					popup.warPop("请选择学年学期");
					return false;
				}
				var ids = [];
				var majorNames="";
				$("tbody input[type='checkbox']:checked").each(function() {
					var obj = $(this).parent().find("input[name='checNormal']").val();
					ids.push(obj.split("|")[0]);
					majorNames += obj.split("|")[1] + "、";
				});
				majorNames = majorNames.substring(0,majorNames.length -1);
				if (ids.length == 0) {
					popup.warPop("请先选择记录！");
					return false;
				}
				teacherlist.chooseSection(this,ids,majorNames,true);
			});
			// 设置
			$(document).on("click", "button[name = 'setup']", function(){
				var ids = [];
				var majorName="";
				ids.push($(this).attr("value").split("|")[0]);
				majorName = $(this).attr("value").split("|")[1];
				teacherlist.chooseSection(this,ids,majorName,false);
			});
		},
		
		/**
		 * 加载院系
		 */
		loadDepartment : function(){
		   simpleSelect.loadSelect("departmentId", urlData.DEPARTMENT_GETDEPTLISTBYCLASS, {
			   departmentClassCode : "1",
			   isAuthority : true
		   }, {
			   firstText : "全部",
			   firstValue : "-1",
			   async : false
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
		 * 绑定教师禁排设置列表
		*/
		getPagedList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			var me = this;
			//初始化列表数据
			teacherlist.pagination = new pagination({
				id: "pagination", 
				url: urlCoursePlan.ARRANGE_TEACHERSOLIDFORBIDDEN_GETPAGEDLIST, 
				param: reqData
			},function(data, totalRows){
				 if(data != null && data.length > 0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass("no-data-html");
					 $("#pagination").show();
					 $.each(data, function(i, item){
						 me.dataMap.put(item.gradeMajorId, item);
						 if(item.forbiddenLineSection){
								item.forbiddenSection = item.forbiddenLineSection.split(",");
							}else{
								item.forbiddenSection = [];
						 }
					 });
					
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");
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
					teacherlist.timesettings = data.data;
					teacherlist.getWeekNum();
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		getWeekNum : function(){
			var weekSize = teacherlist.timesettings.weekCourseDays;
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
					teacherlist.weekNum = result;
					popup.setData("weekNum", result);
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		
		/**
		 * 设置禁排节次
		 */
		chooseSection : function(obj,ids,majorNames,isBatch){
			var dayCourseSectionCount,remark;
			if(!isBatch){
				dayCourseSectionCount = $(obj).attr("value").split("|")[2];
				remark = $(obj).attr("value").split("|")[3];
			}
			var button = $(obj),
				me = this,
				tr = button.parents("tr"),
				code = tr.attr("code"),
				item = me.dataMap.get(code);
			this.openSection(item,majorNames,dayCourseSectionCount,remark, function(data){
				me.setSection(button,ids, data, item);
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
			param.gradeMajorIdList = ids.toString();
			param.dayCourseSectionCount = teacherlist.dayCourseSectionCount;
			param.forbiddenLineSection = sectionData.toString();
			param.remark = teacherlist.remark;
			ajaxData.contructor(false);
			ajaxData.request(urlCoursePlan.ARRANGE_TEACHERSOLIDFORBIDDEN_BATCHSETUP,param,function(data){
				if (data.code == config.RSP_SUCCESS){
					teacherlist.getPagedList();
				}
				else{
					popup.errPop("保存失败");
				}
			});
		},
		
		/**
		 * 选择节次弹窗
		 */
		openSection:function(data,majorNames,dayCourseSectionCount,remark, callback){
        	popup.setData("dayCourseSectionCount", dayCourseSectionCount);
        	if(remark !=""){
            	popup.setData("remark", remark);
        	}
			popup.setData("sectionData", data);
			popup.setData("majorNames", majorNames);
			popup.setData("timesettings", teacherlist.timesettings);
			popup.open('./courseplan/theory/arrange/html/teacherlistset.html', {
				id : 'section',// 唯一标识
				title : '教师固排禁排设置',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 650,// 弹窗高度*/
				button:[
				        {name:'保存',
				        focus:true,
				        callback:function(){
				        	var iframe = this.iframe.contentWindow;// 弹窗窗体
				        	teacherlist.dayCourseSectionCount = iframe.$("#sectionLimit").val();
				        	teacherlist.remark = iframe.$("#remark").val();
				        	var section = popup.getData("teacherlistset");
							return callback(section.getData());        
			            },
			            autofocus: true},
			            {name:"置空",
			            callback:function(){
			            	var section = popup.getData("teacherlistset");
			            	section.setData([[],[]]);
			            	teacherlist.dayCourseSectionCount="";
			            	teacherlist.remark= null;
							return callback(section.getData());        
			            }},
			            {name:"取消"}]
			});
		},
		
		getData:function(){
			var param = {};
			param.academicYear = 2017;
			param.semesterCode = 2;
			return param;
		},
	};

	module.exports = teacherlist; // 与当前文件名一致
	window.teacherlist = teacherlist; // 根据文件夹名称一致
});