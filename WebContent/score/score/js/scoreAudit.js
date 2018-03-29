/**
 * 成绩审核
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
    var helper = require("basePath/utils/tmpl.helper");

    /**
     * 成绩审核
     */
    var scoreAudit = {
        // 初始化
        init : function() {
        	
        	var param = {};
        	param.academicYear = popup.data("academicYear");
        	param.semesterCode = popup.data("semesterCode");
        	param.courseId = popup.data("courseId");
        	param.entryUser = popup.data("entryUserId");
        	param.entryType = popup.data("entryTypeId");
        	param.isModify = popup.data("isModify");
        	
        	var userNameOrNo = popup.data("userNameOrNo");
        	var entryType = popup.data("entryType");
        	var courseNameOrNo = popup.data("courseNameOrNo");
        	
        	$("#courseNameOrNo").text(courseNameOrNo);
        	$("#entryType").text(entryType);
        	$("#userNameOrNo").text(userNameOrNo);
			
        	/*var reqData ={scoreApprovalId:combinationId};*/
        	
			ajaxData.contructor(false);
		    ajaxData.request(urlScore.GET_SCORE_APPROVAL_DETAILLIST,param,function(data){
		    	if(data.code==config.RSP_SUCCESS){
		    		if(data.data && data.data.length != 0){
						 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data,helper));
					 }else{
						 $("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 }
		    	}
		    });
        }
    }
    module.exports = scoreAudit;
    window.scoreAudit = scoreAudit;
});