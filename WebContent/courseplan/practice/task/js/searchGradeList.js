/**
 * 实践任务查询
 * 列表
 * 按年纪专业
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var pagination = require("basePath/utils/pagination");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.udf");
    var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var URLDATA = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var dataDictionary=require("basePath/config/data.dictionary");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var teacher = require("../../../common/js/teacher");
	var openMessage = require("../../../common/js/openMessage");
	var constant = require("basePath/config/data.constant");
	var base = config.base;
	
	//变量名跟文件夹名称一致
	var searchGradeList = {
			/*
			 * 初始化
			 */
			init : function() {
				//默认加载当前学年学期
				var semester = simpleSelect.loadCourseSmester("semester", false);
				this.semester = semester;
				
				//加载年级列表
			    simpleSelect.loadCommon("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST,null,"","全部","");
				//年纪院系联动专业
				$("#departmentId,#grade").change(function(){
					searchGradeList.loadMajor();
				});
				simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS, {
					departmentClassCode : "1",
					isAuthority : true
				}, {
					firstText : constant.SELECT_ALL,
					firstValue : "",
					async : false
				});
				//this.loadDepartment();
				this.loadMajor();
				
				// 绑定环节大类下拉框
				simpleSelect.loadDictionarySelect("tacheTypeCode", dataDictionary.TACHE_TYPE_CODE, {
					firstText : "全部",
					firstValue : ""
				});
				
				
				//加载列表
				this.initPagination();
				
				// 查询
				$("button[name='searchInp']").on('click', function() {
					// 保存查询条件
					searchGradeList.pagination.setParam(searchGradeList.getQueryParams());
				});
				/*
				 * 导出
				 * 导出名称如：实践任务_按年级专业_20171101
				 */
				$('#exportExcel').click(function() {
					var exportNum = $("#exportNumId").val();
					if (utils.isNotEmpty(exportNum) && parseInt(exportNum) > 20000) {
						popup.warPop("导出条数超过2万，不允许导出");
					} else {
						ajaxData.exportFile(URL_COURSEPLAN.ARRANGE_COURSE_EXPORTGRADEPRACTICALSTATISTIC, searchGradeList.pagination.option.param);
					}
				});  
				openMessage.message(".open-message", "指导教师");
				
			},
			/**
			 * 加载院系
			 */
			loadDepartment : function(){
				var param = {};
				var me = this;
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETDEPARTMENT, JSON.stringify(param),function(data) {
					if(data.code == config.RSP_SUCCESS){
						var list = [];
						$.each(data.data, function(i, item){
							list.push({name: item.departmentName, value:item.departmentId});
						});
						simpleSelect.installOption($("#departmentId"), list, "", "全部","" );
						
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			}, 
			/**
			 *  加载专业
			 */
			loadMajor : function(){
				var param = {};
				param.departmentId = $("#departmentId").val();
				param.grade = $("#grade").val();
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETMAJOR, JSON.stringify(param),function(data) {
					if(data.code == config.RSP_SUCCESS){
						var list = [];
						$.each(data.data, function(i, item){
							list.push({name: item.majorName, value:item.majorId});
						});
						simpleSelect.installOption($("#majorId"), list, "", "全部","" );
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			}, 
			/*
			 * 加载列表
			 */
			initPagination : function(){
				this.pagination = new pagination({
					id : "pagination",
					url : URL_COURSEPLAN.ARRANGE_COURSE_GETPRACTICALSTATISTICPAGEDLIST,
					param : this.getQueryParams()
				}, function(data) {
					if (data.length > 0) {
						$.each(data, function(i, item){
							if(item.userIdlist){
								item.userIdLists = item.userIdlist.split(",");
							}
						});
						$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
						$("#pagination").show();
						
						//添加title
						common.titleInit();
					} else {
						$("#tbodycontent").empty().append("<tr><td colspan='13'></td></tr>").addClass("no-data-html");
						$("#pagination").hide();
					}
				}).init();
			},
			
			/**
			 * 获取查询条件
			 */
			getQueryParams:function(){
				var param = {};
				param.academicYear = this.semester.getAcademicYear(); //学年
				param.semesterCode = this.semester.getSemesterCode(); //学期
				param.grade = $("#grade").val(); //年纪
				param.departmentId = $("#departmentId").val(); //院系
				param.majorId = $("#majorId").val(); //专业
				param.courseNoOrName = $("#courseNoOrName").val(); //环节号、名称
				param.tacheTypeCode = $("#tacheTypeCode").val(); //环节类别
				param.useridList = $("#useridList").val(); //指导教师
				param.className = $("#class").val(); //班级
				param.isKKQuery = false; //是否开课单位查询
				return param;
			}
			
	}				
       
	
	module.exports = searchGradeList; //根文件夹名称一致
	window.searchGradeList = searchGradeList;    //根据文件夹名称一致
});