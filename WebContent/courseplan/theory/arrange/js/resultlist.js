/**
 * 排课结果
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); // 复选单选
	var pagination = require("basePath/utils/pagination");
	var timeNotice = require("../../../common/js/timeNotice");
	

	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");

	// URL
	var URL = require("basePath/config/url.udf");
	var URLDATA = require("basePath/config/url.data");
	var urlCoursePlan = require("basePath/config/url.courseplan");
	var dictionary = require("basePath/config/data.dictionary");
	var constant = require("basePath/config/data.constant");
	var ScheduleSettingsEnterPage = require("basePath/enumeration/courseplan/ScheduleSettingsEnterPage");
	var openMessage = require("../../../common/js/openMessage");
	

	// 变量名跟文件夹名称一致
	var resultlist = {
		// 初始化
		init : function() {
			//判断当前时间是否能进入
			regData ={};
			regData.enterPage = ScheduleSettingsEnterPage.ScheduleArrange.value;
			timeNotice.init(regData);
			
			// 默认加载当前排课学年学期
			var semester = simpleSelect.loadCourseSmester("academicSemester", true);
			this.semester = semester;

			// 绑定开课单位下拉框
			simpleSelect.loadAuthStartClass("departmentId", {isAuthority : true}, "", constant.SELECT_ALL, "");

			// 初始加载列表数据，根据学年学期
			var param = {};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
			resultlist.pagination = new pagination({
				url : urlCoursePlan.ARRANGE_SCHEDULE_GETLIST,
				param : param
			}, function(data) {
				if (data.length > 0) {
					$.each(data, function(i, item){
						item.classesarr = item.classes ? item.classes.split(",") : "";
					});
					$("#tbodycontent").empty().append($("#tableTmpl").tmpl(data)).removeClass("no-data-html");
					$("#pagination").show();
					//添加title
					common.titleInit();
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='14'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
				// 取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();

			this.bindEvent();
			openMessage.message(".open-message", "行政班");
		},
		/**
		 * 绑定事件
		 */
		bindEvent:function(){
			// 查询
			$("#query").click(function(){
				resultlist.pagination.setParam(resultlist.getQueryParam());
			});
			
			// 删除
			$("#delete").click(function(){
				resultlist.deleteArrangeTask();
			});
			
			// 导出
			$("#export").click(function(){
				ajaxData.exportFile(urlCoursePlan.ARRANGE_SCHEDULE_EXPORT, resultlist.pagination.option.param);
			});
		},
		/**
		 * 获取查询条件
		 */
		getQueryParam:function(){
			var param={};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
			param.departmentId = $("#departmentId").val();
			param.courseNoOrName = $("#courseNoOrName").val();
			param.teacherNoOrName = $("#teacherNoOrName").val();
			param.schedulingType = $("#schedulingType").val();
			param.lockStatus = $("#lockStatus").val();
			
			return param;
		},
		/**
		 * 删除排课任务
		 */
		deleteArrangeTask : function() {
			var me = this;
			var ids = me.getCheckedIds();
			if (ids.length === 0) {
				popup.warPop("请先选择记录");
				return false;
			}
			popup.askDeletePop("记录", function() {
				var reqData = {};
				reqData.schedulingTaskIds = ids;
				ajaxData.request(urlCoursePlan.ARRANGE_MANUALARRANGE_DELETE, reqData, function(data) {
					if (data.code === config.RSP_SUCCESS) {
						me.pagination.setParam(resultlist.getQueryParam());
						//取消全选
						$('#check-all').removeAttr("checked").parent().removeClass("on-check");
					} else {
						// 提示失败
						popup.errPop("删除失败");
						return false;
					}
				});
			});
		},
		
		/**
		 * 获取选中的排课结果
		 */
		getCheckedIds : function() {
			var me = this;
			var ids = [];
			var checkList = $("#tbodycontent").find("input:checked");
			$.each(checkList, function(i, item) {
				var checkTr = $(item).parent().parent().parent();
				ids.push(checkTr.prop("id"));
			});
			return ids;
		},
	}

	module.exports = resultlist; // 根文件夹名称一致
});