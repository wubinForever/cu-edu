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
	var URL_DATA = require("basePath/config/url.data");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	
	//变量名跟文件夹名称一致
	var adjusthanding = {
			// 初始化
			init : function() {
				 
		}
	}
	
	module.exports = adjusthanding; //根文件夹名称一致
});