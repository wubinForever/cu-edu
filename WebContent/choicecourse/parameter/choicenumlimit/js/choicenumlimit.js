/**
 * 设置选课人数上限js
 */
define(function (require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.trainplan");
	var URLDATA = require("basePath/config/url.data");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var calculationType = require("basePath/enumeration/choicecourse/CalculationWay");// 计算类别
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dataDictionary=require("basePath/config/data.dictionary");
	var helper = require("basePath/utils/tmpl.helper");
	var base = config.base;
	/**
	 * 设置学分及门数上限
	 */
	//模块化
	var choicenumlimit = {
		isFocus : false,
		queryObjectParam : {},
		init:function(){
			// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URLDATA.COMMON_GETSEMESTERLIST,"","","");
			// 加载年级列表
		    /*simpleSelect.loadCommon("grade", URL.GRADEMAJOR_GRADELIST,null,"","全部","",null);*/
		    // 绑定开课单位下拉框（从数据库获取数据）
			simpleSelect.loadSelect("departmentId",URLDATA.DEPARTMENT_STARTCLASS_FOR_SELECT, null,{firstText:"全部",firstValue:""});
			// 绑定课程大类下拉框（从数据字典获取数据）
			simpleSelect.loadDictionarySelect("teachingMethodsCode",dataDictionary.COURSEPLAN_SKFS_CODE,{firstText:"全部",firstValue:""});
			/*// 绑定加减乘除
			simpleSelect.loadEnumSelect("calculationType",calculationType,{defaultValue:-1,firstText:"全部",firstValue:-1});*/
			// 全局参数初始化
			choicenumlimit.queryObjectParam = choicenumlimit.queryObject();
			// 初始化绑定数据
			choicenumlimit.getList();
			//表格文字点击切换输入框
			/*$(document).on("click", ".edit-td", function(e){
				choicenumlimit.editTdShow(e);
				e.stopPropagation();
			});
			$(document).on("click", ".edit-td input", function(e){
				e.stopPropagation();				
			});*/
			//查询按钮
			$("#query").on("click",function(){
				choicenumlimit.queryObjectParam = choicenumlimit.queryObject();
				choicenumlimit.getList();
			});
			//给input绑定onBlur事件 
			$(document).on("blur", "input[myattr='limit']", function(obj) {
				choicenumlimit.inputOnBlur(this);
			});
			//批量设置按钮
			$("#batchSetup").on("click",function(){
				choicenumlimit.batchSetup();
			});
			// 权限
			authority.init();
		},
		
		/**
		 * 获取查询条件
		 */
		queryObject : function() {
			var param = utils.getQueryParamsByFormId("queryForm");
			if (param.semester) {
				param.academicYear = param.semester.split("_")[0];
				param.semesterCode = param.semester.split("_")[1];
			}		
			delete param.semester;
			return param;
		},
		
		/**
		 * input失去焦点
		 */
		inputOnBlur : function(obj){
			var reg = /^([1-4][0-9]{2}|500|[1-9]?[0-9])$/;
			var limitValue = $(obj).val().replace(/^\s*|\s*$/g, "");
			var choicedNum = $(obj).attr("data-tt-choiced");
			// 如果是格式不正确或清空数据则提示输入0~500之间的整数
			if(limitValue == "" || !reg.test(limitValue)){
				popup.warPop("请输入0~500之间的整数");
				choicenumlimit.isFocus = true;
				$(obj).focus();			
				return false;
			}
			// 如果输入值小于已选人数，则不允许保存
			else if(parseInt(limitValue) < parseInt(choicedNum)){
				popup.warPop("可选人数上限不能小于已选人数");
				choicenumlimit.isFocus = true;
				$(obj).focus();			
				return false;
			}
			else{	
				choicenumlimit.isFocus = false;
			}
			// 失去焦点触发保存事件
			if(!choicenumlimit.isFocus){					
				choicenumlimit.setup(obj);
			}	
		},
		
		/**
		 * 绑定已排课的教学任务
		*/
		getList : function() {
			var reqData = choicenumlimit.queryObjectParam;//获取查询参数
			ajaxData.request(URL_CHOICECOURSE.CHOICENUMLIMIT_GETLIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data.code == config.RSP_SUCCESS) {
					if (data != null && data.data.length > 0) {
						$("#list").val(data.data[0].list);
						$("#tbodycontent").html($("#tamplContent").tmpl(data.data, helper));
					}
					else{
						$("#list").val("");
						$("#tbodycontent").html($("#tableTmpl").tmpl(data)).setNoDataHtml();
					}
				}
				else {
					$("#list").val("");
					popup.errPop("查询失败："+data.msg);
				}
			},true);
		},
		
		/**
		 * 点击单元格显示输入框
		*/ 
		editTdShow : function(obj){
			var _this = $(obj.currentTarget);
			_this.parents("#tbodycontent").find("input.td-edit-inp").hide().prev("span").show();			
		    _this.children("span").hide().next("input.td-edit-inp").show().focus();
		},
		
		/**
		 * 批量设置
		*/
	    batchSetup : function() {
			var reqData = choicenumlimit.queryObjectParam;//获取查询参数
		    if(reqData.academicYear == null || reqData.academicYear == ""){
			   popup.warPop("请选择学年学期");
			   return false;
		    }
		    if($("#list").val() == "" || $("#list").val() == null){
				  popup.warPop("无数据可设置");
				  return false;
			}
			var params = {};
			params.list = $("#list").val();
			params.choiceLimitType = $("#choiceLimitType").val();
			params.calculationWay = $("#calculationWay").val();
			params.choiceNum = $("#choiceNum").val().replace(/(\s*$)/g, "");
			params.isBatchSetup = 1;
			if(params.calculationWay == 4 && params.choiceNum == 0){
				popup.warPop("被除数不能为0");
				return false;
			}
			if(params.choiceNum.replace(/(\s*$)/g, "") == ""){
				popup.warPop("请输入0~500的整数");
				return false;
			}
			ajaxData.request(URL_CHOICECOURSE.CHOICENUMLIMIT_UPDATE,params, function(data) {
				 if (data.code == config.RSP_SUCCESS) {
					  // 提示成功
					  popup.okPop("保存成功", function() {
					  });
					  // 刷新列表
					  choicenumlimit.getList();
				 } 
				 else{
					  // 提示失败信息
					  popup.warPop(data.msg);
					  return false;
				 } 
		    },true);
	    },
	    
	    /*
	     * 行列编辑保存
	     */
	    setup : function(obj) {
	    	 var params = {};
	    	 var value = $(obj).val();
	    	 params.list = $(obj).attr("data-tt-id") + "|"+ $(obj).attr("data-tt-capacity") + "|" + $(obj).attr("data-tt-choiced");
	    	 params.isBatchSetup = 2;
			 params.choiceNum = value.replace(/(\s*$)/g, "");
	    	 ajaxData.request(URL_CHOICECOURSE.CHOICENUMLIMIT_UPDATE,params, function(data) {
				 if (data.code == config.RSP_SUCCESS) {
					/*var cmdata = $(obj).val();
					$(obj).hide();
				    $(obj).siblings('span').text(cmdata).show();*/
				 } 
				 else {
					  // 提示失败
					   popup.errPop(data.msg);
					   $(obj).focus();
					   return false;
				 }
			  });
	    }
		/** ********************* end ******************************* */
	}
	module.exports = choicenumlimit;
	window.choicenumlimit = choicenumlimit;
});	