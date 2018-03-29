/**
 * 补考成绩登记册
 */
define(function(require, exports, module) {	
    var utils = require("basePath/utils/utils");
    var ajaxData = require("basePath/utils/ajaxData");
    var config = require("basePath/utils/config");
    var dataConstant = require("configPath/data.constant");
    var urlScore = require("configPath/url.score");
    var urlData = require("configPath/url.data");
    var urlUdf = require("configPath/url.udf");
    var urlStudent = require("configPath/url.studentarchives");// 学籍url
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

    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var markupScoreSet; // 课程/补考成绩录入相关设置表（包括构成、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组

    var markUpExamScoreRegister = {
    		  // 初始化
            init : function() {
            	// 加载查询条件
            	markUpExamScoreRegister.initQuery();
    			
    			//年级或者院系变动，加载专业
    			$("#grade,#departmentId").change(function(){
    				var grade =$("#grade").val();
    			    var departmentId=$("#departmentId").val();
    			    if( grade != dataConstant.MINUS_ONE && departmentId != dataConstant.EMPTY){ //加载专业
    			    	simpleSelect.loadSelect("majorId",
    			    			urlTrainplan.GRADEMAJOR_MAJORLIST, {
    								grade:grade,
    								departmentId:departmentId								
    							}, {
    								firstText : dataConstant.SELECT_ALL, // --全部--
    								firstValue : dataConstant.EMPTY,
    								async : true,
    								length:15
    							});			    	
    			    }else{
    			    	$("#majorId").empty().append('<option value="">全部</option>');  // 专业
    			    }
    			    $("#classId").empty().append('<option value="">全部</option>');  // 班级
    			});
    			
    			//专业变动，加载班级
    			$("#majorId").change(function(){
    				var grade=$("#grade").val();
    				var majorId =$("#majorId").val();
    			    if(majorId != dataConstant.EMPTY){ 
    			    	simpleSelect.loadSelect("classId",
    			    			urlStudent.CLASS_GET_CLASSSELECTBYQUERY, {
    			    				grade:grade,
    								majorId:majorId						
    							}, {
    								firstText : dataConstant.SELECT_ALL, // --全部--
    								firstValue : dataConstant.EMPTY,
    								async : true,
    								length:15
    							});	
    			    }else{
    			    	$("#classId").empty().append('<option value="">全部</option>');  // 班级
    			    }
    			});
    			
    			//列表数据加载
    			markUpExamScoreRegister.getPagedList();
				//统计课程总数
    			markUpExamScoreRegister.getCourseNum();
    			//加载更多
				$('#btnLoadMore').click(function(){
					$("#noData").append("<div class='loading-back'></div>");
					$("#pageIndex").val(parseInt($("#pageIndex").val())+1);
					
					markUpExamScoreRegister.getPagedList(true);
					
					if(parseInt($("#courseNum").text()) == parseInt($("#pageIndex").val())+1){
						$("#btnLoadMore").attr('disabled',"true");
						$("#btnLoadMore").attr('class',"btn disabled");
					}
				});
				//查询
				$("#query").click(function(){
					$("#pageIndex").val(0);
					markUpExamScoreRegister.getCourseNum();
					markUpExamScoreRegister.getPagedList(false);
				});
				//打印
				$("#btnPrint").click(function(){
					markUpExamScoreRegister.print();
				});
            },
            //统计数量
            getCourseNum:function(){
            	if($("#btnLoadMore").prop("disabled") == true){
			    	$("#btnLoadMore").removeAttr('disabled');
			    	$("#btnLoadMore").attr('class',"btn-more mb10 text-center");
			    }
				//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//学年
				requestParam.academicYear   =requestParam.studySemester.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.studySemester.split("_")[1];
				
				requestParam.semester = $("#studySemester").find("option:selected").text()
				requestParam.isAuthority=true;
				ajaxData.contructor(false);
			    ajaxData.request(urlScore.GET_MARKUPSCORE_REGISTERLIST_SUM,requestParam,function(data){
			    	if(data.code==config.RSP_SUCCESS){
			    		$("#courseNum").text(data.data);
			    		if(data.data <= 1){
			    			$("#btnLoadMore").attr('disabled',"true");
							$("#btnLoadMore").attr('class',"btn disabled");
			    		}
			    	}
			    });
			},
			//查询分页函数
			getPagedList:function(flag){
				
				
				//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//学年
				requestParam.academicYear = requestParam.studySemester.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.studySemester.split("_")[1];
				
				requestParam.semester = $("#studySemester").find("option:selected").text();
				requestParam.isAuthority=true;
				
				markUpExamScoreRegister.pagination = new pagination({
					id: "pagination", 
					url: urlScore.GET_MARKUPSCORE_REGISTER_LIST, 
					param: requestParam
				},function(data){
					 if(data && data.length != 0){
						 if(flag){
							 $("#contentBody").removeClass("no-data-html").append($("#bodyContentImpl").tmpl(data));
						 }
						 else{
							 $("#contentBody").empty().removeClass("no-data-html").append($("#bodyContentImpl").tmpl(data));
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
				requestParam.academicYear = requestParam.studySemester.split("_")[0];
				//学期
				requestParam.semesterCode = requestParam.studySemester.split("_")[1];
				
				requestParam.semester = $("#studySemester").find("option:selected").text();
				ajaxData.contructor(false);
			    ajaxData.request(urlScore.GET_MARKUPSCORE_REGISTERLIST_PRINT,requestParam,function(data){
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
    		 * 查询条件初始化
    		 * 
    		 */
    		initQuery : function() {
    			// 加载当前学年学期
    			simpleSelect.loadCommonSmester("studySemester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
    			
    			// 绑定开课单位下拉框
    			simpleSelect.loadSelect("openDepartmentId",
    					urlData.DEPARTMENT_STARTCLASS_FOR_SELECT, {
    						isAuthority : true
    					}, {
    						async : false,
    						length:12
    					});

    			// 绑定年级下拉框
    			simpleSelect.loadSelect("grade", 
    					urlTrainplan.GRADEMAJOR_GRADELIST,
    					null, 
    					{
    						firstText : dataConstant.SELECT_ALL, // --全部--
    						firstValue : dataConstant.MINUS_ONE, // -1
    						async : false,
    						length:12
    					});
    			
    			// 绑定院系下拉框
    			simpleSelect.loadSelect(
    					"departmentId",
    					urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
    					{
    						departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value,
    						isAuthority : true
    					}, {
    						firstText : dataConstant.SELECT_ALL, // --全部--
    						firstValue : dataConstant.EMPTY, // ""
    						async : false,
    						length:12
    					});
    		},
    		
    }
    module.exports = markUpExamScoreRegister;
    window.markUpExamScoreRegister = markUpExamScoreRegister;
});