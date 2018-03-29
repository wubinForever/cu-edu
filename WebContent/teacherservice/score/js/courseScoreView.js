/**
 * 课程成绩录入
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
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var dataDictionary=require("configPath/data.dictionary");
    var importUtils = require("basePath/utils/importUtils"); //文件上传帮助
    var isEnabled=require("basePath/enumeration/common/IsEnabled");
    var vCourseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
    var approvalStatus=require("basePath/enumeration/score/ApprovalStatus"); 
    var scoreType=require("basePath/enumeration/score/ScoreType");
    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var courseSetJs=require("localPath/courseScoreSet");
    var courseScoreSet; // 课程/补考成绩录入相关设置表（包括构成、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组

    var courseScoreView = { 
    		
        // 初始化
        init : function() {        	
        	var obj = popup.data("obj");
        	$("#academicYear").val($(obj).attr("academicYear"));
			$("#semesterCode").val($(obj).attr("semesterCode"));
			$("#courseId").val($(obj).attr("courseId"));
			$("#theoreticalTaskId").val($(obj).attr("theoreticalTaskId"));
			
			$("#courseInfo").val($(obj).attr("courseInfo"));
			$("#teachingClassNo").val($(obj).attr("teachingClassNo"));
			
			popup.setData("courseScoreView",courseScoreView);
			
        	courseScoreView.getInitData();
			
            
        }, 
        
       
        
        //显示当前选中信息
        showCurrentSelectedInfo:function(){   
        	var courseInfo=$("#courseInfo").val();
        	var teachingClassNo=$("#teachingClassNo").val();
		    $("#spanCourse").text("课程："+courseInfo);			    		   
			$("#spanTeachingClassNo").text("教学班号："+teachingClassNo);					
			
			$("#spanCourse").attr("title","课程："+courseInfo);
			$("#spanTeachingClassNo").attr("title","教学班号："+teachingClassNo);
			
			
        },
        
        
		
		/**
		 * 获取列表初始化数据
		 */
		getInitData:function(){
			courseScoreView.showCurrentSelectedInfo();		
			var queryParams=utils.getQueryParamsByFormId("queryForm");
			if(queryParams.theoreticalTaskId==dataConstant.EMPTY){
				popup.warPop("请先选择教学班号");
				courseScoreView.bindNoData();
				return false;
			}
			else{				
				// 查询成绩构成
				queryParams.classId=queryParams.theoreticalTaskId;				
				queryParams.scoreType=scoreType.FirstTest.value; //首考
				ajaxData.contructor(false);
				ajaxData.request(url.GET_COURSE_SCORE_SET_BY_PARAMETERS, queryParams, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data && data.data.scoreRegimenName!="" ){
							courseScoreSet=data.data;
							$("#courseScoreSetId").val(courseScoreSet.courseScoreSetId); // 课程/补考成绩录入相关设置id
							$("#scoreRegimenId").val(courseScoreSet.scoreRegimenId); // 分制id
							$("#scoreRegimenName").val(courseScoreSet.scoreRegimenName); //分制名称
							var desc="";
							if(courseScoreSet.scoreRegimenName===dataConstant.HANDROD_CREDIT_NAME){ // 百分制
								var str=[];
								var flag=false; // 标识 平时成绩、期中成绩、期末成绩、技能成绩 至少有一项，默认没有一项
								if(courseScoreSet.usualRatio!=null){	
									flag=true;
									str.push("平时成绩"+parseInt(courseScoreSet.usualRatio)+"%");
								}
								if(courseScoreSet.midtermRatio!=null){
									flag=true;
									str.push("期中成绩"+parseInt(courseScoreSet.midtermRatio)+"%");
								}
								if(courseScoreSet.endtermRatio!=null){	
									flag=true;
									str.push("期末成绩"+parseInt(courseScoreSet.endtermRatio)+"%");
								}
								if(courseScoreSet.skillRatio!=null){
									flag=true;
									str.push("技能成绩"+parseInt(courseScoreSet.skillRatio)+"%");
								}
								if(flag){
									desc="总评成绩（百分制）："+str.join('+');
								}else{
									desc="总评成绩（百分制）：只录入总评成绩";
								}
							}else{ // 等级制
								desc="总评成绩："+courseScoreSet.scoreRegimenName;
							}							
							$("#spanScoreSet").text(desc);
							$("#spanScoreSet").attr("title",desc);
							$("#tbodytitle").empty().append($("#bodyTitleImpl").tmpl(data.data)); // 设置动态表头
							
							//获取列表数据
							queryParams.isAuthority=false; // 不进行数据权限过滤
							ajaxData.request(url.GET_COURSE_SCORE_ENTRY_LIST, queryParams, function(data) {
								if (data.code == config.RSP_SUCCESS) {
									if(data.data && data.data.length>0 ){
										courseScoreSet["list"]=data.data;
										$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(courseScoreSet));
										
																			
									}else{
										courseScoreView.bindNoData();
									}		
								} else {
									// 提示失败
									popup.errPop(data.msg);
									courseScoreView.bindNoData();
									return false;
								}				
							},true);							
						}
						else{
							$("#spanScoreSet").text("总评成绩：");
							if(data.data && data.data.allowModify === 0){
								popup.warPop("成绩构成未设置，请联系管理员！");
								courseScoreView.bindNoData();
								$("#set").hide(); // 让构成链接隐藏
								return false;
							}else{
								popup.askPop("请先设置成绩分制",function(){
									//打开成绩构成页面
									//调用后台，判断是否可以进行修改
									courseSetJs.set(1);  // 1点查询时进去，2 点设置成绩构成链接进去
									//courseScoreView.set();
								},function(){
									courseScoreView.bindNoData();
								});
							}							
						}
					} else {
						// 提示失败
						popup.errPop(data.msg);
						courseScoreView.bindNoData();
						return false;
					}				
				});	
			}	
		},
		
		
		
		//没有数据时绑定暂无数据
		bindNoData:function(){
			$("#tbodycontent").empty().append("<tr><td colspan='10'></td></tr>").addClass("no-data-html");
		}
		
    }
    module.exports = courseScoreView;
    window.courseScoreView = courseScoreView;
});