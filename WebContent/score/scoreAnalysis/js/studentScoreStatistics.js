/**
 * 学生成绩统计
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var urlScore = require("configPath/url.score");
	var urlData = require("configPath/url.data");
	var dataConstant = require("configPath/data.constant");
	var pagination = require("basePath/utils/pagination");
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var scoreCategory = require("basePath/enumeration/score/ScoreCategory");// 枚举，成绩类别
	var popup = require("basePath/utils/popup");
	/**
	 * 环节成绩分制
	 */
	var studentScoreStatistics = {
			// 初始化
			init : function() {
				
				//未通过课程/环节查看
				$("a[name='course-check']").click(function(){
					studentScoreStatistics.courseCheck();
				});
				
			},
			
			//弹框  未通过课程/环节查看
			courseCheck : function(){
				popup.open('./score/scoreAnalysis/html/check.html', // 这里是页面的路径地址
				{
					id : 'checkCourse',
					title : '未通过课程/环节查看',
					width : 800,
					height : 650,
					button : [ 
					  {
						name : '关闭',
						callback : function() {}
					  }
					]
				});
			}
	}
	
	module.exports = studentScoreStatistics;
    window.studentScoreStatistics = studentScoreStatistics;
	
});