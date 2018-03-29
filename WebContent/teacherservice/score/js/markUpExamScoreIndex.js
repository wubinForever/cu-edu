/**
 * 补考成绩录入
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
    var markupScoreSet; // 课程/补考成绩录入相关设置表（包括构成、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组

    var markUpExamScoreIndex = {
    		// 主页面初始化
    		init : function() {
    			// 加载当前学年学期
    			simpleSelect.loadCommonSmester("studySemester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
    			
    			// 绑定开课单位下拉框
    			simpleSelect.loadSelect("openDepartmentId",
    					url.GET_START_CLASS_DEPARTMENT_SELECT_LIST, {
    						studySemester:$("#studySemester").val(),
    						isAuthority : false  // 不用进行数据权限过滤
    					}, {
    						firstText : dataConstant.SELECT_ALL, // 全部
    						firstValue : dataConstant.EMPTY,
    						async : false,
    						length:12
    					});
    			
    			//开课单位：取成绩管理中设置的课程录入人为当前登录人的课程，对应的开课单位
    			$("#studySemester").change(function(){
    				// 绑定开课单位下拉框
        			simpleSelect.loadSelect("openDepartmentId",
        					url.GET_START_CLASS_DEPARTMENT_SELECT_LIST, {
        						studySemester:$("#studySemester").val(),
        						isAuthority : false  // 不用进行数据权限过滤
        					}, {
        						firstText : dataConstant.SELECT_ALL, // 全部
        						firstValue : dataConstant.EMPTY,
        						async : false,
        						length:12
        					});
    			});    			
    			
    			markUpExamScoreIndex.bindIndexList();
    			// 查询
    			$('#btnSearch').click(function() {
    				markUpExamScoreIndex.bindIndexList();
    			});	
    			
    			// 录入
    			$(document).on("click", "[name='entry']", function() {
    				markUpExamScoreIndex.popEntry(this);
    			});
    			
    			// 查看
    			$(document).on("click", "[name='view']", function() {
    				markUpExamScoreIndex.popView(this);
    			});
            }, 
            
          //绑定主页面列表
    		bindIndexList:function(){
    			//var studySemester =$("#studySemester").val();
    			var queryParams=utils.getQueryParamsByFormId("queryForm");
    			//获取列表数据
    			ajaxData.request(url.GET_MARKUP_SCORE_FOR_TEACH_LIST, queryParams, function(data) {
    				if (data.code == config.RSP_SUCCESS) {
    					if(data.data && data.data.length>0 ){
    						$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data.data));
    															
    					}else{
    						$("#tbodycontent").empty().append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");
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
			var optionHTML=markUpExamScoreIndex.getSemester();
			popup.data("optionHTML",optionHTML);
			popup.setData("markUpExamScoreIndex", this);
			var me = this;
			
			//判断是否在录入时间段
			var queryParams={};
			queryParams.academicYear=$(obj).attr("academicYear");
			queryParams.semesterCode=$(obj).attr("semesterCode");
			queryParams.courseId=$(obj).attr("courseId");
			queryParams.isMarkUpExam=isMarkUpExam.Yes.value;			
			
			ajaxData.request(url.GET_SCORE_ENTRY_TIME_BY_PARAMETERS, queryParams, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if(data.data){						
						var currentTime=Date.parse(new Date()); //获取当前的时间戳 1280977330000 这里得到的结果将后三位（毫秒）转换成了000显示
						var beginTime=data.data.beginTime; //1514784566000 
						var endTime=data.data.endTime;
						if(beginTime<= currentTime && currentTime<=endTime ){
							
							markUpExamScoreIndex.markUpExamScoreEntryWindow=  popup.open('./teacherservice/score/html/markUpExamScoreEnterList.html',
								{
									id : 'markUpExamScoreEntry',// 唯一标识
									title : '补考成绩录入',// 这是标题
									width : 1200,// 这是弹窗宽度。其实可以不写
									height : 720,// 弹窗高度
									button:[{name:'保 存',callback:function(){
										
										var markUpExamScoreList = popup.getData("markUpExamScoreList");
										markUpExamScoreList.save(approvalStatus.TemporaryMemory.value);
										return false;
										
									}},
									{name:'关 闭',callback:function(){
										popup.askPop("确认关闭吗？",function(){
											me.markUpExamScoreEntryWindow.close();
										});
										return false;
									}},
									{name:'送 审',callback:function(){
										
										var markUpExamScoreList = popup.getData("markUpExamScoreList");
										markUpExamScoreList.review(approvalStatus.Submitted.value);
										return false;

									}}]
								});
						}else{
							var b=markUpExamScoreIndex.formatDate(new Date(beginTime));
							var e=markUpExamScoreIndex.formatDate(new Date(endTime));
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
		
		//获取大于等于查询条件中的学年学期的option
        getSemester:function(){
        	var selVal=$("#studySemester").val(); // 选中值
		    var options=[];
		    for(var i=0;i<$("#studySemester option").length;i++){
		    	var val=$("#studySemester").get(0).options[i].value;
		    	var txt=$("#studySemester").get(0).options[i].text;
		    	options.push('<option title="'+txt+'" value="'+val+'">'+txt+'</option>');
		    	if(val===selVal){
		    		break;
		    	}
		    }
		    return options.join('');
        },
		
		//查看弹窗
		popView: function(obj){				
			popup.data("obj",obj);//传值过去
			popup.setData("markUpExamScoreIndex", this);
			var me = this;
			this.markUpExamScoreEntryWindow= popup.open('./teacherservice/score/html/markUpExamScoreEnterView.html',
				{
					id : 'markUpExamScoreEntryView',// 唯一标识
					title : '补考成绩查看',// 这是标题
					width : 1200,// 这是弹窗宽度。其实可以不写
					height : 700,// 弹窗高度
					button:[
					{name:'关 闭',callback:function(){
						popup.askPop("确认关闭吗？",function(){
							me.markUpExamScoreEntryWindow.close();
						});
						return false;
					}}]
				});
		}
    }
    module.exports = markUpExamScoreIndex;
    window.markUpExamScoreIndex = markUpExamScoreIndex;
});