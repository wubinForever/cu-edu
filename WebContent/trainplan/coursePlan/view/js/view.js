/**
 * 查询开课计划
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("configPath/url.trainplan");
	var UDFURL = require("configPath/url.udf");
	var URLDATA = require("configPath/url.data");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var pagination = require("basePath/utils/pagination");
	var dataDic = require("configPath/data.dictionary");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var base  =config.base;
	/**
	 * 查询开课计划
	 */
	var view = {
		// 初始化
		init : function() {
			//tab切换------
			$(function(){
				var $tabBox = $(".tab-box"),
					$tabLi = $tabBox.children(".tab-hd").find("li");  //注意children()的用法
				$bdCon = $tabBox.children(".tab-bd").find(".bd-con");
				$tabLi.click(function(){
					var index = $(this).index();
					$(this).addClass("cur").siblings("li").removeClass("cur");
					$bdCon.hide().eq(index).fadeIn(300);
				});
			});
			//加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			//加载年级列表
		    simpleSelect.loadCommon("grade", URL.GRADEMAJOR_GRADELIST,null,"","全部","-1",null);
			//加载院系
		    simpleSelect.loadCommon("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},"","全部","",null);
			//初始化专业
		    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,{grade:$("#grade").val(),departmentId:$("#departmentId").val()},{firstText:"全部",firstValue:""});
		    //年级联动专业
			$("#grade").change(function(){
				var reqData={};
				reqData.grade =$(this).val();
			    reqData.departmentId=$("#departmentId").val();
			    simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
			});
			//院系联动专业
			$("#departmentId").change(function(){
				var reqData={};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade").val();
				simpleSelect.loadSelect("majorId", URL.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
			});
			//查询分页
			view.getTrainPlanClassPagedList();
			//点击查询
			$("#query").on("click",function(){
				var param = utils.getQueryParamsByFormId("queryForm");
				view.pagination1.setParam(param);
			})
			//导出
			$(document).on("click", "button[name='export']", function(){
				ajaxData.exportFile(URL.TRAINPLANVIEW_EXPORT,view.pagination1.option.param);
			});
			//加载当前学年学期
			simpleSelect.loadCommonSmester("semester1", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			//加载年级列表
		    simpleSelect.loadCommon("grade1", URL.GRADEMAJOR_GRADELIST,null,"","全部","-1",null);
			//加载院系
		    simpleSelect.loadCommon("departmentId1", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},"","全部","",null);
		  //初始化专业
		    simpleSelect.loadSelect("majorId1", URL.GRADEMAJOR_MAJORLIST,{grade:$("#grade1").val(),departmentId:$("#departmentId1").val()},{firstText:"全部",firstValue:""});
		    //年级联动专业
			$("#grade1").change(function(){
				var reqData={};
				reqData.grade =$(this).val();
			    reqData.departmentId=$("#departmentId1").val();
			    simpleSelect.loadSelect("majorId1", URL.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
			});
			//院系联动专业
			$("#departmentId1").change(function(){
				var reqData={};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade1").val();
				simpleSelect.loadSelect("majorId1", URL.GRADEMAJOR_MAJORLIST,reqData,{firstText:"全部",firstValue:""});
			});
			//加载培养层次
		    simpleSelect.loadDataDictionary("trainingLevelCode", dataDic.ID_FOR_TRAINING_LEVEL,"","全部","");
			//导出
			$(document).on("click", "button[name='export1']", function(){
				ajaxData.exportFile(URL.TRAINPLANVIEW_EXPORTNOCLASS,view.pagination2.option.param);
			});
			//点击查询
			$("#query1").on("click",function(){
				var param = utils.getQueryParamsByFormId("queryForm1");
				param.semester = param.semester1;
				param.grade = param.grade1;
				param.departmentId= param.departmentId1;
				param.majorId =param.majorId1;
				param.classType =param.classType1;
				view.pagination2.setParam(param);
			})
			view.getTrainPlanNoClassPagedList();
		},
		
		//查询行政班级
		getTrainPlanClassPagedList:function(){
			view.pagination1 = new pagination({
				id: "pagination", 
				url: URL.TRAINPLANVIEW_GETPAGEDLIST, 
				param: {semester:$("#semester").val()}
			},function(data){
				 $("#pagination").show();
				 if(data && data.length != 0){
					 $("#classtbodycontent").removeClass("no-data-html").empty().append($("#classbodyContentImpl").tmpl(data));
				 }else{
					 $("#classtbodycontent").empty().append("<tr><td colspan='22' ></td></tr>").addClass("no-data-html");
					 $("#pagination").hide();
				 }
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			}).init();
		},
		
		//查询不到行政班级
		getTrainPlanNoClassPagedList:function(){
			view.pagination2 = new pagination({
				id: "pagination1", 
				url: URL.TRAINPLANVIEW_GETNOCLASSLIST, 
				param: {semester:$("#semester1").val()}
			},function(data){
				 $("#pagination1").show();
				 if(data && data.length != 0){
					 $("#noclasstbodycontent").removeClass("no-data-html").empty().append($("#noclassbodyContentImpl").tmpl(data));
				 }else{
					 $("#noclasstbodycontent").empty().append("<tr><td colspan='22'></td></tr>").addClass("no-data-html");
					 $("#pagination1").hide();
				 }
				 $('#check-all1').removeAttr("checked").parent().removeClass("on-check");//如果是暂无数据的进行清除
			}).init();
		}
	
	}
	module.exports = view;
	window.department = view;
});

