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
    // 下拉框
    var select = require("basePath/module/select");
    var simpleSelect = require("basePath/module/select.simple");
    var markupScoreSet; // 课程/补考成绩录入相关设置表（包括构成、录入人、是否允许修改）
    var scoreRegimenDetail; // 分制明细数组

    var markUpExamScoreView = {
            
    		// 初始化
            init : function() {        	
            	var obj = popup.data("obj");
            	$("#studyAcademicYear").val($(obj).attr("studyAcademicYear"));
    			$("#studySemesterCode").val($(obj).attr("studySemesterCode"));
    			$("#courseId").val($(obj).attr("courseId"));
    			$("#openDepartmentId").val($(obj).attr("openDepartmentId"));
    			$("#courseInfo").val($(obj).attr("courseInfo"));    			
            	
    			popup.setData("markUpExamScoreView",markUpExamScoreView);
    			
            	// 加载查询条件
            	markUpExamScoreView.initQuery();
    			
    			//年级或者院系变动，加载专业
    			$("#grade,#departmentId").change(function(){
    				var grade =$("#grade").val();
    			    var departmentId=$("#departmentId").val();
    			    if( grade != dataConstant.MINUS_ONE && departmentId != dataConstant.EMPTY){ //加载专业
    			    	simpleSelect.loadSelect("majorId",
    			    			urlTrainplan.GRADEMAJOR_MAJORLIST, {
    								grade:grade,
    								departmentId:departmentId,
    								isAuthority:false // 院系不进行数据权限过滤，级联专业时专业也不进行数据权限过滤
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
    			    			urlstudent.CLASS_GET_CLASSSELECTBYQUERY, {
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
    			
    			
    			
    			markUpExamScoreView.getInitData();
    			
    			
    			  
    			// 查询
    			$('#btnSearch').click(function() {
    				markUpExamScoreView.getInitData();
    			});	
    			
               
    			
            },         
        
        
      //显示当前选中信息
        showCurrentSelectedInfo:function(){        	
        	var courseInfo=$("#courseInfo").val();
		    $("#spanCourse").text("课程："+courseInfo);
		    $("#spanCourse").attr("title","课程："+courseInfo);

			
			
        },
        
        /**
		 * 查询条件初始化
		 * 
		 */
		initQuery : function() {
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
						isAuthority : false // 院系不进行数据权限过滤
					}, {
						firstText : dataConstant.SELECT_ALL, // --全部--
						firstValue : dataConstant.EMPTY, // ""
						async : false,
						length:12
					});
			// 初始化分制
			simpleSelect.loadSelect("scoreRegimenId",url.GET_SCORE_REGIMEN_LIST,{},{});
		},
		
		/**
		 * 获取列表初始化数据
		 */
		getInitData:function(){	
			markUpExamScoreView.showCurrentSelectedInfo();	
			var queryParams=utils.getQueryParamsByFormId("queryForm");
			if(queryParams.courseId==dataConstant.EMPTY){
				popup.warPop("请先选择课程");
				markUpExamScoreView.bindNoData();	
				return false;
			}
			else{
				//获取列表数据
				queryParams.isAuthority=false; // 教师服务端不进行数据权限过滤
				queryParams.isLessThen60 =true; // 只查找分数小于60的学生成绩
				ajaxData.request(url.GET_MARKUP_SCORE_ENTRY_LIST, queryParams, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						if(data.data && data.data.length>0){
							// 获取分制
							markupScoreSet={};
							markupScoreSet["list"]=data.data;
							if(data.data[0].scoreRegimenId){
								$("#scoreRegimenId").val(data.data[0].scoreRegimenId); // 分制下拉框重新选定
							}
							
							markupScoreSet.scoreRegimenId=$("#scoreRegimenId").val(); // 分制id
							markupScoreSet.scoreRegimenName=$("#scoreRegimenId").find("option:selected").text(); // 分制名称
							
							
							
							$("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(markupScoreSet));
																
						}else{
							markUpExamScoreView.bindNoData();
						}
						
					} else {
						// 提示失败
						popup.errPop(data.msg);
						markUpExamScoreView.bindNoData();
						return false;
					}				
				},true);
			}	
		},	
		
		

		
		//没有数据时绑定暂无数据
		bindNoData:function(){
			$("#tbodycontent").empty().append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");

		}
		
		
    }
    module.exports = markUpExamScoreView;
    window.markUpExamScoreView = markUpExamScoreView;
});