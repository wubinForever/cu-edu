/**
 * 教学班花名册js
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

	var URL_UDF = require("basePath/config/url.udf");
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
	var teachingclass = {
		/**
		 * 主列表页面初始化
		 */
		init : function() {
			// 加载查询条件
			teachingclass.initQuery();

			// 初始化列表数据
			teachingclass.pagination = new pagination({
				id : "pagination",
				url : URL_CHOICECOURSE.TEACHINGCLASS_GETPAGEDLIST,
				param : teachingclass.queryObject()
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
				teachingclass.pagination.setParam(teachingclass.queryObject());
			});

			// 导出
			$('#exportExcel').click(function() {
				var exportNum = $("#exportNumId").val();
				if (utils.isNotEmpty(exportNum) && parseInt(exportNum) > 20000) {
					popup.warPop("导出条数超过2万，不允许导出");
				} else {
					ajaxData.exportFile(URL_CHOICECOURSE.TEACHINGCLASS_EXPORT, teachingclass.pagination.option.param);
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

			// 绑定开课单位下拉框
			var openDepartmentId = simpleSelect.loadSelect("openDepartmentId",
					URL_DATA.DEPARTMENT_STARTCLASS_FOR_SELECT, {
						isAuthority : true
					}, {
						firstText : "",
						firstValue : "",
						async : false
					});

			// 课程：下拉模糊查询
			var courseInfo = new select({
				dom : $("#courseDiv"),
				param : {
					departmentId : $("#openDepartmentId").val(),
					courseOrTache:1,
					isChoiced:true
				},
				loadData : function() {
					return teachingclass.getData("")
				},
				onclick : teachingclass.initTeachingClass
			}).init();

			// 学籍变化，教学班变化
			$("#semester").change(function() {
				teachingclass.initTeachingClass(courseInfo.getValue());
			});

			// 开课单位联动课程
			$("#openDepartmentId").change(function() {
				// 模糊查询
				courseInfo.reload(teachingclass.getData(), "");
				$("#theoreticalTaskId").html("<option value=''>全部</option>");
				$("#courseId").val("");
			});

			// 课程联动教学班
			$("#courseDiv").change(function() {
				teachingclass.initTeachingClass(courseInfo.getValue());
			});
		},

		/**
		 * 得到课程数据
		 * 
		 */
		getData : function() {
			var param = {
				departmentId : $("#openDepartmentId").val(),
				courseOrTache:1,
				isChoiced:true
			};
			var dataDom = [];
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL_TRAINPLAN.COURSE_GET_LIST, param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item) {
						var option = {
							value : item.courseId,
							name : "[" + item.courseNo + "]" + item.name
						};
						dataDom.push(option);
					});
				}
			});
			return dataDom;
		},

		/**
		 * 教学班查询条件初始化
		 * 
		 */
		initTeachingClass : function(courseId) {
			$("#courseId").val(courseId);
			// 课程联动教学班
			var reqData = {};
			reqData.courseId = courseId;
			var semester = $("#semester").val();
			reqData.academicYear = semester.split("_")[0];
			reqData.semesterCode = semester.split("_")[1];

			if (utils.isEmpty(courseId)) {
				$("#theoreticalTaskId").html("<option value=''>全部</option>");
				return false;
			}
			simpleSelect.loadSelect("theoreticalTaskId", URL_CHOICECOURSE.TEACHINGCLASS_GET_TEACHINGCLASS_SELECT,
					reqData, {
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
			param.flag = false;// true表示选课结果查询 false教学班花名册
			delete param.semester;
			return param;
		},

	/** ********************* end ******************************* */
	}
	module.exports = teachingclass;
	window.batchchoice = teachingclass;
});