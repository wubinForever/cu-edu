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
	var validate = require("basePath/utils/validateExtend");

	// 下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");

	var URL = require("basePath/config/url.courseplan");
	var URLDATA = require("basePath/config/url.data");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var common = require("basePath/utils/common"); // 复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var simpleSelect = require("basePath/module/select.simple");
	var base = config.base;

	// 变量名跟文件夹名称一致
	var scheduleSetting = {
		// 初始化
		init : function() {
			// 加载当前学年学期
			var semester = simpleSelect.loadCourseSmester("semester", false);
			if (semester.getAcademicYear() && semester.getSemesterCode()) {
				scheduleSetting.loadItem(semester.getAcademicYear(), semester.getSemesterCode());
			}
			this.semester = semester;

			// 设置保存
			$("#submitBtn").click(function() {
				scheduleSetting.save();
			});
			$("#semester").change(function() {
				scheduleSetting.loadItem(semester.getAcademicYear(), semester.getSemesterCode());
			});

			// 页面绑定验证事件
			this.validate();
		},
		/**
		 * 保存
		 */
		save : function() {

			var valid = $("#addForm").valid();
			if (!valid) {
				// 表单验证不通过
				return false;
			}

			var param = scheduleSetting.getParam();

			var url = URL.PARAMETER_SCHEDULE_ADD;
			if (scheduleSetting.isEdit) {
				url = URL.PARAMETER_SCHEDULE_UPDATE;
			}
			ajaxData.request(url, param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					scheduleSetting.isEdit = true; // 保证再次点击保存按钮执行修改
					popup.okPop("保存成功", function() {
					});
				} else {
					popup.errPop("保存失败：" + data.msg);
				}
			});

		},
		/**
		 * 获取界面表单内容
		 */
		getParam : function() {
			var param = {};
			param.practiceTaskStartTime = $("#practiceTaskStartTime").val();
			param.practiceTaskEndTime = $("#practiceTaskEndTime").val();
			param.practiceArrangeStartTime = $("#practiceArrangeStartTime").val();
			param.practiceArrangeEndTime = $("#practiceArrangeEndTime").val();
			param.theoreticalTaskStartTime = $("#theoreticalTaskStartTime").val();
			param.theoreticalTaskEndTime = $("#theoreticalTaskEndTime").val();
			param.scheduleArrangeStartTime = $("#scheduleArrangeStartTime").val();
			param.scheduleArrangeEndTime = $("#scheduleArrangeEndTime").val();
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
			return param;
		},
		/**
		 * 设置界面内容
		 */
		setParam : function(data) {
			$("#addForm").find("label.error").text("");
			if (data) {
				$("#practiceTaskStartTime").val(new Date(data.practiceTaskStartTime).format("yyyy-MM-dd hh:mm"));
				$("#practiceTaskEndTime").val(new Date(data.practiceTaskEndTime).format("yyyy-MM-dd hh:mm"));
				$("#practiceArrangeStartTime").val(new Date(data.practiceArrangeStartTime).format("yyyy-MM-dd hh:mm"));
				$("#practiceArrangeEndTime").val(new Date(data.practiceArrangeEndTime).format("yyyy-MM-dd hh:mm"));
				$("#theoreticalTaskStartTime").val(new Date(data.theoreticalTaskStartTime).format("yyyy-MM-dd hh:mm"));
				$("#theoreticalTaskEndTime").val(new Date(data.theoreticalTaskEndTime).format("yyyy-MM-dd hh:mm"));
				$("#scheduleArrangeStartTime").val(new Date(data.scheduleArrangeStartTime).format("yyyy-MM-dd hh:mm"));
				$("#scheduleArrangeEndTime").val(new Date(data.scheduleArrangeEndTime).format("yyyy-MM-dd hh:mm"));
			} else {
				$("#practiceTaskStartTime").val("");
				$("#practiceTaskEndTime").val("");
				$("#practiceArrangeStartTime").val("");
				$("#practiceArrangeEndTime").val("");
				$("#theoreticalTaskStartTime").val("");
				$("#theoreticalTaskEndTime").val("");
				$("#scheduleArrangeStartTime").val("");
				$("#scheduleArrangeEndTime").val("");
			}
		},
		/**
		 * 通过学年学期获取排课进度信息
		 * 
		 * @param academicYear
		 *            学年
		 * @param semesterCode
		 *            学期
		 */
		loadItem : function(academicYear, semesterCode) {
			var reqData = {};
			reqData.academicYear = academicYear;
			reqData.semesterCode = semesterCode;
			ajaxData.request(URL.PARAMETER_SCHEDULE_GETITEM, reqData, function(data) {
				if (data.data) {
					scheduleSetting.isEdit = true;
				} else {
					scheduleSetting.isEdit = false;
				}
				scheduleSetting.setParam(data.data);
			});
		},
		/**
		 * 界面数据校验
		 */
		validate : function() {
			$("#addForm").validate({
				rules : {
					semester : {
						required : true
					},
					practiceTaskStartTime : {
						required : true
					},
					practiceTaskEndTime : {
						required : true
					},
					practiceArrangeStartTime : {
						required : true
					},
					practiceArrangeEndTime : {
						required : true
					},
					theoreticalTaskStartTime : {
						required : true
					},
					theoreticalTaskEndTime : {
						required : true
					},
					scheduleArrangeStartTime : {
						required : true
					},
					scheduleArrangeEndTime : {
						required : true
					},
				},
				messages : {
					semester : {
						required : '学年学期不能为空'
					},
					practiceTaskStartTime : {
						required : '实践任务设置开始时间不能为空'
					},
					practiceTaskEndTime : {
						required : '实践任务设置结束时间不能为空'
					},
					practiceArrangeStartTime : {
						required : '实践安排开始时间不能为空'
					},
					practiceArrangeEndTime : {
						required : '实践安排结束时间不能为空'
					},
					theoreticalTaskStartTime : {
						required : '理论任务设置开始时间不能为空'
					},
					theoreticalTaskEndTime : {
						required : '理论任务设置结束时间不能为空'
					},
					scheduleArrangeStartTime : {
						required : '课表编排开始时间不能为空'
					},
					scheduleArrangeEndTime : {
						required : '课表编排结束时间不能为空'
					},
				}
			});
		}

	}

	module.exports = scheduleSetting; // 根文件夹名称一致
	window.parameters = scheduleSetting; // 根据文件夹名称一致
});