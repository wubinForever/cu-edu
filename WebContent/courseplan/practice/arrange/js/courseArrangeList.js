/**
 * 实践安排查询
 * 按开课单位
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
	var dataDictionary=require("basePath/config/data.dictionary");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var teacher = require("../../../common/js/teacher");
	var openMessage = require("../../../common/js/openMessage");
	var base = config.base;
	
	//变量名跟文件夹名称一致
	var courseArrangeList = {
			/*
			 * 初始化
			 */
			init : function() {
				//默认加载当前学年学期
				var semester = simpleSelect.loadCourseSmester("semester", false);
				this.semester = semester;
				// 绑定环节大类下拉框
				simpleSelect.loadDictionarySelect("tacheTypeCode", dataDictionary.TACHE_TYPE_CODE, {
					firstText : "全部",
					firstValue : ""
				});
				
				// 绑定开课单位下拉框
				simpleSelect.loadSelect("kkDepartmentId",URLDATA.DEPARTMENT_STARTCLASS_FOR_SELECT, {isAuthority:true},{firstText:"全部",firstValue:""});
				this.initPagination();
				
				// 查询
				$("button[name='searchInp']").on('click', function() {
					// 保存查询条件
					courseArrangeList.pagination.setParam(courseArrangeList.getQueryParams());
				}); 
				/*
				 * 导出
				 * 导出名称如：实践安排_按开课单位_20171101
				 */
				$('#exportExcel').click(function() {
					var exportNum = $("#exportNumId").val();
					if (utils.isNotEmpty(exportNum) && parseInt(exportNum) > 20000) {
						popup.warPop("导出条数超过2万，不允许导出");
					} else {
						ajaxData.exportFile(URL_COURSEPLAN.ARRANGE_COURSE_EXPORTKPRACTICALARRANGESTATISTIC, courseArrangeList.pagination.option.param);
					}
				}); 
				openMessage.message(".open-message", "指导教师");
			},
			
			/**
			 * 加载开课单位
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
						simpleSelect.installOption($("#kkDepartmentId"), list, "", "全部","" );
						
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			}, 
			
			//初始加载列表数据，
			initPagination : function(){
				courseArrangeList.pagination = new pagination({
					id : "pagination",
					url : URL_COURSEPLAN.ARRANGE_COURSE_GETPRACTICALARRANGESTATISTICPAGEDLIST,
					param : this.getQueryParams()
				}, function(data,totalRows) {
					$("#exportNumId").val(totalRows);
					if (data.length > 0) {
						$.each(data, function(i, item){
							if(item.userIdlist){
								item.userIdLists = item.userIdlist.split("、");
							}
							
						});
						$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
						$("#pagination").show();
						//添加title
						common.titleInit();
					} else {
						$("#tbodycontent").empty().append("<tr><td colspan='17'></td></tr>").addClass("no-data-html");
						$("#pagination").hide();
					}
				}).init();
			},	
			/**
			 * 获取查询条件
			 * @academicYear 学年
			 * @semesterCode 学期
			 * @departmentId 开课单位
			 * @courseNoOrName 环节号/名称
			 * @tacheTypeCode 环节类别
			 * @teamNo 小组号
			 * @teachers 指导教师
			 * @studentNoOrName 学号/姓名
			 */
			getQueryParams:function(){
				var param = {};
				param.academicYear = this.semester.getAcademicYear(); //学年
				param.semesterCode = this.semester.getSemesterCode(); //学期
				param.isKKQuery = true; //是否开课单位
				param.kdepartmentId = $("#kkDepartmentId").val(); //开课单位Id
				param.courseNoOrName = $("#courseNo").val(); //环节号、名称
				param.tacheTypeCode = $("#tacheTypeCode").val(); //环节类别
				param.groupNo = $("#teamNo").val(); //小组号
				param.useridList = $("#teachers").val(); //指导教师
				param.studentNoOrName = $("#studentNoOrName").val(); //学号或姓名
				return param;
			}
	}				
       
	
	module.exports = courseArrangeList; //根文件夹名称一致
	window.courseArrangeList = courseArrangeList;    //根据文件夹名称一致
});