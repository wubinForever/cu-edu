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
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var base = config.base;
	
	//变量名跟文件夹名称一致
	var arrange = {
			// 初始化
			init : function() {
				//小组新增
				$("button[name='addgroup']").on('click',function(){
					arrange.addGroup();
				});
				//添加学生
				$(document).on("click", "button[name = 'studentadd']", function(){
						arrange.addStu();
				});
			},					
		//小组新增弹窗
		addGroup : function() {
			art.dialog.open(base+'/courseplan/practice/arrange/html/add.html', // 这里是页面的路径地址
			{
				id : 'addgroup',// 唯一标识
				title : '小组新增',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 650,// 弹窗高度*/
				okVal : '关闭',
				fixed: true,
				ok : function() {
				},
			});
		},
		//添加学生
		addStu : function() {
			art.dialog.open(base+'/courseplan/practice/arrange/html/addstudent.html', // 这里是页面的路径地址
			{
				id : 'addstu',// 唯一标识
				title : '添加学生',// 这是标题
				width :800,// 这是弹窗宽度。其实可以不写
				height : 550,// 弹窗高度*/
				fixed: true,
				ok: function () {
			        return false;
			    },
			    cancel: true
			});
		}
	}
	
	module.exports = arrange; //根文件夹名称一致
	window.arrange = arrange;    //根据文件夹名称一致
});