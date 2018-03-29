/**
 * 确认考试课程
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
	
	var examcourse = {
		// 初始化
		init : function() {
			// 添加课程
			$("button[name='addCourse']").bind("click", function() {
				examcourse.popAddCourse();
			});
			
			// 设置考试方式
			$("button[name='setExam']").bind("click", function() {
				examcourse.popsetExam();
			});
		},
		
		/*
		 * 弹框 添加课程
		 */
		popAddCourse : function() {
			art.dialog.open(base+'/examplan/data/examcourse/html/add.html', // 这里是页面的路径地址
			{
				id : 'popAddCourse',// 唯一标识
				title : '添加考试课程',// 这是标题
				width : 1400,// 这是弹窗宽度。其实可以不写
				height : 750,// 弹窗高度*/
				okVal : '确认',
				fixed: true,
				cancelVal : '取消',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
		/*
		 * 弹框 设置考试方式
		 */
		popsetExam : function() {
			art.dialog.open(base+'/examplan/data/examcourse/html/set.html', // 这里是页面的路径地址
			{
				id : 'popsetExam',// 唯一标识
				title : '设置考试方式',// 这是标题
				width : 420,// 这是弹窗宽度。其实可以不写
				height : 200,// 弹窗高度*/
				okVal : '确认',
				fixed: true,
				cancelVal : '取消',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		}
	}
	
	module.exports = examcourse;
	window.examcourse = examcourse;
});