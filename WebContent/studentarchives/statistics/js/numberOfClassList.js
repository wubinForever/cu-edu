/**
 * 按班级统计在校学生数
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */

	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var simpleSelect = require("basePath/module/select.simple");
	var urlData = require("basePath/config/url.data");
	var URL_DATA = require("basePath/config/url.data");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var dataDictionary = require("basePath/config/data.dictionary");
	var CONSTANT = require("basePath/config/data.constant");
	var base = config.base;
	/**
	 * 按班级统计在校学生数
	 */
	var numofclasslist = {
		// 初始化
		init : function() {

			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
			var academicYearSemesterChange = function(academicYearSemester){
				if(!academicYearSemester){
		    	   $("#grade").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
		    	   return;
				}
				
				var requestParames = {
					//学年
					academicYear: academicYearSemester.split("_")[0],
					//学期
					semesterCode: academicYearSemester.split("_")[1]
				};
				// 年级（从数据库获取数据）
				simpleSelect.loadSelect("grade", URL_STUDENTARCHIVES.ARCHIVESREGISTER_GETGRADESINSCHOOL,requestParames, {firstText : CONSTANT.SELECT_ALL,firstValue : ""});	
			}
			academicYearSemesterChange($("#academicYearSemesterSelect").val());
			$("#academicYearSemesterSelect").on("change", function(){
				academicYearSemesterChange($(this).val());
			});
			
			//培养层次
		    simpleSelect.loadDictionarySelect("trainingLevelCode",dataDictionary.ID_FOR_TRAINING_LEVEL, {firstText:"全部",firstValue:""});
			var gradeId = "", departmentId = "", majorId = "";
			
			ajaxData.contructor(false);
		    ajaxData.request(urlTrainplan.GRADEMAJOR_GRADELIST,null,function(data){
		    	if(data.code==config.RSP_SUCCESS){
		    		if(data.data.length != 0){
		    			gradeId = data.data[0].value;
		    		}
				}
			});

			numofclasslist.loadNumOfClassList();

			// 查询
			$("#query").click(function() {
				$("#semesterName").text($("#academicYearSemesterSelect").find("option:selected").text());
				numofclasslist.loadNumOfClassList();
			});
			
			//绑定导出
			$(document).on("click", "#export", function() {
				ajaxData.exportFile(URL_STUDENTARCHIVES.STUDENTNUMBEROFCLASS_EXPORT, numofclasslist.getQueryParams(true));
			});

			numofclasslist.initSchoolInfo();
			$("#semesterName").text($("#academicYearSemesterSelect").find("option:selected").text());
		},
		getQueryParams: function(getCachedParams){
			var params = $('#queryForm').data("data-query-params");
			if(!params || !getCachedParams){
				//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//学年
				requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
				//学年学期名称
				requestParam.academicYearSemesterName = $("#academicYearSemesterSelect").find("option:selected").text();
				//缓存查询参数
				$('#queryForm').data("data-query-params", requestParam);
				return requestParam;
			}
			return params;
		},
		/**
		 * 初始化学校数据
		 */
		initSchoolInfo:function(){
			ajaxData.request(urlData.SCHOOL_GET, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {					
					$("#schoolName").text(data.data.schoolName+"在校学生人数分布情况统计表");
				} else {
					return false;
				}				
			});
		},
        /**
		 * 加载在校学生人数(按照班级统计)
		 */
		loadNumOfClassList : function(){
         	var requestData = numofclasslist.getQueryParams();
         	
         	ajaxData.request(URL_STUDENTARCHIVES.STUDENTNUMBEROFCLASS_GETLIST,requestData,function(data){
         		if (data.code == config.RSP_SUCCESS) {
    				if (data.data.length > 0) {
    					$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
    					var wd = (100/(data.data.length))+"%";
    					$(".table-static").css("width",wd);
    				} else {
    					$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
    				}
    			}
			}, true);
		 }
	}
	module.exports = numofclasslist;
	window.numofclasslist = numofclasslist;
});
