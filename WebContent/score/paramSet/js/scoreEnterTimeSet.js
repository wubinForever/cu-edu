/**
 * 成绩录入时间设置
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var urlSCORE = require("configPath/url.score");
	var urlData = require("configPath/url.data");
	var urlUdf = require("configPath/url.udf");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var validate = require("basePath/utils/validateExtend");
	var dataDictionary=require("configPath/data.dictionary");
	
	/**
	 * 成绩录入时间设置
	 */
	var scoreEnterTimeSet = {
		// 初始化
		init : function() {
			var courseIds = popup.data("courseIds");
			var beginTime = popup.data("beginTime");
			var endTime = popup.data("endTime");
			if(courseIds.length==1){
				if(beginTime != " "){
					$("#beginTime").val(beginTime);
					$("#endTime").val(endTime);
				}
				else{
					$("#beginTime").val("");
					$("#endTime").val("");
				}
			}
			else{
				$("#beginTime").val("");
				$("#endTime").val("");
			}
			
			popup.data("scoreEnterTimeSet", this);
			
			scoreEnterTimeSet.validation();
		},
		getParam:function(){
			var param = {};
			param.beginTime = $("#beginTime").val();
			param.endTime = $("#endTime").val();
			
			return param;
		},
		valid:function(){
			var v = $("#setForm").valid();// 验证表单
			
			return v;
		},
		/**
		 * 绑定验证事件
		 */
		validation : function() {
			// 校验
			validate.validateEx();
			// 验证
			$("#setForm").validate(
					{
						rules : {
							beginTime : {
								required : true
							},
							endTime : {
								required : true
							}
						},
						messages : {
							beginTime : {
								required : '开始时间不能为空'
							},
							endTime : {
								required : '结束时间不能为空'
							}
						},
						// 定义公用的错误提示内容，暂时保留
						errorPlacement : function(error, element) {
							var parent = $(element).parent("div.tips-text")
									.append(error);
						},
						onchange : function(ele) {
							$(ele).valid();
						},
						onfocusout : function(ele) {
							$(ele).valid();
						}
					})
		}
	}
	module.exports = scoreEnterTimeSet;
	window.scoreEnterTimeSet = scoreEnterTimeSet;
});
