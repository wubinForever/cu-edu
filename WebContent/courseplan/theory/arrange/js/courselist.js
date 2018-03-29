/**
 * 课程固排禁排设置
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

	var courselist = {
		dataMap: new mapUtil(),
		dayCourseSectionCount:"",
		remark:"",
		init : function() {
			// 加载当前排课学年学期
			courselist.semester = simpleSelect.loadCourseSmester("semester", true);
			// 开课单位
			simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {isAuthority:true},{firstText:"全部",firstValue:""});
			
			//初始化绑定数据
			courselist.getPagedList();
			
			//查询按钮
			$("#queryBtn").on("click",function(){
				/*courselist.pagination.setParam(courselist.queryObject());*/
				courselist.getPagedList();
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
				courselist.chooseSection(this,ids,majorNames,true);
			});
			// 设置
			$(document).on("click", "button[name = 'setup']", function(){
				var ids = [];
				var majorName="";
				ids.push($(this).attr("value").split("|")[0]);
				majorName = $(this).attr("value").split("|")[1];
				courselist.chooseSection(this,ids,majorName,false);
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
		 * 绑定课程固排禁排设置列表
		*/
		getPagedList : function() {
			/*var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}*/
			var me = this;
			//初始化列表数据
			courselist.pagination = new pagination({
				id: "pagination", 
				url: urlCoursePlan.ARRANGE_COURSESOLIDFORBIDDEN_GETPAGEDLIST, 
				param: this.queryObject()
			},function(data){
				 if(data != null && data.length > 0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass("no-data-html");
					 $("#pagination").show();
					 $.each(data, function(i, item){
						 me.dataMap.put(item.gradeMajorId, item);
						 if(item.forbiddenLineSection && item.solidLineSection){
								item.forbiddenSection = item.forbiddenLineSection.split(",");
								item.solidLineSection = item.solidLineSection.split(",");
							}else{
								item.forbiddenSection = [];
								item.solidLineSection = [];
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
					courselist.timesettings = data.data;
					courselist.getWeekNum();
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		getWeekNum : function(){
			var weekSize = courselist.timesettings.weekCourseDays;
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
					courselist.weekNum = result;
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
				remark = $(obj).attr("value").split("|")[3];
			}
			var button = $(obj),
				me = this,
				tr = button.parents("tr"),
				code = tr.attr("code"),
				item = me.dataMap.get(code);
			this.openSection(item,majorNames,remark, function(data){
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
			param.forbiddenLineSection = sectionData[0].toString();
			param.befixedLineSectionDesc = sectionData[1].toString();
			param.remark = courselist.remark;
			ajaxData.contructor(false);
			ajaxData.request(urlCoursePlan.ARRANGE_COURSESOLIDFORBIDDEN_BATCHSETUP,param,function(data){
				if (data.code == config.RSP_SUCCESS){
					courselist.getPagedList();
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
			popup.setData("timesettings", courselist.timesettings);
			popup.open('./courseplan/theory/arrange/html/courselistset.html', {
				id : 'section',// 唯一标识
				title : '课程固排禁排设置',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 650,// 弹窗高度*/
				button:[
				        {name:'保存',
				        focus:true,
				        callback:function(){
				        	var iframe = this.iframe.contentWindow;// 弹窗窗体
				        	courselist.dayCourseSectionCount = iframe.$("#sectionLimit").val();
				        	courselist.remark = iframe.$("#remark").val();
				        	var section = popup.getData("courselistset");
							return callback(section.getData());        
			            },
			            autofocus: true},
			            {name:"置空",
			            callback:function(){
			            	var section = popup.getData("courselistset");
			            	section.setData([[],[]]);
			            	courselist.dayCourseSectionCount="";
			            	courselist.remark= null;
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

	module.exports = courselist; // 与当前文件名一致
	window.courselist = courselist; // 根据文件夹名称一致
});