/**
 * 毕业处理
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */	
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	var urlData = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var URL_GRADUATION = require("basePath/config/url.graduation");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var urlUdf = require("basePath/config/url.udf");
	var dataDictionary = require("basePath/config/data.dictionary");
	//var URLDATA = require("basePath/config/url.data");
	
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var uploaderFile = require("basePath/base/core/uploadUtil"); //文件上传帮助
	var businessModule = require("basePath/config/module"); //文件上传帮助
	var urlFilesystem = require("basePath/config/url.filesystem");
	var validate = require("basePath/utils/validateExtend");
	var helper = require("basePath/utils/tmpl.helper");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	
	var base  =config.base;
	var importUtils = require("basePath/utils/importUtils");
	var importFileMenu = require("basePath/utils/importFileMenu");
	var importFilePhono = require("basePath/utils/importFilePhoto");
	var CONSTANT = require("basePath/config/data.constant");// 公用常量 
	var isOnlyChildEnum = require("basePath/enumeration/studentarchives/IsOnlyChild");// 枚举，是否独生子女
	var treeSelect = require("basePath/module/select.tree");//公用下拉树
	
	var auditResults = require("basePath/enumeration/graduation/AuditResult");
	var graduateStatus = require("basePath/enumeration/graduation/GraduateStatus");
	
	var graduateTypeEnum = require("basePath/enumeration/graduation/GraduateType");
	var auditResultEnum = require("basePath/enumeration/graduation/AuditResult");
	var auditRejectReasonEnum = require("basePath/enumeration/graduation/AuditRejectReason");
	var graduateStatusEnum = require("basePath/enumeration/graduation/GraduateStatus");
	
	var graduationDisposeList = {
			queryObject:{},
			init:function(){
				// 复选框
				utils.checkAllCheckboxes('check-all', 'checNormal');
				
				// 毕业类别
				graduationDisposeList.GRADUATE_TYPE = utils.getEnumValues(graduateTypeEnum);
				// 毕业状态
				graduationDisposeList.GRADUATE_STATUS = utils.getEnumValues(graduateStatusEnum);
				// 审核结果
				graduationDisposeList.AUDIT_RESULT = utils.getEnumValues(auditResultEnum);
				// 审核未通过原因
				graduationDisposeList.AUDIT_REJECT_REASON = utils.getEnumValues(auditRejectReasonEnum);
				
				//年届搜索框
				ajaxData.request(
					URL_GRADUATION.GRAD_GRAUATEDATESET_GET,{},
					function(data){
						if(data && data.graduateYear){
							$("#graduateYear").val(data.graduateYear);
							$("#txt_graduateYear").val(data.graduateYear);
							//年级下拉框
//							simpleSelect.loadSelect("grade",
//									URL_GRADUATION.GRAD_STUDENT_GETGRADUATEGRADELIST,
//									{graduateYear:$("#graduateYear").val()}
//									,
//									{
//										firstText : CONSTANT.PLEASE_SELECT,
//										firstValue : "-1"
//									});
							//年级院系班级专业信息
							graduationDisposeList.loadAcademicYearAndRelation();
							//分页
							graduationDisposeList.getStudentPagedList();
						}
					}
				);
				
				
				//毕业审核结果
				simpleSelect.loadEnumSelect("auditResult",auditResults,{defaultValue:"-1",firstText:CONSTANT.SELECT_ALL,firstValue:-1});
				
				//毕业状态
				simpleSelect.loadEnumSelect("graduateStatus",graduateStatus,{defaultValue:"-1",firstText:CONSTANT.SELECT_ALL,firstValue:-1});
				
				//院系信息
				//graduationDisposeList.loadAcademicRelation();
				
				// 查询
				$('#query').click(function() {
					//保存查询条件
					var data = utils.getQueryParamsByFormId("queryForm");
					data["noCheckDepartment"]=true;
					//console.log(data);
					graduationDisposeList.pagination.setParam(data);
				});
				
				//导出
				$("#export").bind("click",function(){
					ajaxData.exportFile(URL_GRADUATION.GRAD_STUDENT_GRADUATE_EXPORTGRADUATEPROCESSFILE
							, graduationDisposeList.pagination.option.param);
				});
				
				$(document).on("click","button[name='btn-update']",function(e){
					var source = $(this);
					var id = source.attr("_id");
					var status = source.attr("_status");
					
					if(status==0){
						//取消
						ajaxData.request(
								URL_GRADUATION.GRAD_STUDENT_CANCELGRADUATIONCOMPLETION
								,{id:id}
								,function(data){
									if(data.code==0){
										graduationDisposeList.pagination.loadData();
										popup.okPop("处理成功", function() {
											
										});
									}else{
										popup.errPop(data.msg);
									}
								}
						);
					}else if(status==1){
						//毕业
						ajaxData.request(
								URL_GRADUATION.GRAD_STUDENT_SETGRADUATION
								,{id:id}
								,function(data){
									if(data.code==0){
										graduationDisposeList.pagination.loadData();
										popup.okPop("处理成功", function() {
											
										});
									}else{
										popup.errPop(data.msg);
									}
								}
						);
					}else if(status==2){
						//结业
						ajaxData.request(
								URL_GRADUATION.GRAD_STUDENT_SETCOMPLETION
								,{id:id}
								,function(data){
									if(data.code==0){
										graduationDisposeList.pagination.loadData();
										popup.okPop("处理成功", function() {
											
										});
									}else{
										popup.errPop(data.msg);
									}
								}
						);
					}
				}).on("click",".btn-batch-update",function(){
					var source = $(this);
					var status = source.attr("_status");
					var checked = $("input[name='checNormal']:checked");
					var ids = [];
					checked.each(function(){
						ids.push($(this).val());
					});
					if(ids.length==0){
						popup.warPop("请至少选择一条数据");
						return;
					}
					if(status==1){
						//毕业
						ajaxData.request(
								URL_GRADUATION.GRAD_STUDENT_SETGRADUATIONBATCH
								,{ids:ids}
								,function(data){
									if(data.code==0){
										graduationDisposeList.pagination.loadData();
										popup.okPop("处理成功", function() {
											
										});
									}else{
										popup.errPop(data.msg);
									}
								}
						);
					}else{
						//结业
						ajaxData.request(
								URL_GRADUATION.GRAD_STUDENT_SETCOMPLETIONBATCH
								,{ids:ids}
								,function(data){
									if(data.code==0){
										graduationDisposeList.pagination.loadData();
										popup.okPop("处理成功", function() {
											
										});
									}else{
										popup.errPop(data.msg);
									}
								}
						);
					}
				})
				
				
			}
			,
			getStudentPagedList : function() {
				//noCheckDepartment
				//初始化列表数据
				var data = utils.getQueryParamsByFormId("queryForm");
				data["noCheckDepartment"]=true;
				graduationDisposeList.pagination = new pagination({
					id: "pagination", 
					url: URL_GRADUATION.GRAD_STUDENT_GRADUATE_PROCESS_STUDENTPAGEDLIST, 
					param: data
				},function(data){
					$.each(data,function(){
						this["auditResultsName"] = graduationDisposeList.getEnumName(this["auditResults"],graduationDisposeList.AUDIT_RESULT);
						this["rejectReasonName"]= graduationDisposeList.getEnumName(this["rejectReason"],graduationDisposeList.AUDIT_REJECT_REASON);
						this["graduateStatusName"]=graduationDisposeList.getEnumName(this["graduateStatus"],graduationDisposeList.GRADUATE_STATUS);
					});
					 if(data && data.length>0) {
						 $("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data,helper)).removeClass(
							"no-data-html");
						 $("#pagination").show();
					}else {
						$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
						$("#pagination").hide();
					}
					 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//取消全选
				}).init();
			}
			,
			/*
			 * 枚举
			 */
			 getEnumName : function(value, arr) {
					for(var j = 0; j < arr.length; j++){
						if(arr[j].value == value){
							return arr[j].name;
						}
					}
					return '';
				},
			/*
			 * 加载院系、专业、班级		 
			 */
			loadAcademicRelation : function(){
				// 院系（从数据库获取数据）
				simpleSelect.loadSelect("departmentId",
					urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
					{
						departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value, isAuthority : false
					}, {
						firstText : CONSTANT.PLEASE_SELECT,
						firstValue : ""
					});
				// 院系联动专业
				$("#departmentId").change(
					function() {
						var reqData = {};
						reqData.departmentId = $(this).val();
						if (utils.isEmpty($(this).val())) {
							$("#majorId").html("<option value=''>"+CONSTANT.PLEASE_SELECT+"</option>");
							$("#classId").html("<option value=''>"+CONSTANT.PLEASE_SELECT+"</option>");
							$("#trainingLevelName").val("");
							$("#trainingLevelCode").val("");
							$("#educationSystem").val("");
							$("#grade").val("");
							return false;
						}
						simpleSelect.loadSelect("majorId",
							urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
								firstText : CONSTANT.PLEASE_SELECT,
								firstValue : ""
							});
				});
				
				//专业联动班级
				$("#majorId").change(function(){
					var reqData={};
					reqData.majorId = $(this).val();
					
					if(utils.isEmpty($(this).val()) || $(this).val()=='-1'){
			    	   $("#classId").html("<option value=''>"+CONSTANT.PLEASE_SELECT+"</option>");
			    	   return false;
					}
					simpleSelect.loadSelect("classId", URL_STUDENTARCHIVES.CLASS_GET_CLASSSELECTBYQUERY,reqData,{
						firstText : CONSTANT.PLEASE_SELECT,
						firstValue : ""
					});
				});
				
				//班级联动学制 培养层次 当前年级
				$("#classId").change(function(){
					if(utils.isNotEmpty($(this).val()) && $(this).val()!='-1'){
						var reqData={};
						reqData.classId = $(this).val();
						
						ajaxData.request(URL_STUDENTARCHIVES.CLASS_GET_ITEM,reqData,function(data){
							if (data == null)
								return false;
							if (data.code == config.RSP_SUCCESS) {
								$("#trainingLevelName").val(data.data.trainingLevelName);
								$("#trainingLevelCode").val(data.data.trainingLevelCode);
								$("#educationSystem").val(data.data.educationSys);
								$("#grade").val(data.data.grade);
							} else {
								return false;
							}
						});
					}
					else{
						$("#trainingLevelName").val("");
						$("#trainingLevelCode").val("");
						$("#educationSystem").val("");
						$("#grade").val("");
					}
				});
			},
		    
		    /*
			 * 加载学年、院系、专业、班级		 
			 */
			loadAcademicYearAndRelation : function(){
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
									departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value, isAuthority : false
								}, {
									firstText : CONSTANT.SELECT_ALL,
									firstValue : ""
								});
				
				//专业
				simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,null,{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
				
				// 年级联动专业
				$("#grade").change(
						function() {
							var reqData = {isAuthority : false};
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
							graduationDisposeList.majorChange("")
						});
				// 院系联动专业
				$("#departmentId").change(
					function() {
						var reqData = {isAuthority : false};
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
						graduationDisposeList.majorChange("")
				});
				
				//专业联动班级
				$("#majorId").change(function(){
					graduationDisposeList.majorChange($(this).val())
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

	module.exports = graduationDisposeList;
	window.graduationDisposeList = graduationDisposeList;
});