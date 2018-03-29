/**
 * 学生名册
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */

	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var simpleSelect = require("basePath/module/select.simple");
	var urlData = require("basePath/config/url.data");
	var urlStudentarchives = require("basePath/config/url.studentarchives");
	var helper = require("basePath/utils/tmpl.helper");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var dataDictionary = require("basePath/config/data.dictionary");
	var pagination = require("basePath/utils/pagination");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	var checkWayEnum = require("basePath/enumeration/studentarchives/CheckWay");//状态枚举
	var base = config.base;
	/**
	 * 学生名册
	 */
	var studentRoll = {
		//查询条件
		queryObject:{},	
		// 初始化
		init : function() {
			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmesterTwo("academicYearSemester",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
			//所在校区
			simpleSelect.loadSelect('campusId',urlData.CAMPUS_GETALL,{isAuthority : false},{ firstText: "全部", firstValue: "", async: false });
			//培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode",dataDictionary.ID_FOR_TRAINING_LEVEL, {firstText:"全部",firstValue:""});
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST, null, {firstText : "全部",firstValue : "",async:false});
			// 院系（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value},{firstText : "全部",firstValue : "",async:false});
			//专业
			simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,null,{ firstText: "全部", firstValue: "" });
			
			// 查看方式
			simpleSelect.loadEnumSelect("checkWay", checkWayEnum, {defaultValue:-1,firstText : "全部",firstValue : ""});
			
			var grade = $("#grade").val(), departmentId = $("#departmentId").val(), majorId = "";
			
		    if(utils.isNotEmpty(grade) && utils.isNotEmpty(departmentId)){
		    	//专业（从数据库获取数据）
				simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,{departmentId : departmentId,grade : grade},{firstText : "全部",firstValue : "",async:false});
				
				majorId = $("#majorId").val();
				
				if(utils.isNotEmpty(majorId)){
					//班级（从数据库获取数据）
					simpleSelect.loadSelect("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,{majorId : majorId,grade : grade}, {firstText : "全部",firstValue : ""});
				}
				else{
					$("#classId").html("<option value=''>全部</option>");
				}
		    }
			
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						if (utils.isNotEmpty($(this).val())
								&& $(this).val() == '-1'
									&& utils.isEmpty($("#departmentId").val())) {
							return false;
						}
						simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {firstText : "全部",firstValue : "",async:false});
						
						majorId = $("#majorId").val();
			    		//班级（从数据库获取数据）
						if(utils.isNotEmpty(majorId)){
							simpleSelect.loadSelect("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,{majorId : majorId,grade : grade}, {firstText : "全部",firstValue : ""});
						}
						else{
							$("#classId").html("<option value=''>全部</option>");
						}
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
						return false;
					}
					
					simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {firstText : "全部",firstValue : "",async:false});
					
					majorId = $("#majorId").val();
		    		//班级（从数据库获取数据）
					if(utils.isNotEmpty(majorId)){
						simpleSelect.loadSelect("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,{majorId : majorId,grade : grade}, {firstText : "全部",firstValue : ""});
					}
					else{
						$("#classId").html("<option value=''>全部</option>");
					}
			});
			
			//专业联动班级
			$("#majorId").change(function(){
				var reqData={};
				reqData.majorId = $(this).val();
				reqData.grade = $("#grade").val();
				
				if(utils.isNotEmpty($(this).val())){
					simpleSelect.loadSelect("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,reqData, {firstText : "全部",firstValue : "",async:false});
				}
				else{
					$("#classId").html("<option value=''>全部</option>");
				}
			});
			
			//加载列表数据
			this.loadStuentRollList();
			
			// 查询
			$("#query").click(function() {
				//保存查询条件
				studentRoll.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});
			// 导出
			$("#export").click(function() {
				ajaxData.exportFile(urlStudentarchives.STUDENT_ROLL_EXPORT, studentRoll.pagination.option.param);
			});
		},
        /**
		 * 加载学生名册列表
		 */
		loadStuentRollList : function(){
			//初始化列表数据
			studentRoll.pagination = new pagination({
				id: "pagination", 
				url: urlStudentarchives.STUDENT_ROLL, 
				param: utils.getQueryParamsByFormId("queryForm")
			},function(data){
				 if(data && data.length>0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass(
						"no-data-html");
					 $("#pagination").show();
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
			}).init();
		 }
		
	}
	module.exports = studentRoll;
	window.studentroll = studentRoll;
});
