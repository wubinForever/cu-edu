/**
 * 设置选择课程js
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
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dictionary = require("basePath/config/data.dictionary");
	// 左右切换js
	var shuffling = require("basePath/utils/shuffling");
	/**
	 * 设置选择课程
	 */
	// 模块化
	var choicecourse = {
		/**
		 * 主列表页面初始化
		 */
		init : function() {
			// 加载查询条件
			choicecourse.initQuery("list");
			// 加载列表数据
			choicecourse.getChoiceCourseList();
			// 查询按钮
			$("#query").on("click", function() {
				choicecourse.getChoiceCourseList();
			});
			// 双表格右侧全选
			utils.checkAllCheckboxes('check-all-right', 'checNormal-right');

			// 选择课程弹框
			$(document).on("click", "button[name = 'selectCourse']", function() {
				choicecourse.popHtmlselect(function(saveData) {
					// 保存选择课程数据
					choicecourse.saveBatchCourse(saveData);
				});
			});

			// 批量移除课程
			$(document).on("click", "button[name ='deleteCourse']", function() {
				choicecourse.batchDeleteCourse();
			});
		},

		/**
		 * 获取选择课程列表
		 * 
		 */
		getChoiceCourseList : function() {
			var reqData = choicecourse.queryObject();
			ajaxData.request(URL_CHOICECOURSE.CHOICECOURSE_GETLIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data != null && data.data.length > 0) {
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
				} else {
					$("#tbodycontent").append("<tr><td colspan='6'></td></tr>").addClass("no-data-html");
				}
				// 取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			},true);
		},
		/**
		 * 查询条件初始化
		 * 
		 * @param type:list选择课程主列表页面，openList开放课程列表页面
		 */
		initQuery : function(type) {
			// 加载当前学年学期
			var semester = simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");
			this.semester = semester;

			// 加载当前学年学期下选课轮次
			var round = simpleSelect.loadSelect("roundId", URL_CHOICECOURSE.ROUND_SELECT, {
				academicYear : semester.getAcademicYear(),
				semesterCode : semester.getSemesterCode()
			}, {
				async : false
			});

			// 选择学期级联选课轮次，并更新列表
			$("#semester").change(function() {
				simpleSelect.loadSelect("roundId", URL_CHOICECOURSE.ROUND_SELECT, {
					academicYear : semester.getAcademicYear(),
					semesterCode : semester.getSemesterCode()
				}, {
					async : false
				});

				// openList开放课程列表页面,学年学期改变时，选课轮次改变，开放课程列表更新
				if (type == "openList") {
					choicecourse.changeList();
				}
			});

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
			});

			// 加载培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode", dictionary.ID_FOR_TRAINING_LEVEL, {
				firstText : "全部",
				firstValue : ""
			});

			// 绑定开课单位下拉框
			simpleSelect.loadAuthStartClass("openDepartmentId", {
				isAuthority : true
			}, "", "全部", "");

			if (type == "openList") {
				// 加载考核方式
				simpleSelect.loadDictionarySelect("checkWayCode", dictionary.CHECK_WAY_CODE, {
					firstText : "全部",
					firstValue : ""
				});

				// 选择选课轮次更新列表，并将查询条件值默认
				$("#roundId").change(function() {
					choicecourse.changeList();
				});
			}
		},

		/**
		 * 获取查询条件
		 */
		queryObject : function() {
			var param = {};
			var semester = $("#semester").val();
			param.roundId = $("#roundId").val();
			param.grade = $("#grade").val();
			param.departmentId = $("#departmentId").val();
			param.majorId = $.trim($("#majorId").val());
			param.trainingLevelCode = $("#trainingLevelCode").val();
			param.openDepartmentId = $("#openDepartmentId").val();
			param.courseName = $.trim($("#courseName").val());
			param.isCoreCurriculum = $("#isCoreCurriculum").val();
			return choicecourse.getSemesterSplit(param, semester);
		},

		/**
		 * 根据学年学期2017_2拆分成2017和2
		 * 
		 * @param param
		 *            参数数组
		 * @param semester
		 *            学年学期2017_2
		 * @returns 参数对象
		 */
		getSemesterSplit : function(param, semester) {
			if (semester) {
				param.academicYear = semester.split("_")[0];
				param.semesterCode = semester.split("_")[1];
			}
			return param;
		},

		/**
		 * 批量移除课程
		 */
		batchDeleteCourse : function() {
			var ids = [];
			$("tbody input[type='checkbox']:checked").each(function() {
				var obj = $(this).parent().find("input[name='checNormal']").val();
				ids.push(obj);
			});
			if (ids.length == 0) {
				popup.warPop("请勾选要移除的课程");
				return false;
			}
			// 参数
			var param = {
				"ids" : ids
			};
			popup.askPop("确认移除课程吗？", function() {
				ajaxData.contructor(false);
				ajaxData.request(URL_CHOICECOURSE.CHOICECOURSE_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("移除成功", function() {
						});
						// 刷新列表
						choicecourse.getChoiceCourseList();
					} else {
						// 提示失败
						popup.errPop(data.msg);
					}
				},true);

			});
		},

		/** **********************选择课程-左右切换***************** */
		/**
		 * 已经存在课程数据
		 * 
		 * @param param
		 *            查询条件
		 * 
		 */
		getExistCourseList : function(param) {
			// param.isSave = true;// 表示获取已经存在的课程
			var rqData = [];
			ajaxData.contructor(false);
			ajaxData.request(URL_CHOICECOURSE.CHOICECOURSE_GETLIST, param, function(data) {
				if (data != null && data.data.length > 0) {
					rqData = data.data;
				}
			});
			return rqData;
		},
		/**
		 * 弹框 选择课程
		 * 
		 * @param callback
		 *            返回方法
		 */
		popHtmlselect : function(callback) {
			popup.open('./choicecourse/parameter/choicecourse/html/select.html', // 这里是页面的路径地址
			{
				id : 'popHtmlselect',
				title : '选择课程',
				width : 1300,
				height : 660,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					// 确定逻辑
					var v = iframeObj.$("#addForm").valid(); // 验证表单
					// 表单验证通过
					if (v) {
						var shuffing = popup.data("shuff");
						var saveData = shuffing.getData();

						// 组装保存课程对象
						var param = {};
						param = choicecourse.getSemesterSplit(param, iframeObj.$("#semester").val());
						var choiceCourseDto = {};
						choiceCourseDto.roundId = iframeObj.$("#roundId").val();
						choiceCourseDto.academicYear = param.academicYear;
						choiceCourseDto.semesterCode = param.semesterCode;

						var courseIds = [];
						if (saveData != null) {
							$.each(saveData, function(index, obj) {
								courseIds.push(obj.courseId)
							});
							choiceCourseDto.courseIds = courseIds;
						}

						// 返回数据
						return callback(choiceCourseDto);

					} else {
						// 表单验证不通过
						return false;
					}
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},

		/**
		 * 选择课程初始化
		 */
		initCourse : function(load) {
			// 验证
			choicecourse.validateFormData();

			// 轮次加载时，不更新查询条件
			if (load == "") {
				// 加载查询条件
				choicecourse.initQuery("openList");
			}

			// 该界面默认参数
			var param = {};
			param = choicecourse.getSemesterSplit(param, $("#semester").val());
			param.roundId = $("#roundId").val();

			// 数据库中传过来已有的右侧数据
			// var rightData = choicecourse.getExistCourseList(param);

			// 左右列表数据加载
			var shuff = new shuffling({
				left : [ {
					name : "开课单位",
					field : "openDepartmentName",
					rigthLeftStyle:"text-l"
				}, {
					name : "课程号",
					field : "courseNo",
					rigthLeftStyle:"text-l",
					widthStyle:"width85"
				}, {
					name : "课程名称",
					field : "courseName",
					rigthLeftStyle:"text-l"
				}, {
					name : "学分",
					field : "credit",
					rigthLeftStyle:"text-r",
					widthStyle:"width10"
				}, {
					field : "courseId",
					unique : true,
					show : false
				} ],
				url : URL_CHOICECOURSE.CHOICECOURSE_GETOPENLIST,// 左侧数据url
				// selectedData : rightData, // 右侧数据填充
				param : {
					roundId : param.roundId,
					academicYear : param.academicYear,
					semesterCode : param.semesterCode
				},
				selectedCanRemove : true,
				pullLeftHeaderText : "可选课程：", // 左侧顶部文本
				pullRightHeaderText : "已选课程：" // 右侧顶部文本
			}).init();
			choicecourse.shuff = shuff;
			popup.data("shuff", shuff);

			$("#querySelect").click(function() {
				// 绑定左侧自定义数据
				var param = choicecourse.queryObject();
				param.checkWayCode = $("#checkWayCode").val();
				choicecourse.shuff.loadData(param);
			});
		},
		getSelectedCourse : function() {
			// 保存
			choicecourse.shuff.getData();
		},
		/**
		 * 根据轮次刷新开放专业列表
		 */
		changeList : function() {
			$("#grade").val("-1");
			$("#departmentId").val("");
			$("#majorId").val("");
			$("#trainingLevelCode").val("");
			$("#openDepartmentId").val("");
			$("#checkWayCode").val("");
			$("#courseName").val("");
			$("#isCoreCurriculum").val("");

			// 根据轮次更新左右列表
			choicecourse.initCourse("roundLoad");
		},
		/**
		 * 保存课程-批量
		 * 
		 * @param choiceCourseDto
		 *            课程对象
		 */
		saveBatchCourse : function(choiceCourseDto) {
			var flag = false;
			// post请求提交数据
			ajaxData.contructor(false);
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_CHOICECOURSE.CHOICECOURSE_ADD, JSON.stringify(choiceCourseDto), function(data) {
				if (data.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("保存成功", function() {
					});
					// 刷新列表
					choicecourse.getChoiceCourseList();
					flag = true;
				} else {
					// 提示失败信息
					popup.errPop(data.msg);
				}
			},true);
		},

		/**
		 * 验证表单
		 */
		validateFormData : function() {
			// 验证
			$("#addForm").validate({
				rules : {
					semester : {
						"required" : true
					},
					roundId : {
						"required" : true
					}
				},
				messages : {
					semester : {
						"required" : "学年学期不能为空"
					},
					roundId : {
						"required" : "选课轮次不能为空"
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});
		}
	/** ********************* end ******************************* */
	}
	module.exports = choicecourse;
	window.choicecourse = choicecourse;
});