/**
 * 调停课信息
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var helper = require("basePath/utils/tmpl.helper");
	var common = require("basePath/utils/common");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var urlStu = require("configPath/url.studentservice");// 学生服务url
	var urlData = require("configPath/url.data");

	var transferInformation = {
		// 初始化
		init : function() {
			//学年学期 默认当前学年学期
			simpleSelect.loadCommonSmester("academicSemesterSelect",urlStu.ARCHIVESREGISTER_GET_ACADEMICYEARSEMESTER, "", "", "");
		  
		    //学年学期联动班级
		    $("#academicSemesterSelect").change(function(){
	            transferInformation.loadList(); 
			});
            //初始化调停课列表
			this.loadList();
		},
		/**
		 * 加载班级课表集合
		 */
		loadList:function(){
			var me = this;
			if(utils.isNotEmpty($("#academicSemesterSelect").val())){
				var param = {
					academicYear:$("#academicSemesterSelect").val().split("_")[0],
					semesterCode:$("#academicSemesterSelect").val().split("_")[1]
				}
				ajaxData.request(urlStu.TEACHINGARRANGE_GETLESSONLIST, param, function(resData) {
					if (resData.code === config.RSP_SUCCESS && resData.data && resData.data.length > 0) {
						$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(resData.data,helper)).removeClass("no-data-html");
					} else {
						$("#tbodycontent").empty().append("<tr><td colspan='12'></td></tr>").addClass("no-data-html");
					}
				});
			}else{
				$("#tbodycontent").empty().append("<tr><td colspan='12'></td></tr>").addClass("no-data-html");
			}
			
		}
	}

	module.exports = transferInformation; // 根文件夹名称一致
	window.transferInformation = transferInformation;
});