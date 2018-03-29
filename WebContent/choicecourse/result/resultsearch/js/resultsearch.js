/**
 * 选课结果查询js
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");

	// 下拉框
	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");

	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var URL_DATA = require("basePath/config/url.data");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var URL_STUDENT = require("basePath/config/url.studentarchives");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var dictionary = require("basePath/config/data.dictionary");
	var helper = require("basePath/utils/tmpl.helper");

	/**
	 * 选课结果查询
	 */
	// 模块化
	var choiceresult = {
		/**
		 * 主列表页面初始化
		 */
		init : function() {
			// 加载查询条件
			choiceresult.initQuery();

			// 初始化列表数据
			choiceresult.pagination = new pagination({
				id : "pagination",
				url : URL_CHOICECOURSE.RESULTSEARCH_GETPAGEDLIST,
				param : choiceresult.queryObject()
			}, function(data, totalRows) {
				$("#exportNumId").val(totalRows);
				$("#pagination").show();
				if (data && data.length > 0) {
					$("#tbodycontent").removeClass("no-data-html").empty()
							.append($("#tamplContent").tmpl(data, helper));
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='15'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");// 取消全选
			}).init();

			// 查询按钮
			$("#query").on("click", function() {
				choiceresult.pagination.setParam(choiceresult.queryObject());
			});

			// 导出
			$('#exportExcel').click(function() {
				var exportNum = $("#exportNumId").val();
				if (utils.isNotEmpty(exportNum) && parseInt(exportNum) > 20000) {
					popup.warPop("导出条数超过2万，不允许导出");
				} else {
					ajaxData.exportFile(URL_CHOICECOURSE.RESULTSEARCH_EXPORT, choiceresult.pagination.option.param);
				}
			});

		},

		/**
		 * 查询条件初始化
		 * 
		 */
		initQuery : function() {
			// 加载当前学年学期
			var semester = simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");

			// 加载年级列表
			simpleSelect.loadSelect("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST, null, {
				firstText : "全部",
				firstValue : "-1",
				async : false
			});

			// 加载院系
			simpleSelect.loadSelect("departmentId", URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS, {
				departmentClassCode : "1",
				isAuthority : true
			}, {
				firstText : "全部",
				firstValue : ""
			});

			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						if (utils.isNotEmpty($(this).val()) && $(this).val() == '-1'
								&& utils.isEmpty($("#departmentId").val())) {
							$("#majorId").html("<option value=''>全部</option>");
							return false;
						}
						simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST, reqData, {
							firstText : "全部",
							firstValue : ""
						});

						$("#classId").html("<option value=''>全部</option>");
					});

			// 院系联动专业
			$("#departmentId").change(function() {
				var reqData = {};
				reqData.departmentId = $(this).val();
				reqData.grade = $("#grade").val();
				if (utils.isEmpty($(this).val()) && utils.isNotEmpty($("#grade").val()) && $("#grade").val() == '-1') {
					$("#majorId").html("<option value=''>全部</option>");
					return false;
				}
				simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST, reqData, {
					firstText : "全部",
					firstValue : ""
				});

				$("#classId").html("<option value=''>全部</option>");
			});

			// 专业联动班级
			$("#majorId").change(function() {
				var reqData = {};
				reqData.majorId = $(this).val();
				reqData.grade = $("#grade").val();
				if (utils.isEmpty($(this).val())) {
					$("#classId").html("<option value=''>全部</option>");
					return false;
				}
				simpleSelect.loadSelect("classId", URL_STUDENT.CLASS_GET_CLASSSELECTBYQUERY, reqData, {
					firstText : "全部",
					firstValue : ""
				});
			});

			// 加载课程类型-课程类别
			simpleSelect.loadDictionarySelect("courseTypeCode", dictionary.COURSE_TYPE_CODE, {
				firstText : "全部",
				firstValue : ""
			});

			// 加载课程类型-课程属性
			simpleSelect.loadDictionarySelect("courseAttributeCode", dictionary.COURSE_ATTRIBUTE_CODE, {
				firstText : "全部",
				firstValue : ""
			});
		},

		/**
		 * 获取查询条件
		 */
		queryObject : function() {
			var param = utils.getQueryParamsByFormId("queryForm");
			if (param.semester) {
				param.academicYear = param.semester.split("_")[0];
				param.semesterCode = param.semester.split("_")[1];
			}		
			param.flag = true;// true表示选课结果查询 false教学班花名册
			delete param.semester;
			return param;
		},

	/** ********************* end ******************************* */
	}
	module.exports = choiceresult;
	window.batchchoice = choiceresult;
});