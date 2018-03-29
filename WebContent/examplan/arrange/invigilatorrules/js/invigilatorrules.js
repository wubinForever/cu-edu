/**
 * 课程特殊要求设置
 */
define(function(require, exports, module) {
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
	
	var URL = require("basePath/config/url.udf");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dictionary = require("basePath/config/data.dictionary");
	var base = config.base;
	
	var invigilatorrules = {
		// 初始化
		init : function() {
			// 监考要求设置
			$("button[name='setInvigilation']").bind("click", function() {
				invigilatorrules.popSetInvigilation();
			});
		},
		
		/*
		 * 弹框 监考要求设置
		 */
		popSetInvigilation : function() {
			art.dialog.open(base+'/examplan/arrange/invigilatorrules/html/set.html', // 这里是页面的路径地址
			{
				id : 'popSetInvigilation',// 唯一标识
				title : '监考要求设置',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 450,// 弹窗高度*/
				okVal : '确定',
				fixed: true,
				cancelVal : '取消',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				},
			});
		}
		
		
	}
	
	module.exports = invigilatorrules;
	window.invigilatorrules = invigilatorrules;
});