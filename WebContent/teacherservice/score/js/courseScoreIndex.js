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
    var isMarkUpExam=require("basePath/enumeration/score/IsMarkUpExam");
    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var courseSetJs=require("localPath/courseScoreSet");
    var courseScoreSet; // 课程/补考成绩录入相关设置表（包括构成、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组
    
    
    

    var courseScoreIndex = {
    	
    	//主页面列表
		init:function(){
			// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
			
			courseScoreIndex.bindIndexList();
			
			//学年学期变动，加载列表
			$("#semester").change(function(){
				courseScoreIndex.bindIndexList();
			});
			
			// 录入
			$(document).on("click", "[name='entry']", function() {
				courseScoreIndex.popEntry(this);
			});
			
			// 查看
			$(document).on("click", "[name='view']", function() {
				courseScoreIndex.popView(this);
			});
		},
		
		//绑定主页面列表
		bindIndexList:function(){
			var semester =$("#semester").val();				
			//获取列表数据
			ajaxData.request(url.GET_COURSE_SCORE_FOR_TEACH_LIST, {semester:semester}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if(data.data && data.data.length>0 ){
						$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data));
															
					}else{
						$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
					}
				}
			});
		},
		
		formatDate:function(now) { 
			var year=now.getFullYear(); 
			var month=now.getMonth()+1; 
			var date=now.getDate(); 
			var hour=now.getHours(); 
			var minute=now.getMinutes(); 
			//var second=now.getSeconds(); 
			return year+"-"+month+"-"+date+" "+hour+":"+minute;//+":"+second; 
		},		
		
		//录入弹窗
		popEntry: function(obj){	
			
			popup.data("obj",obj);//传值过去
			popup.setData("courseScoreIndex", this);
			var me = this;

			//判断是否在录入时间段
			var queryParams={};
			queryParams.academicYear=$(obj).attr("academicYear");
			queryParams.semesterCode=$(obj).attr("semesterCode");
			queryParams.courseId=$(obj).attr("courseId");
			queryParams.isMarkUpExam=isMarkUpExam.No.value;			
			
			ajaxData.request(url.GET_SCORE_ENTRY_TIME_BY_PARAMETERS, queryParams, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if(data.data){						
						var currentTime=Date.parse(new Date()); //获取当前的时间戳 1280977330000 这里得到的结果将后三位（毫秒）转换成了000显示
						var beginTime=data.data.beginTime; //1514784566000 
						var endTime=data.data.endTime;
						if(beginTime<= currentTime && currentTime<=endTime ){
							
							courseScoreIndex.courseScoreEntryWindow= popup.open('./teacherservice/score/html/courseScoreEnterList.html',
								{
									id : 'scoreEntry',// 唯一标识
									title : '录入课程成绩',// 这是标题
									width : 1200,// 这是弹窗宽度。其实可以不写
									height : 720,// 弹窗高度
									button:[{name:'保 存',callback:function(){
										
										var courseScoreList = popup.getData("courseScoreList");
										courseScoreList.save(approvalStatus.TemporaryMemory.value);
										return false;

									}},
									{name:'关 闭',callback:function(){
										popup.askPop("确认关闭吗？",function(){
											me.courseScoreEntryWindow.close();
										});
										return false;
									}},
									{name:'送 审',callback:function(){
										
										var courseScoreList = popup.getData("courseScoreList");
										courseScoreList.review(approvalStatus.Submitted.value);
										return false;
									}}]
								});
						}else{
							var b=courseScoreIndex.formatDate(new Date(beginTime));
							var e=courseScoreIndex.formatDate(new Date(endTime));
							popup.warPop("不在录入时间内<br/>录入时间为："+b+"至"+e);
							return false;
						}															
					}else{
						popup.warPop("不在录入时间内，请咨询教务管理员");
						return false;
					}
				}
			});			
		},	
		
		//查看弹窗
		popView: function(obj){				
			popup.data("obj",obj);//传值过去
			popup.setData("courseScoreIndex", this);
			var me = this;
			this.courseScoreEntryWindow= popup.open('./teacherservice/score/html/courseScoreEnterView.html',
				{
					id : 'scoreEntryView',// 唯一标识
					title : '课程成绩查看',// 这是标题
					width : 1200,// 这是弹窗宽度。其实可以不写
					height : 720,// 弹窗高度
					button:[
					{name:'关 闭',callback:function(){
						popup.askPop("确认关闭吗？",function(){
							me.courseScoreEntryWindow.close();
						});
						return false;
					}}]
				});
		}
		
    }
    module.exports = courseScoreIndex;
    window.courseScoreIndex = courseScoreIndex;
});