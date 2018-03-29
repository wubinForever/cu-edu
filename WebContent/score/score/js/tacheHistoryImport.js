/**
 * 学生管理
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
	var urlScore = require("basePath/config/url.score");
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
	var importFilePhono = require("basePath/utils/importFilePhoto");
	var CONSTANT = require("basePath/config/data.constant");// 公用常量 
	var isOnlyChildEnum = require("basePath/enumeration/studentarchives/IsOnlyChild");// 枚举，是否独生子女
	var ArchievesStatus = require("basePath/enumeration/studentarchives/ArchievesStatus");// 枚举，学籍状态
	var AtSchoolStatus = require("basePath/enumeration/studentarchives/AtSchoolStatus");// 枚举，在校状态
	var treeSelect = require("basePath/module/select.tree");//公用下拉树
	
	/**
	 * 学生管理
	 */
	var tacheHistoryImport = {		
		/**
		 * 导入学生信息
		 */
		importExcel : function(){
			var option = {
				extensions : "xlsx", //过滤文件类型
				uploadUrl: urlScore.TACHE_EXPORTTEMPLATE,	//导入文件接口
				data : [{name:"学号/姓名",field:"studentNoOrName"},{name:"环节号/名称",field:"tacheNoOrName"},{name:"导入失败原因",field:"message"}], 	//错误信息显示的字段[{name:"名称",field:"name"}.....]
				exportFailUrl : urlScore.TACHE_EXPORTTEMPLATE,	//导出错误信息接口路径
				successCallback : function(){return true},	//导入成功后回调函数
				ok : function(){return true},	//点击弹窗确定按钮回调函数
				title : "环节历史成绩导入",	//弹出层显示的内容
				templateUrl : urlScore.TACHE_EXPORTTEMPLATE, //下载模板地址
			}
			
			importFileMenu.init(option);
		},
	}
	module.exports = tacheHistoryImport;
	window.student = tacheHistoryImport;
});
