define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	//var authority = require("basePath/utils/authority");
	var validate = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	
	
	
	// 枚举
	var isCurrentSemester = require("basePath/enumeration/common/IsCurrentSemester");
	
	// 下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");

	var URL = require("basePath/config/url.courseplan");
	var URLDATA = require("basePath/config/url.data");
	var URL_GRADUATION = require("basePath/config/url.graduation");
	var dictionary = require("basePath/config/data.dictionary");
	
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var urlData = require("basePath/config/url.data");// 基础数据url
	var urlUdf = require("basePath/config/url.udf");// 基础框架url
	var url = require("basePath/config/url.studentarchives");// 学籍url
	var urlTrainplan = require("basePath/config/url.trainplan");// 培养方案url
	var applyTypeEnum = require("basePath/enumeration/studentarchives/ApplyType");// 枚举，异动申请类型
	var alienChangeCategoryEnum = require("basePath/enumeration/studentarchives/AlienChangeCategory");// 枚举，异动类别
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
	var alienChangeStatusEnum = require("basePath/enumeration/studentarchives/AlienChangeStatus");// 枚举，异动状态
	var canBeConfirmedClassEnum = require("basePath/enumeration/studentarchives/CanBeConfirmedClass");// 枚举，是否确定班级 
	var confirmedClassEnum = require("basePath/enumeration/studentarchives/ConfirmedClass");// 枚举，确定班级
	var isEnabledEnum = require("basePath/enumeration/common/IsEnabled");// 枚举，是否启用
	var isCancelEnum = require("basePath/enumeration/studentarchives/IsCancel");// 枚举，是否取消
	var trainingLevelEnum = require("basePath/enumeration/udf/TrainingLevel");// 枚举，培养层次
	var dataDictionary = require("basePath/config/data.dictionary");// 数据字典
	//var dataConstant = require("configPath/data.constant");// 公用常量 
	var CONSTANT = require("basePath/config/data.constant");// 公用常量 
	var helper = require("basePath/utils/tmpl.helper");// 帮助，如时间格式化等
	var treeSelect = require("basePath/module/select.tree");// 公用下拉树
	var pagination = require("basePath/utils/pagination");// 分页
	var validateExtend = require("basePath/utils/validateExtend");// 自定义校验

	var base = config.base;
	
	// 变量名跟文件名称一致
	var graduationStatistics = {
		queryObject:{},
		init : function() {
			
			//毕业年届
			ajaxData.request(URL_GRADUATION.GRAD_GRAUATEDATESET_GET, "", function(data) {
   				// 毕业年届
   				$("#graduateYear").val(data.graduateYear);
				var param = {
					graduateYear : data.graduateYear,
					isAuthority : true
				};
   			    // 院系
				simpleSelect.loadSelect("departmentId", URL_GRADUATION.GRAD_STUDENT_GETGRADUATEDEPARTMENTLIST,
					param, {
						firstText : CONSTANT.SELECT_ALL,
						firstValue : "-1",
						async: false
					});
   				//加载列表
   				graduationStatistics.pagedList();
   			},true);
			
			//导出
			$("#export").bind("click",function(){
				ajaxData.exportFile(URL_GRADUATION.GRAD_STUDENT_GRADUATE_EXPORTGRADUATERATEFILE
						, graduationStatistics.pagination.option.param);
			});
			// 查询
			$('#query').click(function() {
				//保存查询条件
				graduationStatistics.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});
			//graduationStatistics.pagedList();
		}
		,
		pagedList:function(){
			//初始化列表数据
			graduationStatistics.pagination = new pagination({
				id: "pagination", 
				url: URL_GRADUATION.GRAD_STUDENT_GRADUATE_GETREPORTLIST, 
				param: utils.getQueryParamsByFormId("queryForm")
			},function(data){
				 if(data && data.length>0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass(
						"no-data-html");
					 if($("#type").val()=="1"){
						 $(".tr_major").hide();
					 }else{
						 $(".tr_major").show();
					 }
					 $("#pagination").show();
				}else {
					$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			}).init();
		}
	}
	
	module.exports = graduationStatistics; // 根据文件名称一致
	window.graduatingRoster = graduationStatistics; // 根据文件名称一致
});