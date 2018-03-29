/**
 * 成绩发布
 */
define(function(require, exports, module) {
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var url = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var dataConsTant = require("configPath/data.constant");
    var pagination = require("basePath/utils/pagination");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
	var urlTrainPlan = require("basePath/config/url.trainplan");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var enableChanges = require("basePath/enumeration/score/EnableChanges");
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
	var helper = require("basePath/utils/tmpl.helper");
	
    /**
     * 成绩发布
     */
    var scoreRelease = {
        
		init:function(){
			//初始化成绩发布列表
			scoreRelease.getScoreRealeaseList();
			//发布成绩
			$(document).on("click","button[name='release']",function(){
				scoreRelease.releaseScore(this,1);
			})
			//取消发布
			$(document).on("click","button[name='cancel']",function(){
				scoreRelease.releaseScore(this,0);
			})
        },
    
        //发布成绩    
        releaseScore:function(obj,flag){
        	var reqData = {};
        	var semesterCode = $(obj).attr("semesterCode");
        	var academicYear = $(obj).attr("academicYear");
        	var releaseTimeId = $(obj).attr("releaseTimeId");      
        	reqData.semesterCode = semesterCode;
        	reqData.academicYear = academicYear;
        	reqData.releaseTimeId = releaseTimeId;
        	reqData.releaseStatus = flag;
        	
        	popup.askPop(flag==1?"确定发布此学期成绩吗？":"确定取消发布此学期成绩吗？",function(){
				ajaxData.contructor(false);
			    ajaxData.request(url.SAVE_RELEASE_SCORE,reqData,function(data){
			    	if(data.code==config.RSP_SUCCESS)
			    	{
			    		scoreRelease.getScoreRealeaseList();
					}
				});
		   });
        },
        //初始化成绩发布列表
        getScoreRealeaseList:function(){
			ajaxData.contructor(false);
			ajaxData.request(url.GET_SCORE_RELEASE_TIME_LIST, null, function(data) {
					 if(data.data && data.data.length != 0){
						 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data,helper));
					 }else 
					 {
						$("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 }
			});
        }
    
    }
    module.exports = scoreRelease;
    window.scoreRelease = scoreRelease;
});