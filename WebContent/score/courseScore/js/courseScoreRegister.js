/**
 * 课程成绩登记册
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
	var importUtils = require("basePath/utils/importUtils"); //文件上传帮助
	var isEnabled = require("basePath/enumeration/common/IsEnabled");
	var courseOrTache = require("basePath/enumeration/trainplan/CourseOrTache");
	var isHaveExam = require("basePath/enumeration/score/IsHaveExam");
	var isMarkUpExam = require("basePath/enumeration/score/IsMarkUpExam");
	var setupStatus = require("basePath/enumeration/score/SetupStatus");
	var dataConstant = require("configPath/data.constant");
	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	
	/**
	 * 课程成绩登记册
	 */
	var courseScoreRegister = {
		// 初始化
		init : function() {
			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
			var academicYearSemesterChange = function(academicYearSemester){
				if(academicYearSemester){
					var requestParames = {
						//学年
						academicYear: academicYearSemester.split("_")[0],
						//学期
						semesterCode: academicYearSemester.split("_")[1]
					};
				}
			}
			academicYearSemesterChange($("#academicYearSemesterSelect").val());
			$("#academicYearSemesterSelect").on("change", function(){
				academicYearSemesterChange($(this).val());
			});
			
			// 绑定开课单位下拉框（从数据库获取数据）
			/*simpleSelect.loadSelect("openDepartmentId",urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, null,{firstText:"全部",firstValue:""});*/
			
			// 绑定开课单位下拉框
			simpleSelect.loadSelect("openDepartmentId",
					urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
						isAuthority : true
					}, {
						async : false,
						length:12
					});
			
			// 课程：下拉模糊查询
			var courseInfo = new select({
				dom : $("#courseDiv"),
				param : {
					departmentId : $("#openDepartmentId").val(),
					semester : $("#academicYearSemesterSelect").val()
				},
				loadData : function() {
					return [];
				},
				onclick : function(){
					var semester =$("#academicYearSemesterSelect").val();
					var openDepartmentId=$("#openDepartmentId").val();
				    var courseId=courseInfo.getValue();
				    $("#courseId").val(courseId);
				    if(courseId != dataConstant.EMPTY){ // 课程不为“全部”，则加载任课教师信息
				    	simpleSelect.loadSelect("teacherNoAndName",
				    			urlScore.GET_TEACHER_SELECT_LIST, {
									isAuthority : true,
									semester:semester,
									openDepartmentId:openDepartmentId,
									courseId:courseId								
								}, {
									firstText : dataConstant.SELECT_ALL, // 全部
									firstValue : dataConstant.EMPTY,
									async : true,
									length:15
								});	
				    }else{
				    	$("#teacherNoAndName").empty().append('<option value="">'+dataConstant.SELECT_ALL+'</option>');  // 任课教师
				    }
				    $("#theoreticalTaskId").empty().append('<option value="">'+dataConstant.SELECT_ALL+'</option>');  // 教学班号
				}
			}).init();
			
			this.courseInfoSelect = courseInfo;
			
			//先初始化再调
			courseScoreRegister.getData();
			//学年学期或者开课单位变动，加载课程
			$("#academicYearSemesterSelect,#openDepartmentId").change(function(){
				var semester =$("#academicYearSemesterSelect").val();
			    var openDepartmentId=$("#openDepartmentId").val();
			    if(openDepartmentId != dataConstant.EMPTY){ // 开课单位不为“全部”，则加载课程信息
			    	//courseInfo.reload(courseScoreRegister.getData(), "");
			    	courseScoreRegister.getData();
			    	$("#courseId").val("");
			    }
			    $("#teacherNoAndName").empty().append('<option value="">'+dataConstant.SELECT_ALL+'</option>');  // 任课教师
		    	$("#theoreticalTaskId").empty().append('<option value="">'+dataConstant.SELECT_ALL+'</option>');  // 教学班号
			});
			
			
			
			/*//课程变动，加载任课教师
			$("#courseDiv").change(function(){
				var semester =$("#academicYearSemesterSelect").val();
				var openDepartmentId=$("#openDepartmentId").val();
			    var courseId=courseInfo.getValue();
			    if(courseId != dataConstant.EMPTY){ // 课程不为“全部”，则加载任课教师信息
			    	simpleSelect.loadSelect("teacherNoAndName",
			    			urlScore.GET_TEACHER_SELECT_LIST, {
								isAuthority : true,
								semester:semester,
								openDepartmentId:openDepartmentId,
								courseId:courseId								
							}, {
								firstText : dataConstant.SELECT_ALL, // 全部
								firstValue : dataConstant.EMPTY,
								async : true,
								length:15
							});	
			    }else{
			    	$("#teacherNoAndName").empty().append('<option value="">'+dataConstant.SELECT_ALL+'</option>');  // 任课教师
			    }
			    $("#theoreticalTaskId").empty().append('<option value="">'+dataConstant.SELECT_ALL+'</option>');  // 教学班号
			});*/
			
			//任课教师变动，加载教学班号
			$("#teacherNoAndName").change(function(){
				var semester =$("#academicYearSemesterSelect").val();
				var openDepartmentId=$("#openDepartmentId").val();
			    var courseId=$("#courseId").val();
			    var teacherNoAndName=$("#teacherNoAndName").val();
			    if(teacherNoAndName != dataConstant.EMPTY){ // 任课教师不为“全部”，则加载任教学班号信息
			    	simpleSelect.loadSelect("theoreticalTaskId",
			    			urlScore.GET_THEORETICAL_TASK_SELECT_LIST, {
								isAuthority : true,
								semester:semester,
								openDepartmentId:openDepartmentId,
								courseId:courseId,	
								teacherNoAndName:teacherNoAndName								
							}, {
								firstText : dataConstant.SELECT_ALL, // 全部
								firstValue : dataConstant.EMPTY,
								async : true,
								length:15
							});
			    }else{
			    	$("#theoreticalTaskId").empty().append('<option value="">'+dataConstant.SELECT_ALL+'</option>');  // 教学班号
			    }			    
			});
			
			courseScoreRegister.getPagedList();
			
			//加载更多
			$('#btnLoadMore').click(function(){
				$("#noData").append("<div class='loading-back'></div>");
				$("#pageIndex").val(parseInt($("#pageIndex").val())+1);
				
				courseScoreRegister.getPagedList(true);
				if(parseInt($("#teachingClassSum").text()) == parseInt($("#pageIndex").val())+1){
					$("#btnLoadMore").attr('disabled',"true");
					$("#btnLoadMore").attr('class',"btn disabled");
				}
			});
			
			//查询
			$('#query').click(function() {
				$("#pageIndex").val(0);
				
			    courseScoreRegister.getPagedList(false);
			});
			
			//打印
			$("#btnPrint").click(function(){
				courseScoreRegister.print();
			});
		},
		//查询分页函数
		getPagedList:function(flag){
			
			if($("#btnLoadMore").prop("disabled") == true){
		    	$("#btnLoadMore").removeAttr('disabled');
		    	$("#btnLoadMore").attr('class',"btn-more mb10 text-center");
		    }
			
			//获取查询参数
			var requestParam = utils.getQueryParamsByFormId("queryForm");
			//学年
			requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
			//学期
			requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
			
			requestParam.semester = $("#academicYearSemesterSelect").find("option:selected").text();
			
			ajaxData.contructor(false);
		    ajaxData.request(urlScore.GET_COURSE_SCORE_REGISTER_LIST_SUM,requestParam,function(data){
		    	if(data.code==config.RSP_SUCCESS){
		    		$("#teachingClassSum").text(data.data);
		    		
		    		if(data.data <= 1){
		    			$("#btnLoadMore").attr('disabled',"true");
						$("#btnLoadMore").attr('class',"btn disabled");
		    		}
		    	}
		    });
			
			courseScoreRegister.pagination = new pagination({
				id: "pagination", 
				url: urlScore.GET_COURSE_SCORE_REGISTER_LIST, 
				param: requestParam
			},function(data){
				 if(data && data.length != 0){
					 if(flag){
						 $("#contentBody").removeClass("no-data-html").append($("#bodyContentImpl").tmpl(data,helper));
					 }
					 else{
						 $("#contentBody").empty().removeClass("no-data-html").append($("#bodyContentImpl").tmpl(data,helper));
					 }
					 $("#noData").show();
				 }
				 else{
					 $("#contentBody").empty().append("<table><tr><td></td></tr></table>").addClass("no-data-html");
					 $("#noData").hide();
				 }
			}).init();
		},
		/**
		 * 打印
		 */
		print : function(){
			//获取查询参数
			var requestParam = utils.getQueryParamsByFormId("queryForm");
			//学年
			requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
			//学期
			requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
			
			requestParam.semester = $("#academicYearSemesterSelect").find("option:selected").text();
			
			ajaxData.contructor(false);
		    ajaxData.request(urlScore.GET_COURSE_SCORE_REGISTER_LIST_PRINT,requestParam,function(data){
		    	if(data.code==config.RSP_SUCCESS){
		    		//加载学生数据
					$("#printBody").empty().append($("#bodyContentImpl").tmpl(data.data));
			    	$("#printBody").show();
			    	
			    	$("#printBody").jqprint();
			    	
			    	$("#printBody").hide();
			    	
			    	$("#printBody").html("");
		    	}
		    	else{
		    		popup.okPop(data.msg,function(){});
		    	}
		    });
		},
		/**
		 * 得到课程数据
		 * 
		 */
		getData : function() {
			var param = {
				openDepartmentId : $("#openDepartmentId").val(),
				semester : $("#academicYearSemesterSelect").val()
			};
			var dataDom = [];
			var me = this;
			ajaxData.contructor(true); // 异步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(urlScore.GET_COURSE_SELECT_LIST, param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item){
						var option = {
							value : item.value,
							name :  item.name
						};
						dataDom.push(option);
					});
					me.courseInfoSelect.reload(dataDom);
				}
			});
			return dataDom;
		}
	}
	module.exports = courseScoreRegister;
	window.scoreEnterTimeSet = courseScoreRegister;
});
