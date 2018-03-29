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
    var queryList = {
        // 初始化
        init : function() {
        	$("#tacheDiv").hide();
            $("#courseDiv").show();
            $("#teachingClassBox").show();
         	$("#administrativeClassBox").hide();
        	//学年学期 默认当前学年学期
			simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemesterSelect"));
		    var academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
		    var semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
		    //课程/环节
		    queryList.loadArrangeClass();
		    //学年学期联动课程
		    $("#academicYearSemesterSelect").change(function(){
		    	queryList.loadArrangeClass();
			});
		    //加载学校
			   queryList.loadSchool();
			  $(".semesterName").html($("#academicYearSemesterSelect").find("option:selected").text()); 
			//课程联动教学班/环节联动行政班
		    $("#courseOrLinkSelect").change(function(){
		    	 academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
		    	 semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
	              var courseSelect = $("#courseOrLinkSelect").val();
	             var type = courseSelect.substr(courseSelect.length-1,1)
	              if(type==CourseOrTacheEnum.Course.value){
	              	 $("#teachingClassBox").show();
	              	 $("#administrativeClassBox").hide();
                     simpleSelect.loadSelect("teachingClassSelect",urlTeacher.TEACHER_ARRANGE_GET_CLASS_SELECT,{academicYear : academicYear,semesterCode : semesterCode,courseSelect : courseSelect},{async:false});
	              }else{
	              	 $("#teachingClassBox").hide();
	              	 $("#administrativeClassBox").show();
                     simpleSelect.loadSelect("administrativeClassSelect",urlTeacher.TEACHER_ARRANGE_GET_CLASS_SELECT,{academicYear : academicYear,semesterCode : semesterCode,courseSelect : courseSelect},{async:false});
	              }
			});
		
			
			// 查询
			$('#btnSearch').click(function() {
				queryList.clear();
				queryList.search();
				
			});	
			queryList.search();
			//绑定导出
			$(document).on("click", "#import", function() {
				var courseSelect = $("#courseOrLinkSelect").val();
				 if(courseSelect){
	              var type = courseSelect.substr(courseSelect.length-1,1);
				  var param = { academicYear : $("#academicYearSemesterSelect").val().split("_")[0],
								semesterCode : $("#academicYearSemesterSelect").val().split("_")[1]
							   }
				if (type == CourseOrTacheEnum.Course.value) {
						param.theoreticalTaskId = $("#teachingClassSelect").val();
					} else {
						var course = $("#courseOrLinkSelect").val();
						param.classId = $("#administrativeClassSelect").val();
						param.courseId = course.split('_')[0];
					}
					ajaxData.exportFile(urlScore.EXPORT_CLASSSTUDENT_SCORE,param);
				} else {
					popup.warPop("请选择课程或环节！");
					$("#tbodycontent").empty().addClass("no-data-html");
					$("#tacheDiv").hide();
					$("#courseDiv").show();
				}
				
			});
        }, 
        search:function(){
        	 var courseSelect = $("#courseOrLinkSelect").val();
			 if(courseSelect){
				  $(".semesterName").html($("#academicYearSemesterSelect").find("option:selected").text()); 
              var type = courseSelect.substr(courseSelect.length-1,1);
              if(type==CourseOrTacheEnum.Course.value){
					$("#courseDiv").show();
					$("#tacheDiv").hide();
            	  queryList.loadCourseList();
              }else{
            		$("#tacheDiv").show();
            		$("#courseDiv").hide();
            	  queryList.loadTacheScoreList();
              }
			 }else{
				 popup.warPop("请选择课程或环节！");
				 $("#tbodycontent").empty().addClass("no-data-html");
				 $("#tacheDiv").hide();
                 $("#courseDiv").show();
			 }
        },
        clear:function(){
        	$("#course").html("");
            $("#teacher").html("");
            $("#class").html("");
            $("#count").html("");
            $("#tache").html("");
            $("#tacheTeacher").html("");
            $("#tacheClass").html("");
            $("#tacheCount").html("");
            $("#tbodycontent").empty().addClass("no-data-html");
        },
        /**
		 * 初始化加载课程,教学班
		 */
        loadArrangeClass:function(){
        	var academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
        	var semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
			var param = {
				academicYear:academicYear,
				semesterCode:semesterCode
			}
			ajaxData.contructor(false);
			ajaxData.request(urlTeacher.TEACHER_ARRANGE_GET_COURSEPRACTICE_SELECT, param, function(resData) {
				if (resData.code === config.RSP_SUCCESS && resData.data && resData.data.length > 0) {
                   //加载课程/环节
				   simpleSelect.installOption($("#courseOrLinkSelect"),resData.data,"","","","");
				   var courseSelect = $("#courseOrLinkSelect").val();
				   //判断是理论课程还是环节
				  var type = courseSelect.substr(courseSelect.length-1,1)
				  
				
				   if(type == CourseOrTacheEnum.Course.value){
	              	 $("#teachingClassBox").show();
	              	 $("#administrativeClassBox").hide();
                     simpleSelect.loadSelect("teachingClassSelect",urlTeacher.TEACHER_ARRANGE_GET_CLASS_SELECT,{academicYear : academicYear,semesterCode : semesterCode,courseSelect : courseSelect},{async:false});
	              }else{
	              	 $("#teachingClassBox").hide();
	              	 $("#administrativeClassBox").show();
                     simpleSelect.loadSelect("administrativeClassSelect",urlTeacher.TEACHER_ARRANGE_GET_CLASS_SELECT,{academicYear : academicYear,semesterCode : semesterCode,courseSelect : courseSelect},{async:false});
	              }
				} else {
				   $("#courseOrLinkSelect").html("");
				   $("#teachingClassSelect").html("");
				   $("#administrativeClassSelect").html("");
				}
			});
			
        },
        /**
		 * 加载理论课程成绩
		 */
		loadCourseList:function(){
			var param = {
				academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
				semesterCode:$("#academicYearSemesterSelect").val().split("_")[1],
				theoreticalTaskId:$("#teachingClassSelect").val()
			}
			ajaxData.contructor(false);
			ajaxData.request(urlScore.GET_TEACHINGSCORE, param, function(resData) {
				if (resData.code == config.RSP_SUCCESS) {
                     if(resData.data.length > 0){
                    	var semester= resData.data[0].academicYear+"-"+ (resData.data[0].academicYear+1) +"学年 "+resData.data[0].semesterCodeName;
                         $(".semesterName").html(semester);
                         $("#tacheDiv").hide();
                         $("#courseDiv").show();
                         $("#course").html("["+resData.data[0].courseNo+"]"+resData.data[0].courseName);
                         $("#teacher").html("["+resData.data[0].teacherNo+"]"+resData.data[0].teacherName);
                         $("#class").html(resData.data[0].teachingClassNo);
                         $("#count").html(resData.data.length);
					     $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(resData.data)).removeClass("no-data-html");
					     queryList.calculation(resData.data);
					 }else {
						$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
						$("#ttotalbodycontent").empty().addClass("no-data-html");
						 $("#average").html("");
						 $("#passRate").html("");
						 
					 }
				}
			},true);
		},
		/**
		 * 加载环节成绩
		 */
		loadTacheScoreList:function(){
			var course = $("#courseOrLinkSelect").val()
			var param = {
				academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
				semesterCode:$("#academicYearSemesterSelect").val().split("_")[1],
				classId:$("#administrativeClassSelect").val(),
				courseId:course.split('_')[0]
			}
			ajaxData.request(urlScore.GET_TACHESCORE_LIST, param, function(resData) {
				if (resData.code == config.RSP_SUCCESS) {
					 if(resData.data.length > 0){
	                    	var semester= resData.data[0].academicYear+"-"+ (resData.data[0].academicYear+1) +"学年 "+resData.data[0].semesterCodeName;
	                         $(".semesterName").html(semester);
	                         $("#tacheDiv").show();
	                         $("#courseDiv").hide();
	                         $("#tache").html("["+resData.data[0].courseNo+"]"+resData.data[0].courseName);
	                         $("#tacheTeacher").html("["+resData.data[0].teacherNo+"]"+resData.data[0].teacherName);
	                         $("#tacheClass").html(resData.data[0].className);
	                         $("#tacheCount").html(resData.data.length);
						    $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(resData.data)).removeClass("no-data-html");
						    queryList.calculation(resData.data);	
					 }else {
							$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
							 $("#ttotalbodycontent").empty().addClass("no-data-html");
							 $("#average").html("");
							 $("#passRate").html("");
						 }
				}
			},true);
		},
        /**
		 * 加载学校信息
		 */
		loadSchool:function(){
			ajaxData.contructor(false);
			ajaxData.request(urlData.SCHOOL_GET, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					console.log(data.data);
                        $(".schoolName").html(data.data.schoolName+"学生成绩");
                  
				}
			});	
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
    module.exports = queryList;
    window.queryList = queryList;
});