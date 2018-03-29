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
	
	var autoarrange = {
		// 初始化
		init : function() {
			// 智能排考
			$("button[name='autoarrange']").bind("click", function() {
				autoarrange.popAutoArrange();
			});
			// 选择场次
			$("button[name='selectSession']").bind("click", function() {
				autoarrange.popSelectSession();
			});
			// 选择课程
			$("button[name='selectCourse']").bind("click", function() {
				autoarrange.popSelectCourse();
			});
			// 设置
			$("button[name='setPeopleNumber']").bind("click", function() {
				autoarrange.popPeopleNumber();
			});
		},
		
		/*
		 * 弹框 智能排考
		 */
		popAutoArrange : function() {
			art.dialog.open(base+'/examplan/arrange/autoarrange/html/autoArrange.html', // 这里是页面的路径地址
			{
				id : 'popAutoArrange',// 唯一标识
				title : '智能排考',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 620,// 弹窗高度*/
				okVal : '关闭',
				fixed: true,
				//cancelVal : '关闭',
				ok : function() {
				},
				/*cancel : function() {
					// 取消逻辑
				}*/
			});
		},
		
		//弹框 选择场次 
		popSelectSession : function() {
			art.dialog.open(base+'/examplan/arrange/autoarrange/html/selectSession.html', // 这里是页面的路径地址
			{
				id : 'popSelectSession',// 唯一标识
				title : '选择场次',// 这是标题
				width : 900,// 这是弹窗宽度。其实可以不写
				height : 520,// 弹窗高度*/
				okVal : '确定',
				fixed: true,
				cancelVal : '关闭',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				},
			});
		},
		
		//弹框 选择课程 
		popSelectCourse : function() {
			art.dialog.open(base+'/examplan/arrange/autoarrange/html/selectCourse.html', // 这里是页面的路径地址
			{
				id : 'popSelectCourse',// 唯一标识
				title : '选择课程',// 这是标题
				width : 1400,// 这是弹窗宽度。其实可以不写
				height : 620,// 弹窗高度*/
				okVal : '确定',
				fixed: true,
				cancelVal : '关闭',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				},
			});
		},
		
		//弹框 辅监考人数设置
		popPeopleNumber : function() {
			art.dialog.open(base+'/examplan/arrange/autoarrange/html/set.html', // 这里是页面的路径地址
			{
				id : 'popPeopleNumber',// 唯一标识
				title : '辅监考人数设置',// 这是标题
				width : 500,// 这是弹窗宽度。其实可以不写
				height : 400,// 弹窗高度
				okVal : '确定',
				fixed: true,
				cancelVal : '关闭',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				},
			});
		}
		
	}
	
	module.exports = autoarrange;
	window.autoarrange = autoarrange;
});