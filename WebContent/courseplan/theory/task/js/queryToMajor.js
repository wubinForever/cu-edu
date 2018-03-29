/**
 * 理论任务查询
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
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var DICTIONARY = require("basePath/config/data.dictionary");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var openMessage = require("../../../common/js/openMessage");
	
	/**
	 * 查询实体
	 */
	var query = {
			
			/**
			 * 年级院系查询
			 */
			init:function(){
				var me = this;
				this.semester = simpleSelect.loadCourseSmester("semester", true);
				simpleSelect.loadCommon("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST,null,"","全部","-1",null);
				$("#department,#grade").change(function(){
					query.loadMajor();
				});
				this.loadDepartment();
				this.loadMajor();
				this.initPagination();
				$("#queryBtn").click(function(){
					query.list();
				});
				$(document).on("click", "button[name='exportBtn']", function() {
					ajaxData.exportFile(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_EXPORT_FORGM, me.getParam());
				});
				openMessage.message("td.open-message", "行政班");
			},
			/**
			 * 加载院系
			 */
			loadDepartment : function(){
			   simpleSelect.loadSelect("department", URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS, {
				   departmentClassCode : "1",
				   isAuthority : true
			   }, {
				   firstText : "全部",
				   firstValue : "-1",
				   async : false
			   });
			}, 
			initPagination:function(){
				this.pagination = new pagination({
					id: "pagination", 
					url: URL_COURSEPLAN.TEACHCLASS_THEORETICAL_PAGE_FORGM, 
					param: this.getParam()
				},function(data){
					if(data && data.length > 0){
						$.each(data, function(i, item){
							if(item.sectionName){
								item.sectionNameTitle = item.sectionName.split("<br/>").join("\r\n");
							}
						});
					}
					$("#tbodycontent").html($("#tableTmpl").tmpl(data)).setNoDataHtml();
					//添加title
					common.titleInit();
				}).init();
			},
			/**
			 *  加载专业
			 */
			loadMajor : function(departmentId){
				var param = {};
				param.departmentId = $("#department").val();
				param.grade = $("#grade").val();
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETMAJOR, JSON.stringify(param),function(data) {
					if(data.code == config.RSP_SUCCESS){
						var list = [];
						$.each(data.data, function(i, item){
							list.push({name: item.majorName, value:item.majorId});
						});
						simpleSelect.installOption($("#major"), list, "-1", "全部","-1" );
					}else{
						popup.errPop("查询失败："+data.msg);
					}
				});
			}, 
			/**
			 * 查询
			 */
			list : function(){
				var me = this;
				var param = me.getParam();
				this.pagination.setParam(param);
			},
			/**
			 * 获取查询参数
			 */
			getParam : function(){
				var param = utils.getQueryParamsByFormObject($("#queryForm"));
				if(param.semester){
					var semster = param.semester.split("_");
					param.academicYear = semster[0];
					param.semesterCode = semster[1];
				}
				return param;
			} 
	}
	module.exports = query;  
});