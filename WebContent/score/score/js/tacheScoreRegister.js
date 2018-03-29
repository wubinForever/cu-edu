/**
 * 环节成绩登记册
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var urlScore = require("configPath/url.score");
	var urlData = require("configPath/url.data");
	var urlUdf = require("configPath/url.udf");
	var dataConstant = require("configPath/data.constant");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
	var pagination = require("basePath/utils/pagination");
	var urlstudent = require("configPath/url.studentarchives");// 学籍url
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var ve = require("basePath/utils/validateExtend");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var ve = require("basePath/utils/validateExtend");
	var enableChanges = require("basePath/enumeration/score/EnableChanges");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var dataDictionary = require("configPath/data.dictionary");
	/**
	 * 环节成绩分制
	 */
	var tacheScoreRegister = {
			// 初始化
			init : function() {
				simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
				var academicYearSemesterChange = function(academicYearSemester){
					if(academicYearSemester){
						var requestParames = {
							//学年
							academicYear: academicYearSemester.split("_")[0],
							//学期
							semesterCode: academicYearSemester.split("_")[1]
						};
					}
				}
				academicYearSemesterChange($("#academicYearSemesterSelect").val());
				$("#academicYearSemesterSelect").on("change", function(){
					academicYearSemesterChange($(this).val());
				});
				// 加载年级、院系、专业、班级
				tacheScoreRegister.loadAcademicYearAndRelation();
				//列表数据加载
				tacheScoreRegister.getPagedList();
				//统计班级环节总数
				tacheScoreRegister.getClassNum();
				//加载更多
				$('#btnLoadMore').click(function(){
					$("#noData").append("<div class='loading-back'></div>");
					$("#pageIndex").val(parseInt($("#pageIndex").val())+1);
					
					tacheScoreRegister.getPagedList(true);
					if(parseInt($("#courseNum").text()) == parseInt($("#pageIndex").val())+1){
						$("#btnLoadMore").attr('disabled',"true");
						$("#btnLoadMore").attr('class',"btn disabled");
					}
				});
				//查询
				$("#query").click(function(){
					$("#pageIndex").val(0);
					tacheScoreRegister.getClassNum();
					tacheScoreRegister.getPagedList(false);
					
				});
				//打印
				$("#btnPrint").click(function(){
					tacheScoreRegister.print();
				});
			},
			getClassNum:function(){
				if($("#btnLoadMore").prop("disabled") == true){
			    	$("#btnLoadMore").removeAttr('disabled');
			    	$("#btnLoadMore").attr('class',"btn-more mb10 text-center");
			    }
				//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//学年
				requestParam.academicYear   =requestParam.academicYearSemesterSelect.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
				
				requestParam.semester = $("#academicYearSemesterSelect").find("option:selected").text()
				requestParam.isAuthority=true;
				ajaxData.contructor(false);
			    ajaxData.request(urlScore.GET_TACHESCORE_REGISTERLIST_SUM,requestParam,function(data){
			    	if(data.code==config.RSP_SUCCESS){
			    		$("#courseNum").text(data.data);
			    		
			    		if(data.data <= 1){
			    			$("#btnLoadMore").attr('disabled',"true");
			    			$("#btnLoadMore").attr('class',"btn disabled");
			    		}
			    	}
			    });
			},
			//查询分页函数
			getPagedList:function(flag){
				
				
//				//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//学年
				requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
				
				requestParam.semester = $("#academicYearSemesterSelect").find("option:selected").text();
				requestParam.isAuthority=true;
			    tacheScoreRegister.pagination = new pagination({
					id: "pagination", 
					url: urlScore.GET_TACHESCORE_REGISTERLIST, 
					param: requestParam
				},function(data){
					 if(data && data.length != 0){
						 if(flag){
							 $("#contentBody").removeClass("no-data-html").append($("#bodyContentImpl").tmpl(data));
						 }
						 else{
							 $("#contentBody").empty().removeClass("no-data-html").append($("#bodyContentImpl").tmpl(data));
						 }
						 $("#noData").show();
					 }
					 else{
						 $("#contentBody").empty().append("<table><tr><td></td></tr></table>").addClass("no-data-html");
						 $("#noData").hide();
					 }
				}).init();
			},
			/**
			 * 打印
			 */
			print : function(){
				//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//学年
				requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
				
				requestParam.semester = $("#academicYearSemesterSelect").find("option:selected").text();
				requestParam.isAuthority=true;
				ajaxData.contructor(false);
			    ajaxData.request(urlScore.GET_TACHESCORE_REGISTERLIST_PRINT,requestParam,function(data){
			    	if(data.code==config.RSP_SUCCESS){
			    		//加载学生数据
						$("#printBody").empty().append($("#bodyContentImpl").tmpl(data.data));
				    	$("#printBody").show();
				    	
				    	$("#printBody").jqprint();
				    	
				    	$("#printBody").hide();
				    	
				    	$("#printBody").html("");
			    	}
			    	else{
			    		popup.okPop(data.msg,function(){});
			    	}
			    });
			},
			/**
			 * 加载年级、院系、专业、班级 int类型默认为-1，如年级，String类型默认为空，如院系等
			 */
			loadAcademicYearAndRelation : function() {
				// 年级（从数据库获取数据）
				simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,
						null, {
							async : false
						});

				// 院系（从数据库获取数据）
				simpleSelect
						.loadSelect(
								"departmentId",
								urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
								{
									departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value,
									isAuthority : true
								}, {
									firstText : dataConstant.SELECT_ALL,
									firstValue : ""
								});
				// 专业（从数据库获取数据）
				simpleSelect.loadSelect("majorId",
						urlTrainplan.GRADEMAJOR_MAJORLIST, null, {
							firstText : dataConstant.SELECT_ALL,
							firstValue : ""
						});
				// 年级联动专业
				$("#grade").change(
						function() {
							var reqData = {};
							reqData.grade = $(this).val();
							reqData.departmentId = $("#departmentId").val();
							$("#classId").html(
									"<option value=''>" + dataConstant.SELECT_ALL
											+ "</option>");
							if (utils.isNotEmpty($(this).val())
									&& $(this).val() == '-1'
									&& utils.isEmpty($("#departmentId").val())) {
								// 专业（从数据库获取数据）
								simpleSelect.loadSelect("majorId",
										urlTrainplan.GRADEMAJOR_MAJORLIST, null, {
											firstText : dataConstant.SELECT_ALL,
											firstValue : ""
										});
								return false;
							}
							simpleSelect.loadSelect("majorId",
									urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
										firstText : dataConstant.SELECT_ALL,
										firstValue : ""
									});
						});
				// 院系联动专业
				$("#departmentId").change(
						function() {
							var reqData = {};
							reqData.departmentId = $(this).val();
							reqData.grade = $("#grade").val();

							$("#classId").html(
									"<option value=''>" + dataConstant.SELECT_ALL
											+ "</option>");
							if (utils.isEmpty($(this).val())
									&& utils.isNotEmpty($("#grade").val())
									&& $("#grade").val() == '-1') {
								// 专业（从数据库获取数据）
								simpleSelect.loadSelect("majorId",
										urlTrainplan.GRADEMAJOR_MAJORLIST, null, {
											firstText : dataConstant.SELECT_ALL,
											firstValue : ""
										});
								return false;
							}
							simpleSelect.loadSelect("majorId",
									urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
										firstText : dataConstant.SELECT_ALL,
										firstValue : ""
									});
						});
				// 专业联动班级
				$("#majorId").change(
						function() {
							var reqData = {};
							reqData.majorId = $(this).val();
							reqData.grade = $("#grade").val();
							if (utils.isEmpty($(this).val())) {
								$("#classId").html(
										"<option value=''>"
												+ dataConstant.SELECT_ALL
												+ "</option>");
								return false;
							}
							simpleSelect.loadSelect("classId",
									urlstudent.CLASS_GET_CLASSSELECTBYQUERY,
									reqData, {
										firstText : dataConstant.SELECT_ALL,
										firstValue : ""
									});
						});
			},
	}
	
	module.exports = tacheScoreRegister;
    window.tacheScoreRegister = tacheScoreRegister;
	
});