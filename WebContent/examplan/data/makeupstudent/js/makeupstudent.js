/**
 * 确认缓考学生
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
	
	var makeupstudent = {
		// 初始化
		init : function() {
			// 添加课程
			$("button[name='addMakeupstudent']").bind("click", function() {
				makeupstudent.popAddMakeupstudent();
			});
			
		},
		
		/*
		 * 弹框 添加课程
		 */
		popAddMakeupstudent : function() {
			art.dialog.open(base+'/examplan/data/makeupstudent/html/add.html', // 这里是页面的路径地址
			{
				id : 'popAddMakeupstudent',// 唯一标识
				title : '添加缓考学生',// 这是标题
				width : 1400,// 这是弹窗宽度。其实可以不写
				height : 750,// 弹窗高度*/
				okVal : '保存',
				fixed: true,
				cancelVal : '取消',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				},
				button: [
					{
		            name: '保存',
		            focus:true,//按钮高亮
		            callback: function () {
		            },
		            focus: true
			        },
			        {
		            name: '保存并继续',
		            focus:true,//按钮高亮
		            callback: function () {
		            },
		            focus: true
			        }
				]
			});
		},
		
	}
	
	module.exports = makeupstudent;
	window.makeupstudent = makeupstudent;
});