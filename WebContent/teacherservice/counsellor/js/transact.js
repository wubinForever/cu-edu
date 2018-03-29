/**
 * 学生报到
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var url = require("configPath/url.teacherservice");// 教师服务url
	var urlData = require("configPath/url.data");
	var dataDictionary = require("configPath/data.dictionary");// 数据字典
	var helper = require("basePath/utils/tmpl.helper");
    var validate = require("basePath/utils/validateExtend");
	var CONSTANT = require("basePath/config/data.constant");// 公用常量 
	var reportStatus = require("basePath/enumeration/studentarchives/ReportStatus");//状态枚举
	var mapUtil = require("basePath/utils/mapUtil");
	/**
	 * 
	 */
	var transact = {	
	   /**
		 * 查询条件
		 */		
		queryObject : {},
		data:new mapUtil(),		

		/**
		 * 学生报到
		 */
		init : function() {
			popup.data("transact", transact);
			transact.transactInit();
		},
  	  /**
	  * 办理报到 弹窗
	  */
	  transactSave: function(){
	  	    var flag = false;
			var reqData=utils.getQueryParamsByFormId("addWorkForm");
			reqData.userIds = popup.data("arraUserIds");	
			ajaxData.contructor(false);
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(url.TEACHER_TRANSACT,JSON.stringify(reqData),function(rvData) {
				if(rvData && rvData.code == config.RSP_SUCCESS){
				    flag = true;
				 }else{
					popup.errPop(rvData.msg);
				 }
			});
			return flag;
		},
		/**
		 * 报到弹窗初始化
		 */
		transactInit:function(){
			var reqData = popup.data("param");// 获取主页面的参数
			if (reqData == null || utils.isEmpty(reqData.academicYearSemester)){
				// 提示失败
				popup.errPop("学年学期不能为空");
				return false;
			}
		 	var academicYearSemester = reqData.academicYearSemester;
			// 学年学期 默认生效学年学期
			 simpleSelect.loadCommonSmester("academicYearSemesterSelect",urlData.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
			$("#academicYearSemester").val(academicYearSemester);	
			
			var newreportStatus=reportStatus;
			delete newreportStatus.notHandled;
			//报到状态
			simpleSelect.loadEnumSelect("reportStatus",newreportStatus,{firstText:"",firstValue:newreportStatus.reported.value});
			$("#academicYearSemesterSelect").prop("disabled","disabled");	
	  }
    }
	module.exports = transact;
	window.transact = transact;
});
