/**
 * 学生成绩档案
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
    var studentScoreArchives = {
        // 初始化
        init : function() {

			// 加载学年、院系、专业、班级 
			studentScoreArchives.loadAcademicYearAndRelation();
            
			//打开可以显示暂无数据
			$("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
			$("#noData").hide();
			
			//查询
            $("#query").click(function(){
            	if($("#departmentId").val()==""){
            		popup.warPop("请先选择院系！");
            		return false;
            	}
            	if($("#majorId").val()==""){
            		popup.warPop("请先选择专业！");
            		return false;
            	}
            	if($("#classId").val()==""){
            		popup.warPop("请先选择班级！");
            		return false;
            	}
            	
            	$("#pageIndex").val(0);
				studentScoreArchives.getPagedList(false);
				
				/*//获取查询参数
				var requestParam = utils.getQueryParamsByFormId("queryForm");
				//保存查询条件
				studentScoreArchives.pagination.setParam(requestParam);*/
            });
            
            //加载更多
			$('#btnLoadMore').click(function(){
				$("#noData").append("<div class='loading-back'></div>");
				$("#pageIndex").val(parseInt($("#pageIndex").val())+1);
				
				studentScoreArchives.getPagedList(true);
				if(parseInt($("#studentSum").text()) == parseInt($("#pageIndex").val())+1){
					$("#btnLoadMore").attr('disabled',"true");
					$("#btnLoadMore").attr('class',"btn disabled");
				}
			});
			
			//打印
			$("#btnPrint").click(function(){
				studentScoreArchives.print();
			});
			
			//验证开始成绩是否符合规则
			$(":input[name='beginScore']").blur(function(){
			    var beginScore = $(this).val();
			    var reg = /^(0|[1-9][0-9]?|100)(\.[0-9])?$/;
			    if(!reg.test(beginScore)){
			    	$(this).val("");
			    }
			});
			
			//验证结束成绩是否符合规则
			$(":input[name='endScore']").blur(function(){
			    var endScore = $(this).val();
			    var reg = /^(0|[1-9][0-9]?|100)(\.[0-9])?$/;
			    if(!reg.test(endScore)){
			    	$(this).val("");
			    }
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
			
			//获取总学生人数
			ajaxData.contructor(false);
		    ajaxData.request(urlScore.STUDENT_COUNT_SCORE,requestParam,function(data){
		    	if(data.code==config.RSP_SUCCESS){
		    		$("#studentSum").text(data.data);
		    		
		    		if(data.data <= 1){
		    			$("#btnLoadMore").attr('disabled',"true");
						$("#btnLoadMore").attr('class',"btn disabled");
		    		}
		    	}
		    });
			
			studentScoreArchives.pagination = new pagination({
				id: "pagination", 
				url: urlScore.STUDENT_SCORE_ARCHIVES_PAGEDLIST, 
				param: requestParam
			},function(data){
				 if(data && data.length != 0){
					 if(flag){
						 $("#tbodycontent").removeClass("no-data-html").append($("#bodyContentImpl").tmpl(data,helper));
					 }
					 else{
						 $("#tbodycontent").empty().removeClass("no-data-html").append($("#bodyContentImpl").tmpl(data,helper));
					 }
					 $("#noData").show();
				 }else{
					 $("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					 $("#noData").hide();
				 }
			}).init();
		},
		/*
		 * 加载学年、院系、专业、班级		 
		 */
		loadAcademicYearAndRelation : function(){
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", urlTrainplan.GRADEMAJOR_GRADELIST,null);
			// 院系（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",
							urlData.DEPARTMENT_GETDEPTLISTBYCLASS,
							{
								departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value, isAuthority : true
							}, {
								firstText : CONSTANT.PLEASE_SELECT,
								firstValue : ""
							});
			
			//专业
			simpleSelect.loadSelect("majorId", urlTrainplan.GRADEMAJOR_MAJORLIST,null,{ firstText: CONSTANT.PLEASE_SELECT, firstValue: "" });
			
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
									firstText : CONSTANT.PLEASE_SELECT,
									firstValue : "",
									async: false
							});
						studentScoreArchives.majorChange("")
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
						$("#majorId").html("<option value=''>"+CONSTANT.PLEASE_SELECT+"</option>");
						return false;
					}
					simpleSelect.loadSelect("majorId",
						urlTrainplan.GRADEMAJOR_MAJORLIST, reqData, {
							firstText : CONSTANT.PLEASE_SELECT,
							firstValue : "",
							async: false
						});
					studentScoreArchives.majorChange("")
			});
			
			//专业联动班级
			$("#majorId").change(function(){
				studentScoreArchives.majorChange($(this).val())
			});
		},
		/**
		 * 专业Change触发动作
		 * @returns {Boolean}
		 */
		majorChange : function(value){
			if(!value){
		    	   $("#classId").html("<option value=''>"+CONSTANT.PLEASE_SELECT+"</option>");
		    	   return;
				}
			simpleSelect.loadSelect("classId", urlStudentarchives.CLASS_GET_CLASSSELECTBYQUERY,{majorId:value,grade : $("#grade").val()},{ firstText: CONSTANT.PLEASE_SELECT, firstValue: "" });
		},
		/**
		 * 打印
		 */
		print : function(){
			//获取查询参数
			var requestParam = utils.getQueryParamsByFormId("queryForm");
			
			ajaxData.contructor(false);
		    ajaxData.request(urlScore.STUDENT_SCORE_ARCHIVES_PRINT,requestParam,function(data){
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
		}
    }
    module.exports = studentScoreArchives;
    window.scoreAudit = studentScoreArchives;
});
