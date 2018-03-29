/**
 * 处理异动学生选课结果js
 */
define(function (require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.trainplan");
	var URLDATA = require("basePath/config/url.data");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_STU = require("basePath/config/url.studentarchives");
	var alienChangeCategoryEnum = require("basePath/enumeration/studentarchives/AlienChangeCategory");// 枚举，异动类别
	var dataConstant = require("basePath/config/data.constant");// 公用常量 
	var isCoreCurriculum = require("basePath/enumeration/trainplan/IsCoreCurriculum");// 是否通识课
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dataDictionary=require("basePath/config/data.dictionary");
	var helper = require("basePath/utils/tmpl.helper");
	var base = config.base;
	/**
	 * 处理异动学生选课结果
	 */
	//模块化
	var alienchange = {
		init:function(){
			// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST, "", "", "");
			$("#semesterName").text($("#semester").find("option:selected").text());
			// 加载异动类别
		    simpleSelect.loadEnumSelect("alienChangeCategoryCode",
					alienChangeCategoryEnum, {
						firstText : dataConstant.SELECT_ALL,
						firstValue : ""
					});
			// 加载年级列表
		    simpleSelect.loadCommon("grade", URL.GRADEMAJOR_GRADELIST,null,"","全部","",null);
		    // 加载院系
		    simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS, {
				departmentClassCode : "1",
				isAuthority : true
			}, {
				firstText : "全部",
				firstValue : "",
				async : false
			});
		    // 年级联动专业
			$("#grade").change(function(){
				var reqData={};
				reqData.grade =$(this).val();
			    reqData.departmentId=$("#departmentId").val();
			    if(utils.isNotEmpty($(this).val()) && $(this).val()=='-1' && utils.isEmpty($("#departmentId").val())){
			    	$("#majorId").html("<option value=''>全部</option>");
			    	return false;
			    }
			    simpleSelect.loadCommon("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,"","全部","");
			});
			// 院系联动专业
			$("#departmentId").change(function(){
				var reqData={};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade").val();
				if(utils.isEmpty($(this).val()) && utils.isNotEmpty($("#grade").val())  && $("#grade").val()=='-1'){
		    	  $("#majorId").html("<option value=''>全部</option>");
		    	  return false;
				}
				simpleSelect.loadCommon("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,"","全部","");
			});
			// 初始化绑定数据
			alienchange.getPagedList();
			//查询按钮
			$("#query").on("click",function(){
				alienchange.getPagedList();
			});
			//取消选课 弹框
			$(document).on("click", "button[name = 'btnCancel']", function(){
				alienchange.popCancelCourse(this,$("#semester").val());
			});
			//补选课程 弹框
			$(document).on("click", "button[name = 'btnAdd']", function(){
				alienchange.popReCourseChoosing(this,$("#semester").val());
			});
		},
		
		/**
		 * 取消课程列表
		*/
		initCancelCourse : function(){
			alienchange.defaultData();
			alienchange.getStudentChoiceList();
		},
		
		/**
		 * get 查询条件
		 */
		defaultData : function(){
			$("#userId").val(utils.getUrlParam('userId'));
			$("#semester").val(utils.getUrlParam('semester'));
			$("#alienChangeCategoryCode").val(utils.getUrlParam('alienChangeCategoryCode'));
		},
		
		/**
		 * 绑定课程类型
		*/
		loadCourseTypeList : function() {
			ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_LOADCOURSETYPE, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var optionString = "<option title='全部' value='' >全部</option>";  
					for(var i = 0 ;i < data.data.length; i++){
						var name = data.data[i].dataDictionaryName;
						if(name.length > 8){
							name = name.substring(0,8) + '...'; 
						}
						optionString += "<option title=\"" + data.data[i].dataDictionaryName + "\" value=\"" + data.data[i].code + "\" >" + name + "</option>"; 
					}
					$("#courseTypeCode").html(optionString);  
				}
			});
		},
		
		/**
		 * 绑定课程属性
		*/
		loadCourseAttributeList : function() {
			ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_LOADCOURSEATTRIBUTE, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var optionString = "<option title='全部' value='' >全部</option>";  
					for(var i = 0 ;i < data.data.length; i++){
						var name = data.data[i].dataDictionaryName;
						if(name.length > 8){
							name = name.substring(0,8) + '...'; 
						}
						optionString += "<option title=\"" + data.data[i].dataDictionaryName + "\" value=\"" + data.data[i].code + "\" >" + name + "</option>"; 
					}
					$("#courseAttributeCode").html(optionString);  
				}
			});
		},
		
		/**
		 * 绑定异动学生选课结果列表
		*/
		getPagedList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != "" && reqData.semester != null){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			//初始化列表数据
			alienchange.pagination = new pagination({
				id: "pagination", 
				url: URL_CHOICECOURSE.CHOICEALIENCHANGE_GETPAGEDLIST, 
				param: reqData
			},function(data){
				 if(data != null && data.length > 0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass("no-data-html");
					 $("#pagination").show();
				 }else {
					 $("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
					 $("#pagination").hide();
				 }
			}).init();
		},
		
		/**
		 * 绑定学生选课列表
		*/
		getStudentChoiceList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != "" && reqData.semester != null){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_GETLIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data.code == config.RSP_SUCCESS) {
					if (data != null && data.data.length > 0) {
						$("#tbodycontent").html($("#tamplContent").tmpl(data.data, helper));
					}
					else{
						$("#tbodycontent").html($("#tableTmpl").tmpl(data)).setNoDataHtml();
					}
				}
				else {
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		
		/**
		 * 绑定补选课程列表
		*/
		getCoursePagedList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != "" && reqData.semester != null){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			//初始化列表数据
			alienchange.pagination = new pagination({
				id: "pagination", 
				url: URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_GETCOURSEPAGEDLIST, 
				param: reqData
			},function(data){
				 if(data != null && data.length > 0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass("no-data-html");
					 $("#pagination").show();
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
			}).init();
		},
		
		/**
		 * 绑定补选课程教学班列表
		*/
		getTeachingClassList : function(isChecked) {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			reqData.isChecked = isChecked;
			ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_GETTEACHINGCLASSLIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data.code == config.RSP_SUCCESS) {
					if (data != null && data.data.length > 0) {
						$("#tbodycontent").html($("#bodyContentImpl").tmpl(data.data, helper));
					}
					else{
						$("#tbodycontent").html($("#bodyContentImpl").tmpl(data)).setNoDataHtml();
					}
				}
				else {
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		
		/**
		 * 弹框 补选课程
		 */
		popReCourseChoosing : function(obj,semester){
			var userId = $(obj).attr("data-tt-id").split("_")[0];
			var classId = $(obj).attr("data-tt-id").split("_")[1];
			var alienChangeCategoryCode = $(obj).attr("data-tt-id").split("_")[2];
			popup.open('./choicecourse/manage/adjustchoice/html/reCourseChoosing.html?semester='+semester+'&userId='+userId+'&alienChangeCategoryCode='+alienChangeCategoryCode+'&classId='+classId, // 这里是页面的路径地址
			{
				id : 'ReCourseChoosing',
				title : '补选课程',
				width : 1100,
				height : 420,
				cancelVal : '关闭',
				cancel : function() {
					alienchange.getPagedList();
				}
			});
		},
		
		/**
		 * 弹框 取消选课
		 */
		popCancelCourse : function(obj,semester){
			var userId = $(obj).attr("data-tt-id").split("_")[0];
			var alienChangeCategoryCode = $(obj).attr("data-tt-id").split("_")[1];
			popup.open('./choicecourse/manage/alienchange/html/cancelCourse.html?userId='+userId+'&semester='+semester+'&alienChangeCategoryCode='+alienChangeCategoryCode, // 这里是页面的路径地址
			{
				id : 'cancelCourse',
				title : '取消选课',
				width : 900,
				height : 320,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var ids = [];
					var choicedNums = [];
					iframe.$("tbody input[type='checkbox']:checked").each(function() {
						var obj = $(this).parent().find("input[name='checNormal']").val();
						ids.push(obj);
					});
					if (ids.length == 0) {
						popup.warPop("请勾选要取消的选课课程");
						return false;
					}
					// 参数
					var param = {
						"teachingClassStudentIds" : ids,
						"flag" : 3
					};
				    return alienchange.batchCancelChoice(iframe,param);
				},
				cancel : function() {
					// 取消逻辑
					alienchange.getPagedList();
				}
			});
		},
		
		/**
		 * 批量取消选课
		 */
		batchCancelChoice : function(iframe,param) {
			var flag = false;
			// post请求提交数据
			ajaxData.contructor(false);
			ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_DELETE, param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var reqData = iframe.utils.getQueryParamsByFormId("queryForm");//获取查询参数
					if(reqData.semester != "" && reqData.semester != null){
						reqData.academicYear = reqData.semester.split("_")[0];
						reqData.semesterCode = reqData.semester.split("_")[1];
					}
					reqData.choiceProcessStatus = 1;
					// 同时更新学籍系统的异动学生选课处理状态
					ajaxData.request(URL_STU.ALIENCHANGERECORD_UPDATECHOICEPROCESSSTATUS, reqData, function(data) {
						if (data.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("取消成功", function() {
							});
							// 刷新列表
							iframe.alienchange.getStudentChoiceList();
							// 去掉全选
							iframe.$("#chkDiv").attr("class", "checkbox-con");
						} else {
							// 提示失败
							popup.errPop(data.msg);
						}
					});
				} else {
					// 提示失败信息
					popup.errPop(data.msg);
				}
			  });
		     return flag;
		}
		
		/** ********************* end ******************************* */
	}
	module.exports = alienchange;
	window.alienchange = alienchange;
});	