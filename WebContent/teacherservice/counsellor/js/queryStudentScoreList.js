/**
 * 课程成绩录入
 */
define(function(require, exports, module) {	
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var dataConstant = require("configPath/data.constant");
    var urlScore = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
	var urlTeacher = require("basePath/config/url.teacherservice");// 教师服务url
    var pagination = require("basePath/utils/pagination");
    var popup = require("basePath/utils/popup");
    var common = require("basePath/utils/common");
    var ve = require("basePath/utils/validateExtend");
    var dataDictionary=require("configPath/data.dictionary");
    var importUtils = require("basePath/utils/importUtils"); //文件上传帮助
    var isEnabled=require("basePath/enumeration/common/IsEnabled");
    var vCourseOrTache=require("basePath/enumeration/trainplan/CourseOrTache");
    var approvalStatus=require("basePath/enumeration/score/ApprovalStatus"); 
	var CourseOrTacheEnum = require("basePath/enumeration/trainplan/CourseOrTache");
    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var courseScoreSet; // 课程/补考成绩录入相关设置表（包括构成、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组

    var scoreStatistics;//成绩统计
    var queryStudentScoreList = {
        // 初始化
        init : function() {
        	//学年学期 默认当前学年学期
			var semester = simpleSelect.loadCommonSmester("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "");
		    this.semester = semester;
		    var  academicYearSemester = $("#academicYearSemesterSelect").val();
		    //班级
		    simpleSelect.loadSelect("classSelect",urlTeacher.TEACHER_GET_CLASSINFO_ALL,{academicYearSemester : academicYearSemester},{firstText : "全部",firstValue : "",async:false});
		   
		    //学年学期联动班级
		    $("#academicYearSemesterSelect").change(function(){
	        	 var academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
				 var semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
	             simpleSelect.loadSelect("classSelect",urlTeacher.TEACHER_GETCLASSINFOINSCHOOL,{academicYear:academicYear,semesterCode:semesterCode},{async:false});
			});
			
			// 查询
			$('#btnSearch').click(function() {
				queryStudentScoreList.loadTacheScoreList();
				
			});	
			//绑定导出
			$(document).on("click", "#import", function() {
				var param = {
						academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
						semesterCode:$("#academicYearSemesterSelect").val().split("_")[1],
						classId:$("#classSelect").val(),
						course : $("#courseId").val()
					}
				ajaxData.exportFile(urlScore.EXPORT_STUDENT_SCORE,param);
			});
			queryStudentScoreList.loadTacheScoreList();
        }, 
        /**
		 * 加载成绩
		 */
		loadTacheScoreList:function(){
//			var course = $("#courseOrLinkSelect").val()
			var param = {
				academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
				semesterCode:$("#academicYearSemesterSelect").val().split("_")[1],
				classId:$("#classSelect").val(),
				course : $("#courseId").val()
			}
			ajaxData.request(urlScore.GET_CLASSSCORE_LIST, param, function(resData) {
				if (resData.code == config.RSP_SUCCESS) {
					 if(resData.data.length > 0){
                            $("#tbodycontent").parent().removeClass("nodatatable")
						    $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(resData.data)).removeClass("no-data-html");
						    queryStudentScoreList.calculation(resData.data);	
					 }else {
                             $("#tbodycontent").parent().addClass("nodatatable")
							 $("#tbodycontent").empty().append("<tr style='height:100%;'><td class='no-data-html'></td></tr>");
							 $("#ttotalbodycontent").empty().addClass("no-data-html");
							 $("#average").html("");
							 $("#passRate").html("");
						 }
				}
			},true);
		},
        /**
		 * 统计学生人数占比
		 */
		calculation:function(data){
			  var excellent=0;
			    var good=0;
			    var secondary=0;
			    var pass=0;
			    var fail=0;
			    var special1=0;//缓考
			    var special2=0;//缺考
			    var special3=0;//舞弊
			    var totalScore=0;
			   $.each(data,function(index,item){
				   var score=parseFloat(item.finalPercentageScore);
				   totalScore+=score;
				   if(100>=score&score>=90){
					   excellent++;
				   }
				   else if(90>score&score>=80){
					   good++;
				   }
				   else if(80>score&score>=70){
					   secondary++;
				   }
				   else if(70>score&score>=60){
					   pass++;
				   }
				   else if(60>score){
					   fail++;
				   }
				   if(item.specialCaseName=="缓考"){
					   special1++;
				   }
				   else if(item.specialCaseName=="缺考"){
					   special2++;
				   }
				   else if(item.specialCaseName=="舞弊"){
					   special3++;
				   }
			   }); 
			   var calculationData=[];
			   var personNum={name:'人数',excellent:excellent,good:good,secondary:secondary,pass:pass,fail:fail,special1:special1,special2:special2,special3:special3};
			   calculationData.push(personNum);
			   var percentRow={name:'百分比',excellent:Math.round((excellent/data.length)*100*100)/100+"%",
					   good:Math.round(good/data.length*100*100)/100+"%",
					   secondary:Math.round(secondary/data.length*100*100)/100+"%",
					   pass:Math.round(pass/data.length*100*100)/100+"%",
					   fail:Math.round(fail/data.length*100*100)/100+"%",
					   special1:Math.round(special1/data.length*100*100)/100+"%",
					   special2:Math.round(special2/data.length*100*100)/100+"%",
					   special3:Math.round(special3/data.length*100*100)/100+"%"};
			   calculationData.push(percentRow);
			   $("#ttotalbodycontent").empty().append($("#ttotalbodycontentImpl").tmpl(calculationData)).removeClass("no-data-html");
			   
//			   $("#excellent").html(excellent);
//			   $("#good").html(good);
//			   $("#secondary").html(secondary);
//			   $("#pass").html(pass);
//			   $("#fail").html(fail);
//			   $("#special1").html(special1);
//			   $("#special2").html(special2);
//			   $("#special3").html(special3);
//			   
//			   $("#excellentPercent").html(Math.round((excellent/data.length)*100*100)/100+"%");
//			   $("#goodPercent").html(Math.round(good/data.length*100*100)/100+"%");
//			   $("#secondaryPercent").html(Math.round(secondary/data.length*100*100)/100+"%");
//			   $("#passPercent").html(Math.round(pass/data.length*100*100)/100+"%");
//			   $("#failPercent").html(Math.round(fail/data.length*100*100)/100+"%");
//			   $("#special1Percent").html(Math.round(special1/data.length*100*100)/100+"%");
//			   $("#special2Percent").html(Math.round(special2/data.length*100*100)/100+"%");
//			   $("#special3Percent").html(Math.round(special3/data.length*100*100)/100+"%");
			   $("#average").html(Math.round(totalScore/data.length*100)/100);
			   $("#passRate").html(Math.round((excellent+good+secondary+pass)/data.length*100*100)/100+"%");
		},
 
		
		
    }
    module.exports = queryStudentScoreList;
    window.queryStudentScoreList = queryStudentScoreList;
});