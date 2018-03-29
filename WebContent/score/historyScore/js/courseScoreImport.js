/**
 * 课程历史成绩导入
 */
define(function(require, exports, module) {
	
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	var urlData = require("basePath/config/url.data");
	var urlTrainplan = require("basePath/config/url.trainplan");
	var urlUdf = require("basePath/config/url.udf");
	var dataDictionary = require("basePath/config/data.dictionary");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var uploaderFile = require("basePath/base/core/uploadUtil"); //文件上传帮助
	var businessModule = require("basePath/config/module"); //文件上传帮助
	var urlFilesystem = require("basePath/config/url.filesystem");
	var validate = require("basePath/utils/validateExtend");
	var helper = require("basePath/utils/tmpl.helper");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	var base  =config.base;
	var importUtils = require("basePath/utils/importUtils");
	var importFileMenu = require("basePath/utils/importFileMenu");
	var url = require("basePath/config/url.score");
	/**
	 * 课程历史成绩导入
	 */
	var courseScoreImport = {				
			
		/**
		 * 导入课程历史成绩
		 */
		importExcel : function(){
			var option = {
				extensions : "xlsx", //过滤文件类型
				uploadUrl: url.IMPORT_COURSE_HISTORY_SCORE,	//导入文件接口
				data : [{name:"学号/姓名",field:"studentNoOrName"},{name:"课程号/课程名称",field:"courseNoOrName"},{name:"导入失败原因",field:"message"}], 	//错误信息显示的字段[{name:"名称",field:"name"}.....]
				exportFailUrl : url.EXPORT_COURSE_HISTORY_SCORE_FAIL_MESSAGE,	//导出错误信息接口路径
				successCallback : function(){return true},	//导入成功后回调函数
				ok : function(){return true},	//点击弹窗确定按钮回调函数
				title : "课程历史成绩导入",	//弹出层显示的内容
				templateUrl : url.COURSE_HISTORY_SCORE_TEMPLATE //下载模板地址
			}
			
			importFileMenu.init(option);
		}
	}
	module.exports = courseScoreImport;
	window.courseScoreImport = courseScoreImport;
});
