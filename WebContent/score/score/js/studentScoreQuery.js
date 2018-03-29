/**
 * 学生成绩查询
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
    var dataConstant = require("configPath/data.constant");
    var simpleSelect = require("basePath/module/select.simple");
    var entryType = require("basePath/enumeration/score/EntryType");
    var CONSTANT = require("basePath/config/data.constant");// 公用常量 
    var urlTrainplan = require("basePath/config/url.trainplan");
    var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
    var urlStudentarchives = require("basePath/config/url.studentarchives");
    var courseOrTache = require("basePath/enumeration/trainplan/CourseOrTache");
    var helper = require("basePath/utils/tmpl.helper");
    
    /**
     * 成绩审核列表
     */
    var studentScoreQuery = {
        // 初始化
        init : function() {
        	// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", urlData.COMMON_GETSEMESTERLIST, "", "", "");
        	// 学年
			simpleSelect.loadCommonSmesterTwo("academicYear",urlData.GET_ASC_YEARLIST, "", CONSTANT.SELECT_ALL, "",$("#academicYear"));
			//学期
			simpleSelect.loadDataDictionary("semesterCode",dataDictionary.SEMESTER,"",CONSTANT.SELECT_ALL,"");
			
			var semesterValue = $("#semester").val();
			if(semesterValue != ""){
				//学年
				$("#academicYear").val(semesterValue.split("_")[0]);
				//学期
				$("#semesterCode").val(semesterValue.split("_")[1]);
			}
			
			// 加载学年、院系、专业、班级 
			studentScoreQuery.loadAcademicYearAndRelation();
			
			// 绑定课程or环节
			simpleSelect.loadEnumSelect("courseOrTache",courseOrTache, {firstText:CONSTANT.SELECT_ALL,firstValue:""});
			
            //加载数据
            studentScoreQuery.getPagedList();
            
            $("#query").click(function(){
            	//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				
				//保存查询条件
				studentScoreQuery.pagination.setParam(requestParam);
            });
            
            // 导出
			$("#export").click(function() {
				ajaxData.exportFile(urlScore.QUERY_STUDENT_SCORE_EXPORT, studentScoreQuery.pagination.option.param);
			});
			
			//验证开始成绩是否符合规则
			$(":input[name='finalTotalScoreBegin']").blur(function(){
			    var beginScore = $(this).val();
			    var reg = /^(0|[1-9][0-9]?|100)(\.[0-9])?$/;
			    if(!reg.test(beginScore)){
			    	$(this).val("");
			    }
			});
			
			//验证结束成绩是否符合规则
			$(":input[name='finalTotalScoreEnd']").blur(function(){
			    var endScore = $(this).val();
			    var reg = /^(0|[1-9][0-9]?|100)(\.[0-9])?$/;
			    if(!reg.test(endScore)){
			    	$(this).val("");
			    }
			});
        },
        //查询分页函数
		getPagedList:function(){
			//获取查询参数
			var requestParam = utils.getQueryParamsByFormId("queryForm");
			
			studentScoreQuery.pagination = new pagination({
				id: "pagination", 
				url: urlScore.QUERY_STUDENT_SCORE_PAGEDLIST, 
				param: requestParam
			},function(data){
				 if(data && data.length != 0){
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data,helper));
					 $("#pagination").show();
				 }else{
					 $("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 $("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			}).init();
		},
		/*
		 * 加载学年、院系、专业、班级		 
		 */
		loadAcademicYearAndRelation : function(){
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,
					null, {
						firstText : CONSTANT.SELECT_ALL,
						firstValue : ""
					});
			// 院系（从数据库获取数据）
			simpleSelect
					.loadSelect(
							"departmentId",
							urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
							{
								departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value, isAuthority : true
							}, {
								firstText : CONSTANT.SELECT_ALL,
								firstValue : ""
							});
			
			//专业
			simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,null,{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						if (utils.isNotEmpty($(this).val())
								&& $(this).val() == '-1'
								&& utils.isEmpty($("#departmentId").val())) {
							$("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
							return false;
						}
						simpleSelect.loadSelect("majorId",
								urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
									firstText : CONSTANT.SELECT_ALL,
									firstValue : "",
									async: false
							});
						studentScoreQuery.majorChange("")
					});
			// 院系联动专业
			$("#departmentId").change(
				function() {
					var reqData = {};
					reqData.departmentId = $(this).val();
					reqData.grade = $("#grade").val();
					if (utils.isEmpty($(this).val())
							&& utils.isNotEmpty($("#grade").val())
							&& $("#grade").val() == '-1') {
						$("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
						return false;
					}
					simpleSelect.loadSelect("majorId",
						urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
							firstText : CONSTANT.SELECT_ALL,
							firstValue : "",
							async: false
						});
					studentScoreQuery.majorChange("")
			});
			
			//专业联动班级
			$("#majorId").change(function(){
				studentScoreQuery.majorChange($(this).val())
			});
		},
		/**
		 * 专业Change触发动作
		 * @returns {Boolean}
		 */
		majorChange : function(value){
			if(!value){
		    	   $("#classId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
		    	   return;
				}
			simpleSelect.loadSelect("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,{majorId:value,grade : $("#grade").val()},{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
		}
    }
    module.exports = studentScoreQuery;
    window.scoreAudit = studentScoreQuery;
});