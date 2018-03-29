/**
 * 学生成绩查询
 */
define(function(require, exports, module) {
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var urlScore = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var pagination = require("basePath/utils/pagination");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var dataDictionary=require("configPath/data.dictionary");
    var dataConstant = require("configPath/data.constant");
    var simpleSelect = require("basePath/module/select.simple");
    var entryType = require("basePath/enumeration/score/EntryType");
    var CONSTANT = require("basePath/config/data.constant");// 公用常量 
    var urlTrainplan = require("basePath/config/url.trainplan");
    var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
    var urlStudentarchives = require("basePath/config/url.studentarchives");
    var courseOrTache = require("basePath/enumeration/trainplan/CourseOrTache");
    var helper = require("basePath/utils/tmpl.helper");
    var urlStudent = require("configPath/url.studentservice");// 学生服务url
    
    /**
     * 成绩查询-学生端
     */
    var scoreQueryByStudent = {
        // 初始化
        init : function() {
			
			//加载学年
			simpleSelect.loadSelect("academicYear",urlStudent.GET_ACADEMICYEAR,null, {firstText : "全部",firstValue : "",length:17});
			//加载学期
			simpleSelect.loadDataDictionary("semesterCode",dataDictionary.SEMESTER, null,"全部","");
			
			scoreQueryByStudent.getList();
            
            $("#query").click(function(){
            	scoreQueryByStudent.getList();
            });
            
            // 导出
			$("#export").click(function() {
				ajaxData.exportFile(urlScore.SCORE_QUERY_BY_STUDENT_EXPORT, utils.getQueryParamsByFormId("queryForm"));
			});
        },
        //查询数据
		getList:function(){
			//获取查询参数
			var requestParam = utils.getQueryParamsByFormId("queryForm");
			
			//查询数据
			ajaxData.contructor(false);
		    ajaxData.request(urlScore.SCORE_QUERY_BY_STUDENT,requestParam,function(data){
		    	if(data.code==config.RSP_SUCCESS){
		    		if(data && data.length != 0){
		    			if(data.data.scoreQueryByStudentList.length != 0){
		    				$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data.scoreQueryByStudentList));
		    				$("#statisticsContent").removeClass("no-data-html").empty().append($("#statisticsContentImpl").tmpl(data.data.studentScoreStatisticsList));
		    			}
		    			else{
		    				$("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
		    				$("#statisticsContent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
		    			}
					 }else{
						 $("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
						 $("#statisticsContent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 }
		    	}
		    });
		},
    }
    module.exports = scoreQueryByStudent;
    window.scoreAudit = scoreQueryByStudent;
});