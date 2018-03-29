/**
 * 学生管理
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
	var urlStudentarchives = require("basePath/config/url.studentarchives");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var URL_FILESYSTEM = require("basePath/config/url.filesystem");
	var urlUdf = require("basePath/config/url.udf");
	var dataDictionary = require("basePath/config/data.dictionary");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var urlFilesystem = require("basePath/config/url.filesystem");
	var validate = require("basePath/utils/validateExtend");
	var helper = require("basePath/utils/tmpl.helper");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	var base = config.base;
	var CONSTANT = require("basePath/config/data.constant");// 公用常量 
	
	/**
	 * 学生管理
	 */
	var archivesCard = {
		//查询条件
		queryObject:{},	
		// 初始化
		init : function() {
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,null,{async:false});
			// 院系（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",urlData.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value},{async:false});
			
			var grade = $("#grade").val(), departmentId = $("#departmentId").val(), majorId = "";
			
		    if(grade != "" && departmentId != ""){
		    	//专业（从数据库获取数据）
				simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST, {departmentId : departmentId,grade : grade},{async:false});
				
				majorId = $("#majorId").val();
				if(majorId != ""){
					//班级（从数据库获取数据）
					simpleSelect.loadCommon("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,{majorId : majorId,grade : grade},"",CONSTANT.SELECT_ALL,"",null);
				}
		    }
			
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						if (utils.isNotEmpty($(this).val()) && $(this).val() == '-1' && utils.isEmpty($("#departmentId").val())) {
							return false;
						}
						simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST, reqData,{async:false});
						
						majorId = $("#majorId").val();
			    		if(majorId != ""){
			    			//班级（从数据库获取数据）
							simpleSelect.loadCommon("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,{majorId : majorId,grade : $("#grade").val()},"",CONSTANT.SELECT_ALL,"",null);
			    		}
			    		else{
			    			$("#classId").empty();
			    		}
					});
			// 院系联动专业
			$("#departmentId").change(
				function() {
					var reqData = {};
					reqData.departmentId = $(this).val();
					reqData.grade = $("#grade").val();
					if (utils.isEmpty($(this).val()) && utils.isNotEmpty($("#grade").val())) {
						return false;
					}
					simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST, reqData,{async:false});
					
					majorId = $("#majorId").val();
		    		if(majorId != ""){
		    			//班级（从数据库获取数据）
						simpleSelect.loadCommon("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,{majorId : majorId,grade : $("#grade").val()},"",CONSTANT.SELECT_ALL,"",null);
		    		}
		    		else{
		    			$("#classId").empty();
		    		}
			});
			//专业联动班级
			$("#majorId").change(function(){
				var reqData={};
				reqData.majorId = $(this).val();
				reqData.grade = $("#grade").val();
				if(!$(this).val()){
		    	   $("#classId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
		    	   return;
				}
				simpleSelect.loadCommon("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,reqData,"",CONSTANT.SELECT_ALL,"",null);
			});
			
			//培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode",dataDictionary.ID_FOR_TRAINING_LEVEL, {firstText:"全部",firstValue:""});
			//学籍状态
			simpleSelect.loadDictionarySelect("archievesStatusCode",dataDictionary.ARCHIEVES_STATUS_CODE, {firstText:"全部",firstValue:""});
			//在校状态
			simpleSelect.loadDictionarySelect("schoolStatusCode",dataDictionary.SCHOOL_STATUS_CODE, {firstText:"全部",firstValue:""});
			
			archivesCard.getStudentPagedList({grade:grade,departmentId:departmentId,majorId:majorId,pageIndex:0,pageSize:1});
			// 查询
			$("#query").click(function() {
				//保存查询条件
				$("#pageIndex").val("0");
				$("#currentPage").text("1");
				archivesCard.getStudentPagedList(null);
			});
			
			//打印
			$("#print").click(function() {
			    
					archivesCard.print();
				
	    	
			});
			
			//导出
			$("#export").click(function(){
				archivesCard.exportExcel();
			});
			
			//上一页
			$("#upPage").click(function(){
				var pageIndex = parseInt($("#pageIndex").val());
				var currentPage = parseInt($("#currentPage").text());
				if(pageIndex > 0){
					$("#pageIndex").val(pageIndex-1);
					$("#currentPage").text(currentPage-1);
					archivesCard.getStudentPagedList();
					
					$("#nextPage").removeClass();
					$("#nextPage").addClass("current");
					
					if(pageIndex-1 == 0){
						$("#upPage").attr("class","disabled")
					}
				}
				else{
					$("#upPage").attr("class","disabled")
					return false;
				}
			});
			
			//下一页
			$("#nextPage").click(function(){
				var pageIndex = parseInt($("#pageIndex").val());
				var totalRows = parseInt($("#totalRows").text());
				var currentPage = parseInt($("#currentPage").text());
				
				if(totalRows > currentPage){
					$("#pageIndex").val(pageIndex+1);
					$("#currentPage").text(currentPage+1);
					archivesCard.getStudentPagedList();
					
					$("#upPage").removeClass();
					$("#upPage").addClass("current");
					
					if(totalRows == currentPage+1){
						$("#nextPage").attr("class","disabled")
					}
				}
				else{
					$("#nextPage").attr("class","disabled")
					return false;
				}
			});
		},
		
		/**
		 * 学生分页列表
		 */
		getStudentPagedList : function(reqData) {
			if(reqData == null){
				reqData = utils.getQueryParamsByFormId("queryForm");
			}
			
			ajaxData.contructor(false);
		    ajaxData.request(urlStudentarchives.STUDENT_ARCHIVESCARDLIST,reqData,function(data){
		    	if(data.code==config.RSP_SUCCESS){
		    		if(data.data.userId == null || data.data.userId == ""){
		    			$("#totalRows").text("0");
		    			$("#currentPage").text("0");
		    			$("#nextPage").attr("class","disabled");
		    			data.data.fileId = "../../../common/images/avatar.png";
		    		}
		    		else{
		    			if(data.data.totalRows == "1"){
		    				$("#nextPage").attr("class","disabled");
		    			}
		    			else{
		    				$("#nextPage").attr("class","current");
		    			}
		    			//设置总页码数
			    		$("#totalRows").text(data.data.totalRows);
			    		//设置学生照片
			    		if(utils.isNotEmpty(data.data.fileId)){
			    			data.data.fileId = config.PROJECT_NAME + URL_FILESYSTEM.EXPORT_FILE.url+"?fileId=" + data.data.fileId;
						}
						else{
							data.data.fileId = "../../../common/images/avatar.png";
						}
		    		}
					//加载学生数据
		    		if(utils.isNotEmpty(data.data.userId)){
		    			$("#studentContentBody").empty().append($("#studentContentImpl").tmpl(data.data,helper)).removeClass("no-data-html");
		    		    $("#print").prop("disabled",false).addClass("btn-success");
		    		}
		    		else{
		    			$("#studentContentBody").empty().append("<table><tr><td></td></tr></table>").addClass("no-data-html");
		    			$("#print").prop("disabled",true).removeClass("btn-success");
		    		}
				}
				else{
					popup.okPop(data.msg,function(){
					});
				}
			}, true);
		},
		
		/**
		 * 打印
		 */
		print : function(){
			var reqData={departmentId:""};
			var tableList = "";
			var studentImage = "";
			
		    ajaxData.request(urlStudentarchives.STUDENT_ARCHIVESCARDPRINT,utils.getQueryParamsByFormId("queryForm"),function(data){
		    	if(data.code==config.RSP_SUCCESS){
		    		for(var i=0;i<data.data.length;i++){
		    			//设置学生照片
		    			if(utils.isNotEmpty(data.data[i].fileId)){
		    				data.data[i].fileId = config.PROJECT_NAME + URL_FILESYSTEM.EXPORT_FILE.url+"?fileId=" + data.data[i].fileId;
						}
						else{
							data.data[i].fileId = "../../../common/images/avatar.png";
						}
		    		}
		    		
		    		//加载学生数据
					$("#printBody").empty().append($("#studentContentImpl").tmpl(data.data,helper));
			    	$("#printBody").show();
			    	
			    	$("#printBody").jqprint();
			    	
			    	$("#printBody").hide();
			    	
			    	$("#printBody").html("");
				}
				else{
					popup.okPop(data.msg,function(){
					});
				}
			},true);
		},
		
		/**
		 * 导出
		 */
		exportExcel:function(){
			ajaxData.exportFile(urlStudentarchives.STUDENT_ARCHIVESCARDEXPORT,utils.getQueryParamsByFormId("queryForm"));
		},
	}
	module.exports = archivesCard;
	window.archivesCard = archivesCard;
});
