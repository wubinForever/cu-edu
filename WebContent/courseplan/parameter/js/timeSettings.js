/**
 * 排课时间设置
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
	var validate = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选
	
	// 枚举
	var isCurrentSemester = require("basePath/enumeration/common/IsCurrentSemester");
	
	// 下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");

	var URL = require("basePath/config/url.courseplan");
	var URLDATA = require("basePath/config/url.data");
	var dictionary = require("basePath/config/data.dictionary");
	var base = config.base;
	
	// 变量名跟文件名称一致
	var timeSettings = {
		init : function() {

			// 默认加载当前排课学年学期
			var semester = simpleSelect.loadCourseSmester("semester", false);
			if (semester.getAcademicYear() && semester.getSemesterCode()) {
				timeSettings.loadItem(semester.getAcademicYear(), semester.getSemesterCode());
			}
			this.semester = semester;

			// 设置保存
			$("#submitBtn").click(function(){
				timeSettings.save();
			});
			
			// 获取排课时间信息
			$("#semester").change(function(){
				timeSettings.loadItem(semester.getAcademicYear(), semester.getSemesterCode());
			});
			
			// 页面绑定验证事件
			timeSettings.validate();
		},
		
		/**
		 * 通过学年学期获取排课时间信息
		 * @param academicYear 学年
		 * @param semesterCode 学期
		 */
		loadItem : function(academicYear, semesterCode) {
			var reqData = {};
			reqData.academicYear = academicYear;
			reqData.semesterCode = semesterCode;
			ajaxData.request(URL.PARAMETER_TIME_GETITEM,reqData,function(data){
				if(data.code === config.RSP_SUCCESS&&data.data){
					timeSettings.isEdit = true;
				}else{
					timeSettings.isEdit = false;
				}
				timeSettings.setParam(data.data);
			});
		},

		/**
		 * 设置界面内容
		 * @param data 排课时间信息
		 */
		setParam : function(data) {
			$("#addForm").find("label.error").text("");
			if(data){
				if (data.currentSemester === isCurrentSemester.Yes.value) {
					$("#isCurrentSemester").prop("checked", true).parent().addClass("on-check");
				} else {
					$("#isCurrentSemester").prop("checked", false).parent().removeClass("on-check");
				}
				$("#schoolWeek").val(data.schoolWeek);
				$("input:radio[name='weekCourseDays']:checked").parent().parent().removeClass("on-radio");
				$("input:radio[name='weekCourseDays'][value="+data.weekCourseDays+"]").parent().parent().addClass("on-radio");
				$("input:radio[name='weekCourseDays'][value="+data.weekCourseDays+"]").prop("checked","checked");
				$("#amSectionNumber").val(data.amSectionNumber);
				$("#pmSectionNumber").val(data.pmSectionNumber);
				$("#nightSectionNumber").val(data.nightSectionNumber);
			}else{
				$("#isCurrentSemester").prop("checked", false).parent().removeClass("on-check");
				$("#schoolWeek").val("");
				$("input:radio[name='weekCourseDays']:checked").parent().parent().removeClass("on-radio");
				$("input:radio[name='weekCourseDays'][value=5]").parent().parent().addClass("on-radio");
				$("input:radio[name='weekCourseDays'][value=5]").prop("checked","checked");
				$("#amSectionNumber").val("");
				$("#pmSectionNumber").val("");
				$("#nightSectionNumber").val("");
			}
		},

		/**
		 * 获取界面内容
		 */
		getParam : function() {
			var param={};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
			if ($("#isCurrentSemester:checked").length > 0) { // 复选框选中，设置为当前排课学年学期
				param.currentSemester = isCurrentSemester.Yes.value;
			} else {
				param.currentSemester = isCurrentSemester.No.value;
			}
			param.schoolWeek = $("#schoolWeek").val();
			param.weekCourseDays = $("input:radio[name='weekCourseDays']:checked").val();
			param.amSectionNumber = $("#amSectionNumber").val();
			param.pmSectionNumber = $("#pmSectionNumber").val();
			param.nightSectionNumber = $("#nightSectionNumber").val();
			return param;
		},

		/**
		 * 保存
		 */
		save : function() {
			
			var valid = $("#addForm").valid();

			if(valid){
				var param = timeSettings.getParam();
				
				var url = URL.PARAMETER_TIME_ADD;
				if(timeSettings.isEdit){
					url = URL.PARAMETER_TIME_UPDATE;
				}
				ajaxData.request(URLDATA.SCHOOLCALENDAR_GETTEACHWEEK, param, function(data) {
					if (data.code === config.RSP_SUCCESS && data.data) {
						if (Number(param.schoolWeek) >= Number(data.data)) {
							popup.errPop("上课周数必须小于教学周数");
						} else {
							ajaxData.request(url, param,function(data) {
								if(data.code === config.RSP_SUCCESS){
									timeSettings.isEdit = true; // 保证再次点击保存按钮执行修改
									popup.okPop("保存成功",function(){
									});
								}else{
									popup.errPop("保存失败："+data.msg);
								}
							});
						}
					}
				});
			}else {
				// 表单验证不通过
				return false;
			}
		},
		
		/**
		 * 界面数据校验
		 */
		validate:function(){
			$("#addForm").validate({
				rules:{
					semester : {
						required : true
					},
					schoolWeek : {
						required : true
					},
					amSectionNumber : {
						required : true
					},
					pmSectionNumber : {
						required : true
					},
					nightSectionNumber : {
						required : true
					}
				},
				messages:{
					semester : {
						required : '学年学期不能为空'
					},
					schoolWeek : {
						required : '上课周数不能为空'
					},
					amSectionNumber : {
						required : '上午节次数不能为空'
					},
					pmSectionNumber : {
						required : '下午节次数不能为空'
					},
					nightSectionNumber : {
						required : '晚上节次数不能为空'
					}
				}
			});
		}
	}
	
	module.exports = timeSettings; // 根据文件名称一致
	window.timeSettings = timeSettings; // 根据文件名称一致
});