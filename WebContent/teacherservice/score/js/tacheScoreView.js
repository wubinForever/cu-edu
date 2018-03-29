/**
 * 环节成绩录入
 */
define(function(require, exports, module) {	
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var dataConstant = require("configPath/data.constant");
    var url = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var pagination = require("basePath/utils/pagination");
    var urlTrainplan = require("basePath/config/url.trainplan");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var dataDictionary=require("configPath/data.dictionary");
    var importUtils = require("basePath/utils/importUtils"); //文件上传帮助
    var isEnabled=require("basePath/enumeration/common/IsEnabled");
    var vCourseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
    var approvalStatus=require("basePath/enumeration/score/ApprovalStatus"); 
    var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
    var urlstudent = require("configPath/url.studentarchives");// 学籍url
    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var tacheScoreJs = require("localPath/tacheScoreSet");
    var tacheScoreSet; // 课程/补考成绩录入相关设置表（包括分制、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组

    var tacheScoreView = {
    		
        // 初始化
        init : function() { 
        	
        	var obj = popup.data("obj");
        	$("#academicYear").val($(obj).attr("academicYear"));
			$("#semesterCode").val($(obj).attr("semesterCode"));
			$("#courseId").val($(obj).attr("courseId"));
			$("#classId").val($(obj).attr("classId"));	
			
			$("#courseInfo").val($(obj).attr("courseInfo"));	
			$("#className").val($(obj).attr("className"));	
			
			popup.setData("tacheScoreView",tacheScoreView);
			
        	tacheScoreView.getInitData();
			
            
        }, 
        
      //显示当前选中信息
        showCurrentSelectedInfo:function(){        	
        	var courseInfo=$("#courseInfo").val();
        	var className=$("#className").val();
		    $("#spanCourse").text("环节："+courseInfo);
		    $("#spanClass").text("行政班："+className);
		    $("#spanScoreSet").text("总评成绩分制：");    
		    $("#spanCourse").attr("title","环节："+courseInfo);
		    $("#spanClass").attr("title","行政班："+className);
		    $("#spanScoreSet").attr("title","总评成绩分制：");
		    
		    
        },
		
		/**
		 * 获取列表初始化数据
		 */
		getInitData:function(){	
			tacheScoreView.showCurrentSelectedInfo();
			var queryParams=utils.getQueryParamsByFormId("queryForm");
			if(queryParams.courseId==dataConstant.EMPTY){
				popup.warPop("请先选择环节");
				tacheScoreView.bindNoData();	
				return false;
			}
			else{				
				// 查询成绩分制
				ajaxData.contructor(false);
				ajaxData.request(url.GET_TACHE_SCORE_CONSTITUTE_BY_PARAMETERS, queryParams, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data && data.data.scoreRegimenName!=""){
							tacheScoreSet=data.data;
							$("#courseScoreSetId").val(tacheScoreSet.tacheScoreConstituteId); // 课程/补考成绩录入相关设置id
							$("#scoreRegimenId").val(tacheScoreSet.scoreRegimenId); // 分制id
							$("#scoreRegimenName").val(tacheScoreSet.scoreRegimenName); //分制名称
							
							var str=[];	
							str.push("总评成绩分制："+tacheScoreSet.scoreRegimenName);							
							$("#spanScoreSet").text(str.join('')); // 设置总评成绩分制
							$("#spanScoreSet").attr("title",str.join(''));
							
							//获取列表数据
							queryParams.isAuthority=false; // 进行数据权限过滤
							ajaxData.request(url.GET_TACHE_SCORE_LIST, queryParams, function(data) {
								if (data.code == config.RSP_SUCCESS) {
									if(data.data && data.data.length>0 ){
										tacheScoreSet["list"]=data.data;
										$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(tacheScoreSet));
																			
									}else{
										tacheScoreView.bindNoData();										
									}									
								} else {
									// 提示失败
									popup.errPop(data.msg);
									tacheScoreView.bindNoData();	
									return false;
								}				
							},true);							
						}
						else{
							$("#spanScoreSet").text("总评成绩：");
							if(data.data && data.data.allowModify === 0){
								popup.warPop("成绩分制未设置，请联系管理员！");
								tacheScoreView.bindNoData();
								$("#set").hide(); // 让分制链接隐藏
								return false;
							}else{
								popup.askPop("请先设置成绩分制",function(){
									//打开成绩分制页面
									tacheScoreJs.set(1); // 1点查询时进去，2 点设置成绩分制链接进去
								},function(){
									tacheScoreView.bindNoData();
								});
							}							
						}
					} else {
						// 提示失败
						popup.errPop(data.msg);
						tacheScoreView.bindNoData();	
						return false;
					}				
				});	
			}	
		},
		
		
		//没有数据时绑定暂无数据
		bindNoData:function(){
			$("#tbodycontent").empty().append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");
		}
		
		
		
		
		
		
		
		
		
		
		
		
    }
    module.exports = tacheScoreView;
    window.tacheScoreView = tacheScoreView;
});