/**
 * 按学生调整选课js
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
	 * 按学生调整选课
	 */
	//模块化
	var adjustchoice = {
		semester:"",
		semesterName:"",
		userId:"",
		studentNo:"",
        theoreticalTaskId:"",
        semestercode :"",
        majorId:"",
        credit:"",
        weekList:"",
        sectionList:"",
        courseTypeCode:"",
        courseAttributeCode:"",
        isCoreCurriculum:"",
        choiceLimit:"",
        choicedNum:"",
        classId:"",
        saveResult:"",
		init:function(){
			// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			
			//选择学生 弹框
			$(document).on("click", "button[name = 'select-student']", function(){
				if($("#semester").val() == "" || $("#semester").val() == -1 ){
					popup.warPop("请选择学年学期");
					return false;
				}
				adjustchoice.semester= $("#semester").val();
				adjustchoice.semesterName = $("#semester").find("option:selected").text();
				adjustchoice.popSelectStudent(adjustchoice.semester,adjustchoice.semesterName);
			});
			
			//查询按钮
			$("#query").on("click",function(){
				if($("#userId").val() == ""){
					popup.warPop("请选择学生");
					return false;
				}
				adjustchoice.getList();
			});
			
			// 初始化绑定数据
			adjustchoice.getList();
			
			// 删除
			$(document).on("click", "button[name='btnDrop']", function() {
				adjustchoice.deleteChoice(this);
			});
			
			//补选课程 弹框
			$(document).on("click", "button[name = 'recourse-choosing']", function(){
				if($("#semester").val() == "" || $("#semester").val() == -1 ){
					popup.warPop("请选择学年学期");
					return false;
				}
				if($("#userId").val() == ""){
					popup.warPop("请选择学生");
					return false;
				}
				adjustchoice.popReCourseChoosing($("#semester").val(),$("#userId").val(),$("#classId").val());
			});
		},
		
		/**
		 * 选择学生页面初始化加载
		 */
		initSelectStudent:function(){
			// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			// 显示学年学期
			adjustchoice.showSemester();
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
			    if(utils.isEmpty($(this).val()) && utils.isEmpty($("#departmentId").val())){
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
				if(utils.isEmpty($(this).val()) && utils.isEmpty($("#grade").val())  && $("#grade").val()==''){
		    	  $("#majorId").html("<option value=''>全部</option>");
		    	  $("#classId").html("<option value=''>全部</option>");
		    	  return false;
				}
				simpleSelect.loadCommon("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,"","全部","");
				$("#classId").html("<option value=''>全部</option>");
			});
			//专业联动班级
			$("#majorId").change(function(){
				var reqData={};
				reqData.majorId = $(this).val();
				
				if(utils.isEmpty($(this).val())){
		    	   $("#classId").html("<option value='-1'>全部</option>");
		    	   return false;
				}
				simpleSelect.loadCommon("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,reqData,"","全部","-1",null);
			});
			// 初始化绑定数据
			adjustchoice.getStudentPagedList();
			//查询按钮
			$("#query").on("click",function(){
				adjustchoice.getStudentPagedList();
			});
			// 单选框选中事件
			$(document).on("click", "input[name=radioButton]",function(){
				adjustchoice.getUserId(this);
			});
		},
		
		/**
		 * 补选课程初始化加载
		 */
		initReCourseChoose : function (){
			adjustchoice.showData();
			// 绑定课程类型及属性
			adjustchoice.loadCourseTypeList();
			adjustchoice.loadCourseAttributeList();
			// 绑定补选课程列表
			adjustchoice.getCoursePagedList();
			//查询按钮
			$("#query").on("click",function(){
				adjustchoice.getCoursePagedList();
			});
			//选教学班 弹框
			$(document).on("click", "button[name = 'btnTeachingClass']", function(){
				var params = {};
			    params.userId = $("#userId").val();
			    params.classId = $("#classId").val();
			    params.alienChangeCategoryCode = $("#alienChangeCategoryCode").val();
				adjustchoice.selTeachingClass(this,params);
			});
		},
		
		/**
		 * 初始化选教学班页面
		 */
		initSelTeachingClass : function(){
			adjustchoice.showDataByCourseId();
			// 绑定补选课程教学班列表
			adjustchoice.getTeachingClassList(1);
			// 单选框选中事件
			$(document).on("click", "input[name=radioButton]",function(){
				adjustchoice.getTheoreticalTaskId(this);
			});
			// 过滤有冲突的教学班
			$(document).on("click", "input[name='chkConflict']", function() {
				if($('input[name="chkConflict"]').prop("checked")){
					adjustchoice.getTeachingClassList(1);
				}
				else{
					adjustchoice.getTeachingClassList(0);
				}
			});
		},
		
		/**
		 * 显示学年学期
		 */
		showSemester : function() {
			var semesterName = utils.getUrlParam('semesterName');
			var semester = utils.getUrlParam('semester');
			$("#semesterName").text(semesterName);
			$("#semester").val(semester);
		},
		
		/**
		 * 补选课程初始化查询条件
		 */
		showData : function() {
			$("#semester").val(utils.getUrlParam('semester'));
			$("#userId").val(utils.getUrlParam('userId'));
			$("#classId").val(utils.getUrlParam('classId'));
			$("#alienChangeCategoryCode").val(utils.getUrlParam('alienChangeCategoryCode'));
		},
		
		/**
		 * 课程教学班初始化查询条件
		 */
		showDataByCourseId : function(){
			var courseId = utils.getUrlParam('courseId');
			$("#courseId").val(courseId);
			$("#userId").val(utils.getUrlParam('userId'));
			$("#academicYear").val(utils.getUrlParam('academicyear'));
			$("#semesterCode").val(utils.getUrlParam('semestercode'));
			$("#classId").val(utils.getUrlParam('classId'));
			$("#alienChangeCategoryCode").val(utils.getUrlParam('alienChangeCategoryCode'));
			
		},
		
		/**
		 * 获取学生Id
		 */
		getUserId : function(obj) {
			adjustchoice.userId = $(obj).attr("data-tt-id"); // 学生id
			adjustchoice.studentNo ="[" + $(obj).attr("data-tt-no")+"]" + $(obj).attr("data-tt-name") ;
			adjustchoice.classId = $(obj).attr("data-tt-class"); // 班级Id
			adjustchoice.majorId = $(obj).attr("data-tt-majorId"); // 专业Id
			adjustchoice.grade = $(obj).attr("data-tt-grade"); // 年级
		},
		
		/**
		 * 选教学班
		 */
		getTheoreticalTaskId : function(obj) {
			adjustchoice.theoreticalTaskId = $(obj).attr("data-tt-id"); // 教学班id
			adjustchoice.academicyear = $(obj).attr("data-tt-academicyear");
			adjustchoice.semestercode = $(obj).attr("data-tt-semestercode");
			adjustchoice.credit = $(obj).attr("data-tt-credit");
			adjustchoice.weekList = $(obj).attr("data-tt-weekList");
			adjustchoice.sectionList = $(obj).attr("data-tt-sectionList");
			adjustchoice.courseTypeCode = $(obj).attr("data-tt-courseTypeCode");
			adjustchoice.courseAttributeCode = $(obj).attr("data-tt-courseAttributeCode");
			adjustchoice.isCoreCurriculum = $(obj).attr("data-tt-isCoreCurriculum");
			adjustchoice.choiceLimit = $(obj).attr("data-tt-choiceLimit");
			adjustchoice.choicedNum = $(obj).attr("data-tt-choicedNum");
			adjustchoice.userId = utils.getUrlParam('userId');
			adjustchoice.majorId = utils.getUrlParam('majorId');
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
		 * 退选
		 * @param obj 当前页面对象
		 */
		deleteChoice : function(obj) {
			var teachingClassStudentIds = [];
			teachingClassStudentIds.push($(obj).attr("data-tt-id"));
			// 参数
			var param = {
				"teachingClassStudentIds" : teachingClassStudentIds,
				"flag" : 1
			};
			popup.askPop("确认退选吗？", function() {
				ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("退选成功", function() {
						});
						// 刷新列表
						adjustchoice.getList();
					} else {
						// 提示失败
						popup.errPop("退选失败");
					}
				});
			});
		},
		
		/**
		 * 弹框选择学生
		 */
		popSelectStudent : function(semester,semesterName){
			popup.open('./choicecourse/manage/adjustchoice/html/selectStudent.html?semester='+semester+'&semesterName=' + escape(semesterName), // 这里是页面的路径地址
			{
				id : 'SelectStudent',
				title : '选择学生',
				width : 1200,
				height : 520,
				okVal : '确定',
				cancelVal : '取消',
				ok : function() {
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					// 点击保存时，如果没有选择学生则给出提示
					if(iframe.adjustchoice.userId == ""){
						popup.warPop("请选择学生");
						return false;
					}
					// 返回选择的学生ID、学号、姓名、院系及年级
					$("#userId").val(iframe.adjustchoice.userId);
					$("#studentNo").val(iframe.adjustchoice.studentNo);
					$("#classId").val(iframe.adjustchoice.classId);
					$("#majorId").val(iframe.adjustchoice.majorId);
					$("#grade").val(iframe.adjustchoice.grade);
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/**
		 * 绑定学生选课列表
		*/
		getList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_GETLIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data.code == config.RSP_SUCCESS) {
					if (data != null && data.data.length > 0) {
						$("#topNumLimit").text(data.data[0].courseNumLimit == null ? "不限" : data.data[0].courseNumLimit);
						$("#topCreditLimit").text(data.data[0].creditLimit == null ? "不限" : data.data[0].creditLimit);
						$("#choicedCourseCount").text(data.data[0].choicedCourseCount == null ? 0 : data.data[0].choicedCourseCount);
						$("#choicedCredit").text(data.data[0].choicedCredit == null ? 0 : data.data[0].choicedCredit);
						$("#tbodycontent").html($("#tamplContent").tmpl(data.data, helper));
					}
					else{
						if($("#userId").val() != ""){
							reqData.courseTypeCode = "TopCreditLimit";
							reqData.courseAttributeCode = "TopNumLimit";
							ajaxData.request(URL_CHOICECOURSE.CREDITANDNUMLIMIT_GETCREDITANDNUMLIST, reqData, function(data) {
								if (data.code == config.RSP_SUCCESS) {
									if (data != null && data.data.length > 0) {
										$("#topNumLimit").text(data.data[0].courseNumLimit == null ? "不限" : data.data[0].courseNumLimit);
										$("#topCreditLimit").text(data.data[0].creditLimit == null ? "不限" : data.data[0].creditLimit);
									}
									else{
										$("#topNumLimit").text("不限");
										$("#topCreditLimit").text("不限");
									}
								}
							});
							$("#choicedCourseCount").text(0);
							$("#choicedCredit").text(0);
						}
						$("#tbodycontent").html($("#tableTmpl").tmpl(data)).setNoDataHtml();
					}
				}
				else {
					popup.errPop("查询失败："+data.msg);
				}
			},true);
		},
		
		/**
		 * 绑定学生列表
		*/
		getStudentPagedList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			//初始化列表数据
			adjustchoice.pagination = new pagination({
				id: "pagination", 
				url: URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_GETSTUDENTPAGEDLIST, 
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
		 * 绑定补选课程列表
		*/
		getCoursePagedList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
			if(reqData.semester != null && reqData.semester != ""){
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			//初始化列表数据
			adjustchoice.pagination = new pagination({
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
						$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
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
		popReCourseChoosing : function(semester,userId,classId){
			popup.open('./choicecourse/manage/adjustchoice/html/reCourseChoosing.html?semester='+semester+'&userId='+userId+'&classId='+classId, // 这里是页面的路径地址
			{
				id : 'ReCourseChoosing',
				title : '补选课程',
				width : 1100,
				height : 420,
				cancelVal : '关闭',
				cancel : function() {
					adjustchoice.getList();
				}
			});
		},
		
		/**
		 * 弹框 选教学班
		 */
		selTeachingClass : function(obj,param){
			var courseId = $(obj).attr("data-tt-id");
			var academicYear = $(obj).attr("data-tt-academicYear");
			var semesterCode = $(obj).attr("data-tt-semesterCode");
			popup.open('./choicecourse/manage/adjustchoice/html/selTeachingClass.html?academicYear='+academicYear+'&semesterCode='+semesterCode+'&userId='+param.userId+'&classId='+param.classId+'&alienChangeCategoryCode='+param.alienChangeCategoryCode+'&courseId='+courseId, // 这里是页面的路径地址
			{
				id : 'selTeachingClass',
				title : '选教学班',
				width : 700,
				height : 330,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					// 点击保存时，如果没有选择教学班则给出提示
					if(iframe.adjustchoice.theoreticalTaskId == ""){
						popup.warPop("请选择教学班");
						return false;
					};
					var params = {};
					var userIdList = {};
					userIdList = iframe.adjustchoice.userId;
					params.academicYear = iframe.adjustchoice.academicyear;
					params.semesterCode = iframe.adjustchoice.semestercode;
					params.theoreticalTaskId = iframe.adjustchoice.theoreticalTaskId;
					params.userIdList = userIdList;
					params.choiceLimit = iframe.adjustchoice.choiceLimit;
					params.choicedNum = iframe.adjustchoice.choicedNum;
					params.majorId = iframe.adjustchoice.majorId;
					params.credit = iframe.adjustchoice.credit;
					params.weekList = iframe.adjustchoice.weekList;
					params.sectionList = iframe.adjustchoice.sectionList;
					params.courseTypeCode = iframe.adjustchoice.courseTypeCode;
					params.courseAttributeCode = iframe.adjustchoice.courseAttributeCode;
					params.isCoreCurriculum = iframe.adjustchoice.isCoreCurriculum;
					params.flag = param.alienChangeCategoryCode == "" ? 3 : 5;
				    return adjustchoice.adjustAdd(params,iframe);
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/**
		 * 选教学班 保存
		 */
		adjustAdd : function(params,iframe){
			var flag = false;
			// post请求提交数据
			ajaxData.contructor(false);
			ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_ADJUSTADD, params, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					// 如果处理异动学生选课，还需要更新异动记录的选课处理状态为已处理
					var reqData = iframe.utils.getQueryParamsByFormId("queryForm");//获取查询参数
					reqData.choiceProcessStatus = 1;
					if(reqData.alienChangeCategoryCode != ""){
						ajaxData.request(urlStudentarchives.ALIENCHANGERECORD_UPDATECHOICEPROCESSSTATUS, reqData, function(data) {
							if (data.code == config.RSP_SUCCESS) {
								// 提示成功
								popup.okPop("保存成功", function() {
								});
								// 刷新列表
								adjustchoice.getCoursePagedList();
							} else {
								// 提示失败
								popup.errPop(data.msg);
							}
						});
					}else{
						// 刷新列表
						adjustchoice.getCoursePagedList();
					}
					flag = true;
				} else {
					// 提示失败信息
					popup.errPop(data.msg);
				}
			  });
			  return flag;
           },
		/** ********************* end ******************************* */
	}
	module.exports = adjustchoice;
	window.adjustchoice = adjustchoice;
});	