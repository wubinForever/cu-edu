﻿define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var validate = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	var url = require("basePath/config/url.graduation");
	//var url = require("basePath/config/url.studentarchives");
	var dataurl = require("basePath/config/url.data");
	// 枚举
	var isCurrentSemester = require("basePath/enumeration/common/IsCurrentSemester");
	
	// 下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");

	var URL = require("basePath/config/url.courseplan");
	var URLDATA = require("basePath/config/url.data");
	var dictionary = require("basePath/config/data.dictionary");
	
	var base = config.base;
	
	// 变量名跟文件名称一致
	var graduationYear = {
		init : function() {
			graduationYear.loadData();
		},
		loadData:function(){
        	// 加载属性
   			ajaxData.request(url.GRAD_GRAUATEDATESET_GET, "", function(data) {
   				// 毕业年届
   				$("#schoolWeek").val(data.graduateYear);
   				// 毕业时间
   			    $("#schoolCreateYear").val(new Date(data.graduateDate).format("yyyy-MM-dd"));
				//ID
				$("#schoolCreateYear").attr("data-value",data.graduateDateSetId);
				
				validate.validateEx();
				// 保存
				$(document).on("click", "#submitBtn", function() {
					graduationYear.update();
					
				});
				graduationYear.spinnerNumber();//重写spinnerNumber函数
				
   			},true);
        },
		//修改
		update:function(){
			var updateParams={};
			//判断毕业年届是否为空
			if($("#schoolWeek").val()==null || $("#schoolWeek").val()==''){
				popup.warPop("毕业年届不能为空");
			}else if($("#schoolCreateYear").val()==null || $("#schoolCreateYear").val()==''){
				popup.warPop("毕业日期不能为空");
			}else{
				var v = $("#addForm").valid();
				if(v){
	                updateParams["graduateYear"] = $("#schoolWeek").val();
					updateParams["graduateDate"] = $("#schoolCreateYear").val();
					updateParams["graduateDateSetId"] = $("#schoolCreateYear").attr("data-value");
					var year = $("#schoolWeek").val();
					var d = $("#schoolCreateYear").val().split('-')[0];
					if(year != d){
						popup.okPop("毕业年届与毕业日期的年份应一致", function() {
						});
					}else{
						ajaxData.request(url.GRAD_GRAUATEDATESET_UPDATE, updateParams, function(data) {
							if (data.code == config.RSP_SUCCESS) {
								// 提示成功
								popup.okPop("保存成功", function() {
								});
							} else {
								// 提示失败
								popup.errPop(data.msg);
								return false;
							}
						});	
					}
				}
			}
		},
		yearChange:function(year){
			var d = $("#schoolCreateYear").val();
			var year = $("#schoolWeek").val();
			var yearn = d.split('-')[0];
			if(yearn != year){
				$("#schoolCreateYear").val(year + '-07-01');
			}
		},
		spinnerNumber :function(){
			$(".spinner").each(function(){
				var spinner = $(this);
				var input = spinner.find("input");
				spinner.find(".btn:last-of-type").unbind("click",null);
				spinner.find(".btn:first-of-type").unbind("click",null);
				input.unbind("change",null);

				spinner.find(".btn:last-of-type").click(function(event){
					var inputVal = (parseInt(input.val(), 10) || 0) - 1;
					var min = parseInt(input.attr("min"));
					if(!min || inputVal >= min){
						input.val(inputVal);
					}
					event.stopPropagation();    //  阻止事件冒泡
					graduationYear.yearChange();
				});
				spinner.find(".btn:first-of-type").click(function(event){
					var inputVal = (parseInt(input.val(), 10) || 0) + 1;
					var max = parseInt(input.attr("max"));
					if(!max || inputVal <= max){
						input.val(inputVal);
					}
					event.stopPropagation();    //  阻止事件冒泡
					graduationYear.yearChange();
				});
				input.change(function(){
					var currentValue = parseInt($(this).val());
					var min = parseInt(input.attr("min"));
					var max = parseInt(input.attr("max"));
					if(isNaN(currentValue)){
						$(this).val("");
						$("#schoolCreateYear").val('');
						return ;
					} 
					if(min && currentValue <= min){
						currentValue = min;
						$(this).val(currentValue);
					}
					if(max && currentValue >= max){
						currentValue = max;
						$(this).val(currentValue);
					}
					
					//去除左侧0
					if(currentValue == 0){
				    	$(this).val("0");
				    }else{
				    	$(this).val((currentValue+"").replace(/\b(0+)/gi,""));
				    } 
				    graduationYear.yearChange();
				});
			});
		},
	}
	
	module.exports = graduationYear; // 根据文件名称一致
	window.graduationYear = graduationYear; // 根据文件名称一致
});