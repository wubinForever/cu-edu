/**
 * 教学班成绩查询与分析
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var urlScore = require("configPath/url.score");
	var urlData = require("configPath/url.data");
	var dataConstant = require("configPath/data.constant");
	var pagination = require("basePath/utils/pagination");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var scoreCategory = require("basePath/enumeration/score/ScoreCategory");// 枚举，成绩类别
	/**
	 * 环节成绩分制
	 */
	var teachingScoreAnalysis = {
			// 初始化
			init : function() {
				// 加载当前学年学期
				simpleSelect.loadCommonSmester("semester", urlData.COMMON_GETSEMESTERLIST, "", "", "");

				// 绑定开课单位下拉框
				simpleSelect.loadSelect("departmentId",
						urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
							isAuthority : true
						}, {
							firstText : dataConstant.SELECT_ALL, // --请选择--
							firstValue : dataConstant.EMPTY,
							async : false,
							length:12
						});
				
				// 课程：下拉模糊查询
				var courseInfo = new select({
					dom : $("#courseDiv"),
					param : {
						departmentId : $("#departmentId").val(),
						semester : $("#semester").val()
					},
					loadData : function(){
						return [];
					},
					onclick : teachingScoreAnalysis.initTeachingClass
				}).init();
				this.courseInfoSelect = courseInfo;
				// 学期变化，教学班变化
				$("#semester").change(function(){
					 $("#departmentId").change();
				});
				// 开课单位联动课程
				$("#departmentId").change(function(){
					// 模糊查询
					$(".toggle-select").val("数据正在加载中...");
					teachingScoreAnalysis.getData();
					$("#teachingClassNo").html("<option value=''>全部</option>");
					$(".toggle-select").val("");
					$("#courseId").val("");
				});
				// 课程联动教学班
				$("#courseDiv").change(function() {
					teachingScoreAnalysis.initTeachingClass(courseInfo.getValue());
				});
				simpleSelect.loadEnumSelect("scoreType",scoreCategory,{defaultValue:scoreCategory.TotalScore.value});
				//查询
				$("#query").click(function(){
					teachingScoreAnalysis.getPageList();
				});
				teachingScoreAnalysis.getPageList();
				//绑定导出
				$(document).on("click", "#import", function() {
					var requestParam = utils.getQueryParamsByFormId("queryForm");
					ajaxData.exportFile(urlScore.EXPORT_TEACHINGSCORE_ANALYSIS_LIST,requestParam);
				});
			},
			/**
			 * 教学班查询条件初始化
			 * 
			 */
			initTeachingClass : function(courseId) {
				$("#courseId").val(courseId);
				// 课程联动教学班
				var reqData = {};
				reqData.courseId = courseId;
				reqData.semester=$("#semester").val();
				if (utils.isEmpty(courseId)) {
					$("#teachingClassNo").html("<option value=''>全部</option>");
					return false;
				}
				simpleSelect.loadSelect("teachingClassNo", urlScore.GET_TASKNO_SELECT_LIST,reqData,{firstText:"全部",firstValue:""});
			},
			/**
			 * 得到课程数据
			 * 
			 */
			getData : function() {
				var param = {
					openDepartmentId : $("#departmentId").val(),
					semester : $("#semester").val(),
					isAuthority:true
				};
				var me = this;
				var dataDom = [];
				var departmentId = $("#departmentId").val();
				if(utils.isEmpty(departmentId)){
					me.courseInfoSelect.reload(dataDom);
					return ;
				}
				ajaxData.contructor(true); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
				ajaxData.request(urlScore.GET_COURSE_SELECT_LIST, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						$.each(data.data, function(i, item){
							var option = {
								value : item.value,
								name :  item.name
							};
							dataDom.push(option);
						});
						me.courseInfoSelect.reload(dataDom);
					}
				});
			},
			getPageList:function(){
				//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				teachingScoreAnalysis.pagination = new pagination({
						id: "pagination", 
						url: urlScore.GET_TEACHINGSCORE_ANALYSIS_LIST, 
						param: requestParam
					},function(data){
						 if(data && data.length != 0){
							  $("#pagination").show();
								 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
						 }
						 else{
							 $("#tbodycontent").empty().append("<table><tr><td></td></tr></table>").addClass("no-data-html");
							 $("#pagination").hide();
						 }
					}).init();
			},
	}
	
	module.exports = teachingScoreAnalysis;
    window.teachingScoreAnalysis = teachingScoreAnalysis;
	
});