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
    var isMarkUpExam=require("basePath/enumeration/score/IsMarkUpExam");
    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var tacheScoreJs = require("localPath/tacheScoreSet");
    var tacheScoreSet; // 课程/补考成绩录入相关设置表（包括分制、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组

    var tacheScoreIndex = {
    		//主页面列表
    		init:function(){
    			// 加载当前学年学期
    			simpleSelect.loadCommonSmester("semester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
    			
    			tacheScoreIndex.bindIndexList();
    			
    			//学年学期变动，加载列表
    			$("#semester").change(function(){
    				tacheScoreIndex.bindIndexList();
    			});
    			
    			// 录入
    			$(document).on("click", "[name='entry']", function() {
    				tacheScoreIndex.popEntry(this);
    			});
    			
    			// 查看
    			$(document).on("click", "[name='view']", function() {
    				tacheScoreIndex.popView(this);
    			});
    		},
    		
    		//绑定主页面列表
    		bindIndexList:function(){
    			var semester =$("#semester").val();				
    			//获取列表数据
    			ajaxData.request(url.GET_TACHE_SCORE_FOR_TEACH_LIST, {semester:semester}, function(data) {
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
			popup.setData("tacheScoreIndex", this);
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
							
							tacheScoreIndex.tacheScoreEntryWindow= popup.open('./teacherservice/score/html/tacheScoreEnterList.html',
								{
									id : 'tacheEntry',// 唯一标识
									title : '录入环节成绩',// 这是标题
									width : 1200,// 这是弹窗宽度。其实可以不写
									height : 720,// 弹窗高度
									button:[{name:'保 存',callback:function(){
										
										var tacheScoreList = popup.getData("tacheScoreList");
										tacheScoreList.save(approvalStatus.TemporaryMemory.value);
										return false;
									}},
									{name:'关 闭',callback:function(){
										popup.askPop("确认关闭吗？",function(){
											me.tacheScoreEntryWindow.close();
										});
										return false;
									}},
									{name:'送 审',callback:function(){
										
										var tacheScoreList = popup.getData("tacheScoreList");
										tacheScoreList.review(approvalStatus.Submitted.value);
										return false;
									}}]
								});
						}else{
							var b=tacheScoreIndex.formatDate(new Date(beginTime));
							var e=tacheScoreIndex.formatDate(new Date(endTime));
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
			popup.setData("tacheScoreIndex", this);
			var me = this;
			this.tacheScoreEntryWindow= popup.open('./teacherservice/score/html/tacheScoreEnterView.html',
				{
					id : 'tacheEntryView',// 唯一标识
					title : '环节成绩查看',// 这是标题
					width : 1200,// 这是弹窗宽度。其实可以不写
					height : 720,// 弹窗高度
					button:[
					{name:'关 闭',callback:function(){
						popup.askPop("确认关闭吗？",function(){
							me.tacheScoreEntryWindow.close();
						});
						return false;
					}}]
				});
		}
		
    }
    module.exports = tacheScoreIndex;
    window.tacheScoreIndex = tacheScoreIndex;
});