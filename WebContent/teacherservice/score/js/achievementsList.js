/**
 * 查询班级课表
 */
define(function(require, exports, module) {
	/**
	 * 导入JS
	 */
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var utils = require("basePath/utils/utils");
	var popup = require("basePath/utils/popup");
	// 下拉框
	var simpleSelect = require("basePath/module/select.simple");
	// URL
	var urlTeacher = require("basePath/config/url.teacherservice");// 教师服务url
	var urlData = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var urlScore = require("configPath/url.score");

	var CourseOrTacheEnum = require("basePath/enumeration/trainplan/CourseOrTache");
    var type = CourseOrTacheEnum.Course.value;
    var achievementsConsist = {};
    var onlyEntryTotalScore;
	var achievementsList = {
		// 初始化
		init : function() {
			//学年学期 默认当前学年学期
			simpleSelect.loadCommonSmester("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "");
		    var academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
		    var semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
		    $(".semesterName").text($("#academicYearSemesterSelect").find("option:selected").attr("title"))
		    //课程/环节
		    achievementsList.loadArrangeClass();
		     //加载列表
		     if($("#tip-box").is(":hidden")){
	            if(type == CourseOrTacheEnum.Course.value){
			    	$(".link-box").hide();  
	                $(".course-box").show();
	                 //加载学校
			        achievementsList.loadSchool();
			        //加载成绩构成
			        achievementsList.loadCourseScore();
	                achievementsList.loadCourseList();

			    }else{
			    	$(".link-box").show();  
	                $(".course-box").hide();
	                //加载学校
			        achievementsList.loadSchool();
	                achievementsList.loadRollList();
			    }
		     }
		    
		    //学年学期联动课程
		    $("#academicYearSemesterSelect").change(function(){
		    	achievementsList.loadArrangeClass();
			});

			//课程联动教学班/环节联动行政班
		    $("#courseOrLinkSelect").change(function(){
		    	 academicYear = $("#academicYearSemesterSelect").val().split("_")[0];
		    	 semesterCode = $("#academicYearSemesterSelect").val().split("_")[1];
	              var courseSelect = $("#courseOrLinkSelect").val();
	              type = courseSelect.substr(courseSelect.length-1,1)
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

			//查询
			$("#query").on("click",function(){
			    //加载列表
			   if($("#tip-box").is(":hidden")){
			   	    $(".semesterName").text($("#academicYearSemesterSelect").find("option:selected").attr("title"))
				   	if(type == CourseOrTacheEnum.Course.value){
				    	$(".link-box").hide();  
	                    $(".course-box").show();
	                     //加载学校
				        achievementsList.loadSchool();
				        //加载成绩构成
				        achievementsList.loadCourseScore();
	                    achievementsList.loadCourseList();

				    }else{
				    	$(".link-box").show();  
	                    $(".course-box").hide();
	                    //加载学校
				        achievementsList.loadSchool();
	                    achievementsList.loadRollList();
				    }
			   }
			    
			});

			//打印
			$("#print").click(function(){
				achievementsList.print();
			});
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
			ajaxData.request(urlTeacher.TEACHER_ARRANGE_GET_COURSEPRACTICE_SELECT, param, function(resData) {
				if (resData.code === config.RSP_SUCCESS && resData.data && resData.data.length > 0) {
                   //加载课程/环节
				   simpleSelect.installOption($("#courseOrLinkSelect"),resData.data,"","","",{length:17});
				   var courseSelect = $("#courseOrLinkSelect").val();
				   //判断是理论课程还是环节
				   type = courseSelect.substr(courseSelect.length-1,1)
				   //加载学校
				   achievementsList.loadSchool();
				   if(type == CourseOrTacheEnum.Course.value){
	              	 $("#teachingClassBox").show();
	              	 $("#administrativeClassBox").hide();
                     simpleSelect.loadSelect("teachingClassSelect",urlTeacher.TEACHER_ARRANGE_GET_CLASS_SELECT,{academicYear : academicYear,semesterCode : semesterCode,courseSelect : courseSelect},{async:false});
	              }else{
	              	 $("#teachingClassBox").hide();
	              	 $("#administrativeClassBox").show();
                     simpleSelect.loadSelect("administrativeClassSelect",urlTeacher.TEACHER_ARRANGE_GET_CLASS_SELECT,{academicYear : academicYear,semesterCode : semesterCode,courseSelect : courseSelect},{async:false});
	              }
	              $("#tip-box").hide();
				} else {
				   $("#courseOrLinkSelect").text("");
				   $("#teachingClassSelect").text("");
				   $("#administrativeClassSelect").text("");
				   $("#boxbody").hide();
				   $("#tip-box").show();
				   $("#print").prop("disabled",true).removeClass("btn-success");
				}
			});
        },
        /**
		 * 加载学校信息
		 */
		loadSchool:function(){
			ajaxData.contructor(false);
			ajaxData.request(urlData.SCHOOL_GET, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					 if(type == CourseOrTacheEnum.Course.value){
                        $(".course-box .schoolName").text(data.data.schoolName+"理论课程成绩登记册");
					 }else{
                        $(".link-box .schoolName").text(data.data.schoolName+"实践环节成绩登记册");
					 }
				}
			});	
		},
		/**
		 * 加载成绩构成
		 */
		loadCourseScore:function(){
			var param = {
				academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
				semesterCode:$("#academicYearSemesterSelect").val().split("_")[1],
				courseId:$("#courseOrLinkSelect").val().split('_')[0],
				classId :$("#teachingClassSelect").val()
			}
			ajaxData.contructor(false);
			ajaxData.request(urlScore.GET_COURSE_SCORE_GETITEM,param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
                    var resData = data.data;
                    onlyEntryTotalScore = resData.onlyEntryTotalScore;
                    achievementsConsist = resData;
                    $("#scoreType").text(resData.scoreRegimenName||"");
                    if(onlyEntryTotalScore >0){
                       $(".course-box #score").text('只录入总评成绩');
                    }else{
						if(resData.usualRatio){
							usualRatio = "平时成绩"+resData.usualRatio+"%";
						}else{
							usualRatio = "平时成绩0%";
						}
						
						if(resData.midtermRatio){
							midtermRatio = "+期中成绩"+resData.midtermRatio+"%";
						}else{
							midtermRatio = "+期中成绩0%";
						}
						
	                    if(resData.endtermRatio){
	                     	endtermRatio = "+期末成绩"+resData.endtermRatio+"%";
	                    }else{
							endtermRatio ="+期末成绩0%";
						}

						if(resData.skillRatio){
							skillRatio = "+技能成绩"+resData.skillRatio+"%";
						}else{
							skillRatio ="+技能成绩0%";
						}
						
	                    
	                    $(".course-box #score").text(usualRatio+""+midtermRatio+""+endtermRatio+""+skillRatio);
	                }
				}
			});	
		},
		/**
		 * 加载理论课程成绩登记册
		 */
		loadCourseList:function(){
			var param = {
				academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
				semesterCode:$("#academicYearSemesterSelect").val().split("_")[1],
				theoreticalTaskId:$("#teachingClassSelect").val(),
				orderBy:1//排序
			}
			ajaxData.request(urlTeacher.TEACHER_GET_STUDENTBYTEACHINGCLASS, param, function(resData) {
				if (resData.code == config.RSP_SUCCESS) {
					for(var i =0;i<resData.data.length;i++){
						resData.data[i] = $.extend(resData.data[i], achievementsConsist);
					}
                     if(resData.data.length > 0){
                     	$("#boxbody").show();
				        $("#tip-box").hide();
				        $("#print").prop("disabled",false).addClass("btn-success");
				        $(".course-box #course").text($("#courseOrLinkSelect").find("option:selected").attr("title"));
					    $(".course-box #teacher").text("[" + window.top.USER.accountName + "]"+window.top.USER.userName);
					    $(".course-box #class").text($("#teachingClassSelect").find("option:selected").text());
				        $(".course-box #count").text(resData.data.length);
				        for(var i in resData.data){
				        	resData.data[i].onlyEntryTotalScore = onlyEntryTotalScore;
				        }
					    $("#tbodycontentonet").empty().append($("#bodyContentImplOne").tmpl(resData.data)).removeClass("no-data-html");
					 }else {
					 	$("#boxbody").show();
				        $("#tip-box").hide();
				        $("#print").prop("disabled",false).addClass("btn-success");
				        $(".course-box #course").text($("#courseOrLinkSelect").find("option:selected").attr("title"));
					    $(".course-box #teacher").text("[" + window.top.USER.accountName + "]"+window.top.USER.userName);
					    $(".course-box #class").text($("#teachingClassSelect").find("option:selected").text());
				        $(".course-box #count").text(resData.data.length);
						$("#tbodycontentonet").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
					 }
				}
			},true);
		},
		/**
		 * 加载环节成绩登记册
		 */
		loadRollList:function(){
			var course = $("#courseOrLinkSelect").val()
			var param = {
				academicYear:$("#academicYearSemesterSelect").val().split("_")[0],
				semesterCode:$("#academicYearSemesterSelect").val().split("_")[1],
				classId:$("#administrativeClassSelect").val(),
				courseId:course.split('_')[0]
			}
			// 详细信息
			ajaxData.request(urlTeacher.TEACHER_SCORE_GET_TACHESCOREREGISTERLIST, param, function(resData) {
				if (resData.code == config.RSP_SUCCESS) {
                     var titleData = resData.data[0];
                     if (titleData){
					 	$("#boxbody").show();
				        $("#tip-box").hide();
				        $("#print").prop("disabled",false).addClass("btn-success");
				        $(".link-box #roll").text($("#courseOrLinkSelect").find("option:selected").attr("title"));
					    $(".link-box #grade").text(titleData.grade+"级");
					    $(".link-box #department").text(titleData.departmentName);
					    $(".link-box #class").text(titleData.className);
					    $(".link-box #teacher").text("[" + window.top.USER.accountName + "]"+window.top.USER.userName);				       
				        $(".link-box #score").text(titleData.scoreRegimenName||"");                    	 
                     }
				}
			},true);
			// 列表
			ajaxData.request(urlTeacher.TEACHER_SCORE_GET_PRACTICETEACHINGTASKCLASS, param, function(resData) {
				if (resData.code == config.RSP_SUCCESS) {
					 var dataList = resData.data;
                     if(dataList && dataList.length > 0){
                    	$(".link-box #count").text(dataList.length);
					    $("#tbodycontenttwot").empty().append($("#bodyContentImplTwo").tmpl(dataList)).removeClass("no-data-html");
					 }else {
						 $(".link-box #count").text("");
						$("#tbodycontenttwot").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
					 }
				}
			},true);
		},
		/**
		 * 打印
		 */
		print : function(){
		   $("#boxbody").jqprint();
	    }
	}

	module.exports = achievementsList; 
	window.achievementsList = achievementsList;
});