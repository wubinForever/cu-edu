/**
 * 按时间区段查看
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
	
	var timessearch = {
		init : function() {
			// 考生名单
			$("a[name='examineeList']").bind("click", function() {
				timessearch.popexamineeList();
			});
		},
		
		/*
		 * 弹框 教室类型要求
		 */
		popexamineeList : function() {
			art.dialog.open(base+'/examplan/arrange/timessearch/html/view.html', // 这里是页面的路径地址
			{
				id : 'popexamineeList',// 唯一标识
				title : '查看考场考生名单',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 650,// 弹窗高度*/
				okVal : '关闭',
				fixed: true,
				ok : function() {
				},
			});
		}
	}
	
	module.exports = timessearch;
	window.timessearch = timessearch;
});