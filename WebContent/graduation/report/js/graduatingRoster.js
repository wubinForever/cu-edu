define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	//var authority = require("basePath/utils/authority");
	var validate = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	
	
	// 枚举
	var isCurrentSemester = require("basePath/enumeration/common/IsCurrentSemester");
	
	// 下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");

	var URL = require("basePath/config/url.courseplan");
	var URLDATA = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var URL_GRADUATION = require("basePath/config/url.graduation");
	var dictionary = require("basePath/config/data.dictionary");
	
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var urlData = require("basePath/config/url.data");// 基础数据url
	var urlUdf = require("basePath/config/url.udf");// 基础框架url
	var url = require("basePath/config/url.studentarchives");// 学籍url
	var urlTrainplan = require("basePath/config/url.trainplan");// 培养方案url
	var applyTypeEnum = require("basePath/enumeration/studentarchives/ApplyType");// 枚举，异动申请类型
	var alienChangeCategoryEnum = require("basePath/enumeration/studentarchives/AlienChangeCategory");// 枚举，异动类别
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");// 枚举，部门大类
	var alienChangeStatusEnum = require("basePath/enumeration/studentarchives/AlienChangeStatus");// 枚举，异动状态
	var canBeConfirmedClassEnum = require("basePath/enumeration/studentarchives/CanBeConfirmedClass");// 枚举，是否确定班级 
	var confirmedClassEnum = require("basePath/enumeration/studentarchives/ConfirmedClass");// 枚举，确定班级
	var isEnabledEnum = require("basePath/enumeration/common/IsEnabled");// 枚举，是否启用
	var isCancelEnum = require("basePath/enumeration/studentarchives/IsCancel");// 枚举，是否取消
	var trainingLevelEnum = require("basePath/enumeration/udf/TrainingLevel");// 枚举，培养层次
	var dataDictionary = require("basePath/config/data.dictionary");// 数据字典
	//var dataConstant = require("configPath/data.constant");// 公用常量 
	var CONSTANT = require("basePath/config/data.constant");// 公用常量 
	var helper = require("basePath/utils/tmpl.helper");// 帮助，如时间格式化等
	var treeSelect = require("basePath/module/select.tree");// 公用下拉树
	var pagination = require("basePath/utils/pagination");// 分页
	var validateExtend = require("basePath/utils/validateExtend");// 自定义校验

	var base = config.base;
	
	// 变量名跟文件名称一致
	var graduatingRoster = {
		queryObject:{},
		init : function() {
			//年届搜索框
			ajaxData.request(
				URL_GRADUATION.GRAD_GRAUATEDATESET_GET,{},
				function(data){
					if(data && data.graduateYear){
						$("#graduateYear").val(data.graduateYear);
						graduatingRoster.pagedList(); //加载列表
						graduatingRoster.loadAcademicYearAndRelation1()
					}
				}
			);
			//导出
			$("#export").bind("click",function(){
				ajaxData.exportFile(URL_GRADUATION.GRAD_STUDENT_GRADUATE_EXPORTGRADUATEPROCESSSTUDENTROSTERFILE
						, graduatingRoster.pagination.option.param);
			});
			
			// 查询
			$('#query').click(function() {
				//保存查询条件
				var data = utils.getQueryParamsByFormId("queryForm");
				data["noCheckDepartment"]=false;
				graduatingRoster.pagination.setParam(data);
			});
			//graduatingRoster.loadAcademicYearAndRelation();
		}
		,
		pagedList:function(){
			var data = utils.getQueryParamsByFormId("queryForm");
			data["noCheckDepartment"]=false;
			//初始化列表数据
			graduatingRoster.pagination = new pagination({
				id: "pagination", 
				url: URL_GRADUATION.GRAD_STUDENT_GRADUATE_PROCESS_STUDENTPAGEDLIST, 
				param: data
			},function(data){
				 if(data && data.length>0) {
					 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass(
						"no-data-html");
					 $("#pagination").show();
				}else {
					$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			}).init();
		}
		,
		/**
		 * 加载年级、院系、专业、班级		 
		 * int类型默认为-1，如年级，String类型默认为空，如院系等
		 * 
		 * @param auth 是否权限过滤
		 */
		loadAcademicYearAndRelation : function(auth){
			//var authority = true; // 默认
//			if (!utils.isEmpty(auth)){
//					authority = auth
//			}
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,null, 
						{
							firstText : CONSTANT.SELECT_ALL,
							firstValue : "-1"
						});	
			
			// 院系（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
							{
								departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value,
								isAuthority : true
							}, {
								firstText : CONSTANT.SELECT_ALL,
								firstValue : ""
							});
			// 专业（从数据库获取数据）
			simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
					        {
								firstText : CONSTANT.SELECT_ALL,
								firstValue : ""
							});
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						$("#classId").html("<option value=''>" + CONSTANT.SELECT_ALL + "</option>");
						if (utils.isNotEmpty($(this).val())
								&& $(this).val() == '-1'
								&& utils.isEmpty($("#departmentId").val())) {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
									        {
												firstText : dataConstant.SELECT_ALL,
												firstValue : ""
											});
							return false;
						}
						simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, 
								{
									firstText : CONSTANT.SELECT_ALL,
									firstValue : ""
								});
					});
			// 院系联动专业
			$("#departmentId").change(
					function() {
						var reqData = {};
						reqData.departmentId = $(this).val();
						reqData.grade = $("#grade").val();
						
						$("#classId").html("<option value=''>" + CONSTANT.SELECT_ALL + "</option>");
						if (utils.isEmpty($(this).val())
								&& utils.isNotEmpty($("#grade").val())
								&& $("#grade").val() == '-1') {
							// 专业（从数据库获取数据）
							simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST,null, 
									        {
												firstText : CONSTANT.SELECT_ALL,
												firstValue : ""
											});
							return false;
						}
						simpleSelect.loadSelect("majorId",urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, 
								{
									firstText : CONSTANT.SELECT_ALL,
									firstValue : ""
								});
					});
			//专业联动班级
			$("#majorId").change(
					function() {
						var reqData = {};
						reqData.majorId = $(this).val();
						reqData.grade = $("#grade").val();
						if (utils.isEmpty($(this).val())){
							$("#classId").html("<option value=''>" + CONSTANT.SELECT_ALL + "</option>");
							return false;
						}
						simpleSelect.loadSelect("classId",url.CLASS_GET_CLASSSELECTBYQUERY, reqData, 
								{
									firstText : CONSTANT.SELECT_ALL,
									firstValue : ""
						        });
					});
		},
		/*
		 * 加载学年、院系、专业、班级		 
		 */
		loadAcademicYearAndRelation1 : function(){
			var graduateYear = $('#graduateYear').val();
			var param = {
				graduateYear : graduateYear
			};
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", URL_GRADUATION.GRAD_STUDENT_GETGRADUATEGRADELIST,
				param, {
					firstText : CONSTANT.SELECT_ALL,
					firstValue : "",
					async: false
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
			simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,null,{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			
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
								URL_TRAINPLAN.GRADEMAJOR_MAJORLIST, reqData, {
									firstText : CONSTANT.SELECT_ALL,
									firstValue : "",
									async: false
							});
						graduatingRoster.majorChange("")
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
						URL_TRAINPLAN.GRADEMAJOR_MAJORLIST, reqData, {
							firstText : CONSTANT.SELECT_ALL,
							firstValue : "",
							async: false
						});
					graduatingRoster.majorChange("")
			});
			
			//专业联动班级
			$("#majorId").change(function(){
				graduatingRoster.majorChange($(this).val())
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
			simpleSelect.loadSelect("classId", URL_STUDENTARCHIVES.CLASS_GET_CLASSSELECTBYQUERY,{majorId:value,grade : $("#grade").val()},{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
		}
	}
	
	module.exports = graduatingRoster; // 根据文件名称一致
	window.graduatingRoster = graduatingRoster; // 根据文件名称一致
});