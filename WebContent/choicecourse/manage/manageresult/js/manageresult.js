/**
 * 处理选课结果js
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
	var urlStudentarchives = require("basePath/config/url.studentarchives");
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
	 * 处理选课结果
	 */
	//模块化
	var manageresult = {
	    keyString:"",
	    courseId:"",
		init:function(){
			// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			// 绑定开课单位下拉框（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",URLDATA.DEPARTMENT_STARTCLASS_FOR_SELECT, null,{firstText:"全部",firstValue:""});
			// 绑定课程类型及属性
			manageresult.loadCourseTypeList();
			manageresult.loadCourseAttributeList();
			// 初始化绑定数据
			manageresult.getPagedList();
			//调剂 弹框
			$(document).on("click", "button[name = 'popAdjust']", function(){
				manageresult.popAdjust(this,$("#semester").val());
			});
			//查询按钮
			$("#query").on("click",function(){
				manageresult.getPagedList();
			});
			//教学班选课学生名单 弹框
			$(document).on("click", "a[name = 'studentList']", function(){
				manageresult.popstudentList(this,$("#semester").val());
			});
			// 批量删除教学班
			$(document).on("click", "button[name ='batchDelete']", function() {
				manageresult.batchDeleteTheoreticalTask();
			});
			// 删除教学班
			$(document).on("click", "button[name ='delete']", function() {
				manageresult.deleteTheoreticalTask(this);
			});
		},
		
		/**
		 * 教学班选课学生名单
		 */
		initTeachingChoiceStudent : function(){
			// 默认带出教学班ID作为查询条件
			manageresult.showData(true);
			// 初始化教学班选课学生名单列表
			manageresult.getTeachingChoiceStudentList();
			//查询按钮
			$("#query").on("click",function(){
				manageresult.getTeachingChoiceStudentList();
			});
			// 退选
			$(document).on("click", "button[name='btnDrop']", function() {
				manageresult.deleteChoice(this);
			});
		},
		
		/**
		 * 调剂
		 */
		initAdjust : function(){
			// 默认带出教学班ID作为查询条件
		    manageresult.showData(false);
			// 初始化教学班选课学生名单列表
			manageresult.getTeachingChoiceStudentList();
			// 绑定课程下可调剂的教学班
			manageresult.getTeachingClassList();
            // 单选框单击事件
			$(document).on("click", "input[name=radioButton]",function(){
				manageresult.getTheoreticalTaskId(this);
			});
		},
		
		/**
		 * 调剂不成功学生名单
		 */
		initSelectResult : function (){
			manageresult.initSelectionResults();
		},
		
		/**
		 * 调剂不成功学生名单列表
		 * 
		 */
		initSelectionResults : function() {
			var data = popup.data("data");// 选课不成功学生名单数据
			$("#tbodycontent").html("");
			$("#tbodycontent").removeClass("no-data-html");
			if (data != null && data.data.length > 0) {
				$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
				$("#teachingClassCount").html(data.data.length);
			} else {
				$("#tbodycontent").append("<tr><td colspan='5'></td></tr>").addClass("no-data-html");
				$("#teachingClassCount").html(0);
			}
		},
		
		/**
		 * 初始化教学班选课学生名单
		*/
		showData : function(isShow){
			$("#theoreticalTaskId").val(utils.getUrlParam('theoreticalTaskId'));
			$("#semester").val(utils.getUrlParam('semester'));
			// 是否显示班级下拉
			if(isShow){
				// 加载教学班下的行政班级
				var reqData={};
				reqData.classIdList = utils.getUrlParam('classIds');
				simpleSelect.loadCommon("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,reqData,"","全部","",null);
			}else{
				$("#courseId").val(utils.getUrlParam('courseId'));
			}
		},
		/**
		 * 选教学班
		 */
		getTheoreticalTaskId : function(obj) {
			manageresult.keyString = $(obj).attr("data-tt-id");
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
		 * 绑定学生列表
		*/
		getPagedList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			//初始化列表数据
			manageresult.pagination = new pagination({
				id: "pagination", 
				url: URL_CHOICECOURSE.CHOICERESULTMANAGE_GETPAGEDLIST, 
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
			$("#chkDiv").attr("class", "checkbox-con");
		},
		
		/**
		 * 批量删除教学班
		 */
		batchDeleteTheoreticalTask : function() {
			var ids = [];
			var choicedNums = [];
			$("tbody input[type='checkbox']:checked").each(function() {
				var obj = $(this).parent().find("input[name='checNormal']").val();
				ids.push(obj);
			});
			if (ids.length == 0) {
				popup.warPop("请勾选要删除的教学班");
				return false;
			}
			// 参数
			var param = {
				"ids" : ids
			};
			popup.askPop("确认删除教学班吗？", function() {
				ajaxData.contructor(false);
				ajaxData.request(URL_CHOICECOURSE.CHOICERESULTMANAGE_VALIDATE,param,function(data){
					// 如果验证通过则进行批量删除操作
					if (data.code == config.RSP_SUCCESS){
						ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_DELETE, param, function(data) {
							if (data.code == config.RSP_SUCCESS) {
								// 提示成功
								popup.okPop("删除成功", function() {
								});
								// 刷新列表
								manageresult.getPagedList();
								//去掉全选
								$("#chkDiv").attr("class", "checkbox-con");
							} else {
								// 提示失败
								popup.errPop(data.msg);
							}
						});
					}
					else{
						popup.warPop("勾选的教学班中存在学生选课，不允许删除");
						return false;
					}
				});

			});
		},
		
		/**
		 * 删除教学班
		 */
		deleteTheoreticalTask : function(obj) {
			var ids = [];
			var keyId = $(obj).attr("data-tt-id");
			var choicedNum = $(obj).attr("data-tt-choiced");
			ids.push(keyId);
			if (ids.length == 0) {
				popup.warPop("请选择要删除的教学班");
				return false;
			}
			if(choicedNum > 0){
				popup.warPop("该教学班已存在学生选课，不允许删除");
				return false;
			}
			// 参数
			var param = {
				"ids" : ids
			};
			popup.askPop("确认删除教学班吗？", function() {
				ajaxData.contructor(false);
				ajaxData.request(URL_CHOICECOURSE.CHOICERESULTMANAGE_VALIDATE,param,function(data){
					// 如果验证通过则进行批量删除操作
					if (data.code == config.RSP_SUCCESS){
						ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_DELETE, param, function(data) {
							if (data.code == config.RSP_SUCCESS) {
								// 提示成功
								popup.okPop("删除成功", function() {
								});
								// 刷新列表
								manageresult.getPagedList();
							} else {
								// 提示失败
								popup.errPop(data.msg);
							}
						});
					}
					else{
						popup.warPop("勾选的教学班中存在学生选课，不允许删除");
						return false;
					}
				});

			});
		},
		
		/**
		 * 教学班选课学生名单
		*/
		getTeachingChoiceStudentList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			ajaxData.request(URL_CHOICECOURSE.CHOICERESULTMANAGE_GETTEACHINGCHOICESTUDENTLIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data.code == config.RSP_SUCCESS) {
					if (data != null && data.data.length > 0) {
					    $("#studentCount").text(data.data.length);
						$("#tbodycontent").html($("#bodyContentImpl").tmpl(data.data, helper));
					}
					else{
						 $("#tbodycontent").append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
					}
				}
				else {
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		
		/**
		 * 退选
		 * @param obj 当前页面对象
		 */
		deleteChoice : function(obj) {
			var teachingClassStudentIds = [];
			teachingClassStudentIds.push($(obj).attr("data-tt-id"))
			// 参数
			var param = {
				"teachingClassStudentIds" : teachingClassStudentIds,
				"flag" : 2 // 处理选课结果-退选
			};
			popup.askPop("确认退选吗？", function() {
				ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("退选成功", function() {
						});
						// 刷新列表
						manageresult.getTeachingChoiceStudentList();
					} else {
						// 提示失败
						popup.errPop("退选失败");
					}
				});
			});
		},
		
		/*
		 * 弹框 调剂 获取当前课程下可调剂的教学班
		 */
		getTeachingClassList : function(isChecked) {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			reqData.isAdjust = 4; // 调剂
			ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_GETTEACHINGCLASSLIST, reqData, function(data) {
				$("#downTbodycontent").html("");
				$("#downTbodycontent").removeClass("no-data-html");
				if (data.code == config.RSP_SUCCESS) {
					if (data != null && data.data.length > 0) {
                        $("#teachingClassCount").text(data.data.length);
						$("#downTbodycontent").html($("#downBodyContentImpl").tmpl(data.data, helper));
					}
					else{
						$("#downTbodycontent").append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
					}
				}
				else {
					popup.errPop("查询失败："+data.msg);
				}
			});
		},
		
		/*
		 * 弹框 调剂
		 */
		popAdjust : function(obj,semester){
			var theoreticalTaskId = $(obj).attr("data-tt-id");
			var courseId = $(obj).attr("data-tt-course");
			popup.open('./choicecourse/manage/manageresult/html/adjustList.html?semester='+semester+'&courseId='+courseId+'&theoreticalTaskId='+theoreticalTaskId, // 这里是页面的路径地址
			{
				id : 'popAdjust',
				title : '调剂',
				width : 1000,
				height : 620,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function(iframeObj) {
						return manageresult.saveAdjust(iframeObj); 
						
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/**
		 * 保存调剂
		 */
		saveAdjust : function(iframeObj){
			var userIds = []; // 获取勾选学生
			var teachingStudentClassIds = []; // 获取勾选学生
			iframeObj.$("tbody input[type='checkbox']:checked").each(function() {
				var obj = iframeObj.$(this).parent().find("input[name='checNormal']").val();
				userIds.push(obj.split("_")[0]);
				teachingStudentClassIds.push(obj);
			});
			if (userIds.length == 0) {
				popup.warPop("请勾选要调剂的学生");
				return false;
			};
			if(iframeObj.manageresult.keyString == ""){
				popup.warPop("请选择教学班");
				return false;
			};
			var params = {};
			params.courseId = iframeObj.manageresult.keyString.split("_")[0];
			params.theoreticalTaskId = iframeObj.manageresult.keyString.split("_")[1];// 教学班Id
			params.courseTypeCode = iframeObj.manageresult.keyString.split("_")[2];
			params.courseAttributeCode = iframeObj.manageresult.keyString.split("_")[3];
			params.isCoreCurriculum = iframeObj.manageresult.keyString.split("_")[4];
			params.credit = iframeObj.manageresult.keyString.split("_")[5];
			params.academicYear =iframeObj.manageresult.keyString.split("_")[6];
			params.semesterCode = iframeObj.manageresult.keyString.split("_")[7];
			params.choiceLimit = iframeObj.manageresult.keyString.split("_")[8];
			params.choicedNum = iframeObj.manageresult.keyString.split("_")[9];
			params.weekList = iframeObj.manageresult.keyString.split("_")[10];
			params.sectionList = iframeObj.manageresult.keyString.split("_")[11];
			params.userIdList = userIds.toString(); // 学生Id
			params.teachingStudentClassIdList = teachingStudentClassIds.toString();
			params.flag = 4; // 处理选课结果-调剂
			return manageresult.saveData(params);
		},
		
		/**
		 * 选课处理结果调剂保存
		 */
		saveData : function(params){
			ajaxData.contructor(false);
			ajaxData.request(URL_CHOICECOURSE.CHOICERESULTMANAGE_ADJUSTSAVE, params, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					// 弹出不成功学生名单
					if (data.data.length > 0) {
						manageresult.popSelectionResults(data);
					} else {
						// 提示成功
						popup.okPop("保存成功", function() {
						});
						// 刷新列表
						manageresult.pagination.loadData();
					}
				} else if (data.code == config.RSP_FAIL) {
					// 提示失败信息
					popup.errPop(data.msg);
				} else {
					// 提示失败
					popup.errPop(data.msg);
				}
			});
		},
		
		/*
		 * 弹框 教学班选课学生名单
		 */
		popstudentList : function(obj,semester){
			var theoreticalTaskId = $(obj).attr("data-tt-id");
			popup.open('./choicecourse/manage/manageresult/html/studentList.html?semester='+semester+'&classIds='+$(obj).attr("data-tt-class")+'&theoreticalTaskId='+theoreticalTaskId, // 这里是页面的路径地址
			{
				id : 'popstudentList',
				title : '教学班选课学生名单',
				width : 800,
				height : 380,
				cancelVal : '关闭',
				cancel : function() {
					// 刷新列表
					manageresult.pagination.loadData();
				}
			});
		},
		
		/*
		 * 弹框 选课不成功学生名单
		 */
		popSelectionResults : function(data){
			popup.data("data", data);// 选课不成功学生名单数据
			popup.open('./choicecourse/manage/batchchoice/html/selectionResults.html', // 这里是页面的路径地址
			{
				id : 'selectionResults',
				title : '选课不成功学生名单',
				width : 700,
				height : 300,
				okVal : '关闭',
				ok : function() {
					// 刷新列表
					manageresult.pagination.loadData();
				}
			});
		}
		
		
		/** ********************* end ******************************* */
	}
	module.exports = manageresult;
	window.manageresult = manageresult;
});	