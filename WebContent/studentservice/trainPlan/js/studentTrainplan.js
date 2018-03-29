/**
 * 学生培养方案js
 */
define(function(require, exports, module) {
	
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var urlStu = require("configPath/url.studentarchives");// 学籍url
	var url = require("configPath/url.studentservice");// 学生服务url
	var dataDictionary = require("configPath/data.dictionary");// 数据字典
    var validate = require("basePath/utils/validateExtend");
	var dataConstant = require("basePath/config/data.constant");// 公用常量 
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	
	var studentTrainplan = {	
	
		init : function(){
			//加载学期
			simpleSelect.loadDataDictionary("semesterCode",dataDictionary.SEMESTER, null,"全部","");
			//加载学年
			simpleSelect.loadSelect("academicYear",url.GET_ACADEMICYEAR,null, {firstText : "全部",firstValue : "",length:17});
			//加载当前学生所在的年级专业
			studentTrainplan.getItem();
			//加载课程主列表
			studentTrainplan.getCourseList();
			//加载环节
			studentTrainplan.getTacheList();
			//查询按钮
			$("#query").on("click",function(){
				studentTrainplan.getCourseList();
				studentTrainplan.getTacheList();
			});
		},
		//加载学生详情
		getItem:function(){
			//同步
			ajaxData.contructor(false);
		    ajaxData.request(url.STUDENT_GETITEM,null,function(data){
		    	if(data.code==config.RSP_SUCCESS)
		    	{
		    		$("#majorIds").text(data.data.majorNo==null ? "" : "["+data.data.majorNo+"]"+data.data.majorName);
		    		$("#grades").text(data.data.grade==null ? "" : data.data.grade+"级");
		    		$("#majorId").val(data.data.majorId);
		    		$("#grade").val(data.data.grade);
				}
		    });
		},
		
		//加载课程主列表
		getCourseList:function(){
			var reqData = {};
			reqData.academicYear =  $("#academicYear").val();
			reqData.semesterCode = $("#semesterCode").val();
			reqData.courseOrTache = 1;
			reqData.grade = $("#grade").val();
			reqData.majorId = $("#majorId").val();
			ajaxData.contructor(true);//异步
		    ajaxData.request(url.GET_LIST_TRAIN_PLAN,reqData,function(data){
	    		 if(data.data && data.data.length != 0)
	    		 {
					 $("#courseContent").removeClass("no-data-html").empty().append($("#courseContentImpl").tmpl(data.data));
				 }else 
				 {
					$("#courseContent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
				
		    },true);
		},
		
		//加载环节主列表
		getTacheList:function(){
			var reqData = {};
			reqData.academicYear =  $("#academicYear").val();
			reqData.semesterCode = $("#semesterCode").val();
			reqData.courseOrTache = 2;
			reqData.grade = $("#grade").val();
			reqData.majorId = $("#majorId").val();
			ajaxData.contructor(true);//异步
		    ajaxData.request(url.GET_LIST_TRAIN_PLAN,reqData,function(data){
	    		 if(data.data && data.data.length != 0)
	    		 {
					 $("#tacheContent").removeClass("no-data-html").empty().append($("#tacheContentImpl").tmpl(data.data));
				 }else 
				 {
					$("#tacheContent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
				 }
		    },true);
		}
		
	}
	module.exports =studentTrainplan;
	window.studentTrainplan =studentTrainplan;
});
