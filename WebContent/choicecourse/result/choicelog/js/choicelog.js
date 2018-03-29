/**
 * 选课日志查询js
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
	var choicelog = {
			init:function(){
				// 加载当前学年学期
				var semester = simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST, "", "", "");
				this.semester = semester;
				// 加载当前学年学期下选课轮次
				var round = simpleSelect.loadSelect("roundId", URL_CHOICECOURSE.ROUND_SELECT, {
					academicYear : semester.getAcademicYear(),
					semesterCode : semester.getSemesterCode()
				}, {
					firstText : "全部",
					firstValue : "-1",
					async : false
				});
				// 选择学年学期联动选课轮次
				$("#semester").change(function() {
					simpleSelect.loadSelect("roundId", URL_CHOICECOURSE.ROUND_SELECT, {
						academicYear : semester.getAcademicYear(),
						semesterCode : semester.getSemesterCode()
					}, {
						firstText : "全部",
						firstValue : "-1",
						async : false
					});
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
				    if(utils.isEmpty($(this).val())&& utils.isEmpty($("#departmentId").val())){
				    	$("#majorId").html("<option value=''>全部</option>");
				    	$("#classId").html("<option value=''>全部</option>");
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
				choicelog.getPagedList();
				//查询按钮
				$("#query").on("click",function(){
					choicelog.pagination.setParam(choicelog.queryObject());
					choicelog.getPagedList();
				});
				// 导出
				$('#exportExcel').click(function() {
					var exportNum = $("#exportNum").val();
					if (utils.isNotEmpty(exportNum) && parseInt(exportNum) > 20000) {
						popup.warPop("导出条数超过2万，不允许导出");
						return false;
					}
					else{
						ajaxData.exportFile(URL_CHOICECOURSE.CHOICELOG_EXPORT, choicelog.pagination.option.param);
					}
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
			 * 绑定教学班空余名额查询列表
			*/
			getPagedList : function() {
				var reqData = utils.getQueryParamsByFormId("queryForm");//获取查询参数
				if(reqData.semester != null && reqData.semester != ""){
					reqData.academicYear = reqData.semester.split("_")[0];
					reqData.semesterCode = reqData.semester.split("_")[1];
				}
				//初始化列表数据
				choicelog.pagination = new pagination({
					id: "pagination", 
					url: URL_CHOICECOURSE.CHOICELOG_GETPAGEDLIST, 
					param: reqData
				},function(data, totalRows){
					 if(data != null && data.length > 0) {
						 $("#exportNum").val(totalRows);
						 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass("no-data-html");
						 $("#pagination").show();
					 }else {
						$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
						$("#pagination").hide();
					 }
				}).init();
			},
			/** ********************* end ******************************* */
		}
		module.exports = choicelog;
		window.choicelog = choicelog;
});	