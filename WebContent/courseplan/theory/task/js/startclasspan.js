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
	var timeNotice = require("../../../common/js/timeNotice");
	
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.udf");
	var URL_DATA = require("basePath/config/url.data");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var DICTIONARY = require("basePath/config/data.dictionary");
	var pagination = require("basePath/utils/pagination");
	
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common"); //复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var ScheduleSettingsEnterPage = require("basePath/enumeration/courseplan/ScheduleSettingsEnterPage");
	
	
	/**
	 * 开课计划对应的理论任务信息
	 */
	var startclasspan = {
		/**
		 * 绑定数据
		 */
		init : function(){
			//判断当前时间是否能进入
			regData ={};
			regData.enterPage = ScheduleSettingsEnterPage.TheoreticalTask.value;
			timeNotice.init(regData);
			
			//绑定学年学期
			//加载当前学年学期
			startclasspan.semester = simpleSelect.loadCourseSmester("semester", true);
			simpleSelect.loadSelect("departmentId",URL_DATA.DEPARTMENT_STARTCLASS_FOR_SELECT, {isAuthority:true},{firstText:"全部",firstValue:""});
			simpleSelect.loadDictionarySelect("courseTypeCode",DICTIONARY.COURSE_TYPE_CODE,{firstText:"全部",firstValue:""}); // 绑定课程类别下拉框	
			simpleSelect.loadDictionarySelect("courseAttributeCode",DICTIONARY.COURSE_ATTRIBUTE_CODE,{firstText:"全部",firstValue:""}); // 绑定课程属性下拉框
			this.loadTeachMethodData();			
			$("#queryBtn").click(function(){
				startclasspan.pagination.setParam(startclasspan.getParam());
			});
			//理论任务设置弹窗
			$(document).on('click', "button[name='taskreset']" ,function(){
				startclasspan.resetLock($(this).prop("id"), $(this).attr("courseId"));
			});
			this.initPagination();
		},
		initPagination:function(){
			this.pagination = new pagination({
				id: "pagination", 
				url: URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETPAGEDLIST, 
				param: this.getParam()
			},function(data){
				$("#tbodycontent").html($("#tableTmpl").tmpl(data)).setNoDataHtml();
				//添加title
				common.titleInit();
			}).init();
		},
		/**
		 * 查询列表
		 */
		list : function(param){
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETLIST, param,function(data) {
				if(data.code == config.RSP_SUCCESS){
					startclasspan.formatHtml(data.data);
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			}, true);
		},
		/**
		 * 获取查询参数
		 */
		getParam : function(){
			return utils.getQueryParamsByFormObject($("#queryForm"));
		},
		/**
		 * 设置html
		 */
		formatHtml : function(data){
			$("#tbodycontent").html($("#tableTmpl").tmpl(data)).setNoDataHtml();
		},
		/**
		 * 查询理论任务设置的状态
		 */
		resetLock : function(startclassPanId, courseId){
			var me = this;
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_LOCK, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if(data.data == true){
						me.resetTask(startclassPanId, courseId);
					}else{
						popup.warPop("后台理论任务数据保存中，请稍后");
					}
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});	
		},
		/**
		 * 理论任务设置弹窗
		 * */
		resetTask : function(startclassPanId, courseId) {
			popup.setData("startclassPanId", startclassPanId);
			var semester = startclasspan.semester.getValue();
			popup.setData("semester", semester);
			popup.setData("courseId", courseId);
			popup.setData("startclasspan", this);
			var me = this;
			this.startclassOpen = popup.open('./courseplan/theory/task/html/startclassset.html', // 这里是页面的路径地址
			{
				id : 'settask',// 唯一标识
				title : '理论任务设置',// 这是标题
				width : 1250,// 这是弹窗宽度。其实可以不写
				height : 680,// 弹窗高度*/
				okVal : '保存',
				cancelVal:"关闭",
				//fixed: true,
				ok : function() {
					var startclassset = popup.getData("startclassset");
					if(startclassset.save()){
						me.pagination.loadData();
						return true;
					} 
					me.pagination.loadData();
					return false;
					
				},
				cancel:function(){
					me.pagination.loadData();
					return true;
				},
				close:function(){
					me.pagination.loadData();
					return true;
				}
			});
		},
		/**
		 * 加载授课方式
		 */
		loadTeachMethodData : function(){
			var me = this;
			ajaxData.request(URL.DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE, { parentCode : DICTIONARY.COURSEPLAN_SKFS_CODE}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					 me.teachMethod = data.data;
				}else{
					popup.errPop("查询失败："+data.msg);
				}
			});		
		}
	}
	module.exports = startclasspan;  
});