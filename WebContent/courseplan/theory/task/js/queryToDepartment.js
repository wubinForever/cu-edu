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
			 * 开课单位查询
			 */
			init:function(){
				var me = this;
				this.semester = simpleSelect.loadCourseSmester("semester", true);
				simpleSelect.loadSelect("departmentId",URL_DATA.DEPARTMENT_STARTCLASS_FOR_SELECT, {isAuthority:true},{firstText:"全部",firstValue:""});
				this.initPagination();
				$("#queryBtn").click(function(){
					query.list();
				}).click();
				$(document).on("click", "button[name='exportBtn']", function() {
					ajaxData.exportFile(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_EXPORT_FORDEPART, me.getParam());
				});
				openMessage.message("td.open-message", "行政班");
				
			},
			initPagination:function(){
				this.pagination = new pagination({
					id: "pagination", 
					url: URL_COURSEPLAN.TEACHCLASS_THEORETICAL_PAGE_FORDEPT, 
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
			 * 加载开课单位
			 */
			loadDepartment : function(){
				var param = {};
				var me = this;
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETDEPARTMENT, JSON.stringify(param),function(data) {
					if(data.code == config.RSP_SUCCESS){
						var list = [];
						$.each(data.data, function(i, item){
							list.push({name: item.departmentName, value:item.departmentId});
						});
						simpleSelect.installOption($("#department"), list, "-1", "全部","-1" );
						
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