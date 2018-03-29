/**
 * 实践安排 列表
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var pagination = require("basePath/utils/pagination");
	var timeNotice = require("../../../common/js/timeNotice");

	// 下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");

	var URL = require("basePath/config/url.udf");
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var URLDATA = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var dataDictionary = require("basePath/config/data.dictionary");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); // 复选单选
	var dictionary = require("basePath/config/data.dictionary");
	var teacher = require("../../../common/js/teacher");
	var openMessage = require("../../../common/js/openMessage");
	var ScheduleSettingsEnterPage = require("basePath/enumeration/courseplan/ScheduleSettingsEnterPage");
	var constant = require("basePath/config/data.constant");
	var base = config.base;

	// 变量名跟文件夹名称一致
	var arrangeList = {
		/*
		 * 初始化
		 */
		init : function() {

			// 判断当前时间是否能进入
			regData = {};
			regData.enterPage = ScheduleSettingsEnterPage.PracticeArrange.value;
			timeNotice.init(regData);

			// 默认加载当前学年学期
			var semester = simpleSelect.loadCourseSmester("semester", true);
			arrangeList.semester = semester;

			// 加载年级列表
			simpleSelect.loadCommon("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST, null, "", "全部", "");

			// arrangeList.loadDepartment();
			simpleSelect.loadSelect("departmentId", URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS, {
				departmentClassCode : "1",
				isAuthority : true
			}, {
				firstText : constant.SELECT_ALL,
				firstValue : "",
				async : false
			});

			arrangeList.loadMajor();
			// 院系联动专业
			$("#grade,#departmentId").change(function() {
				arrangeList.loadMajor();
			})

			// 初始加载列表数据，根据学年学期
			arrangeList.initpagination();

			// 小组新增
			$("button[name='addgroup']").on('click', function() {
				arrangeList.addGroup();
			});

			// 查询
			$("button[name='searchInp']").on('click', function() {
				// 保存查询条件
				arrangeList.pagination.setParam(arrangeList.getQueryParams());
			});

			// 修改
			$(document).on("click", "button[name='editgroup']", function(e) {
				var _ = $(e.currentTarget), tr = _.parents("tr");

				// 获取要修改对象的值
				var reqDataId = tr.attr("practicalArrangeId");
				arrangeList.editgroup(reqDataId);
			});

			// 删除
			$(document).on("click", "[name='deleteCourse']", function() {
				arrangeList.singleDeleteCourse(this);
			});

			// 批量删除
			$('#batchDeleteCourse').click(function() {
				arrangeList.batchDeleteCourse();
			});
			openMessage.message(".open-message", "指导教师");
		},
		/*
		 * 设置时间范围，日期加载
		 */
		dateInit : function() {
			(function($) {
				$.getUrlParam = function(name) {
					var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
					var r = window.location.search.substr(1).match(reg);
					if (r != null)
						return unescape(r[2]);
					return null;
				}
			})(jQuery);
			var startTime = $.getUrlParam('startTime'), endTime = $.getUrlParam('endTime');

			$("#settingsTimeStart").html(startTime);
			$("#settingsTimeEnd").html(endTime);
		},

		/**
		 * 加载院系
		 */
		loadDepartment : function() {
			var param = {};
			var me = this;
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETDEPARTMENT, JSON.stringify(param),
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							var list = [];
							$.each(data.data, function(i, item) {
								list.push({
									name : item.departmentName,
									value : item.departmentId
								});
							});
							simpleSelect.installOption($("#departmentId"), list, "", "全部", "");

						} else {
							popup.errPop("查询失败：" + data.msg);
						}
					});
		},
		/**
		 * 加载专业
		 */
		loadMajor : function(departmentId) {
			var param = {};
			param.departmentId = $("#departmentId").val();
			param.grade = $("#grade").val();
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETMAJOR, JSON.stringify(param), function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var list = [];
					$.each(data.data, function(i, item) {
						list.push({
							name : item.majorName,
							value : item.majorId
						});
					});
					simpleSelect.installOption($("#majorId"), list, "", "全部", "");
				} else {
					popup.errPop("查询失败：" + data.msg);
				}
			});
		},

		// 初始加载列表数据
		initpagination : function() {
			this.pagination = new pagination({
				id : "pagination",
				url : URL_COURSEPLAN.ARRANGE_COURSE_GETPAGEDLIST,
				param : this.getQueryParams()
			}, function(data) {
				if (data.length > 0) {
					$.each(data, function(i, item) {
						if (item.userIdlist) {
							item.userIdLists = item.userIdlist.split("、");
						}

					});
					$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
					$("#pagination").show();
					// 添加title
					common.titleInit();
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='13'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
				// 取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();
		},
		/**
		 * 获取查询条件
		 * 
		 * @academicYear 学年
		 * @semesterCode 学期
		 * @grade 年级
		 * @departmentArr 院系
		 * @major 专业
		 * @courseNoOrName 环节号/名称
		 * @teamNo 小组号
		 */
		getQueryParams : function() {
			var param = {};
			param.academicYear = this.semester.getAcademicYear();
			param.semesterCode = this.semester.getSemesterCode();
			param.grade = $("#grade").val();
			param.departmentId = $("#departmentId").val();
			param.majorId = $("#majorId").val();
			param.courseNoOrName = $("#courseNo").val();
			param.groupNo = $("#teamNo").val();

			return param;
		},

		// 小组新增弹窗
		addGroup : function() {
			popup.open('./courseplan/practice/arrange/html/add.html', // 这里是页面的路径地址
			{
				id : 'addgroup',// 唯一标识
				title : '小组新增',// 这是标题
				width : 1100,// 这是弹窗宽度。其实可以不写
				height : 690,// 弹窗高度*/
				button : [ {
					name : '保存',
					callback : function() {

						// 获取‘小组修改’弹框内对象
						var addTeamArr = popup.getData('addTeamArr'), errormsg = "";

						if (!addTeamArr.getTeamAdd()) {
							// 判断验证提醒
							errormsg = addTeamArr.errormsg;
							if (utils.isNotEmpty(errormsg)) {
								popup.warPop(errormsg.content);
								return false;
							} else {
								return false;
							}

						} else {
							data = addTeamArr.teamAddinfo;

							ajaxData.setContentType("application/json;charset=utf-8");
							ajaxData.request(URL_COURSEPLAN.ARRANGE_COURSE_ADD, JSON.stringify(data), function(dt) {
								if (dt.code == config.RSP_SUCCESS) {
									popup.okPop("保存成功");
									// 刷新列表并保存查询数据
									arrangeList.pagination.loadData();
								} else {
									// 提示失败信息
									popup.errPop(dt.msg); 
								}
							});
						}

					},
					focus : true
				}, {
					name : '保存并新增',
					callback : function() {
						var addTeamArr = popup.getData('addTeamArr'), errormsg = "";

						if (!addTeamArr.getTeamAdd()) {
							// 判断验证提醒
							errormsg = addTeamArr.errormsg;
							if (utils.isNotEmpty(errormsg)) {
								popup.warPop(errormsg.content);
								return false;
							} else {
								return false;
							}

						} else {
							data = addTeamArr.teamAddinfo;
							ajaxData.contructor(false); // 同步
							ajaxData.setContentType("application/json;charset=utf-8");
							ajaxData.request(URL_COURSEPLAN.ARRANGE_COURSE_ADD, JSON.stringify(data), function(dt) {
								if (dt.code == config.RSP_SUCCESS) {
									popup.okPop("保存成功");
									// 刷新列表并保存查询数据
									arrangeList.pagination.loadData();
								} else {
									popup.errPop("加载数据失败：" + data.msg);
								}
							});
						}

						// 刷新弹框并加载已选择的选项
						addTeamArr.lodeCourseInfo(data);
						return false;

					},
					focus : true
				}, {
					name : '关闭',
					callback : function() {
					}
				}

				]
			});

		},

		// 小组修改弹窗
		editgroup : function(reqDataId) {
			var reg = {
				id : reqDataId
			};
			ajaxData.request(URL_COURSEPLAN.ARRANGE_COURSE_GETITEM, reg, function(data) {
				if (data.code == config.RSP_SUCCESS && data.data) {

					// 获取实践安排详细
					var coursePost = {};
					coursePost.academicYear = data.data.academicYear;
					coursePost.semesterCode = data.data.semesterCode;
					coursePost.practicalArrangeId = data.data.practicalArrangeId;
					coursePost.courseId = data.data.courseId;
					coursePost.courseNo = data.data.courseNo;
					coursePost.courseName = data.data.courseName;
					coursePost.tacheTypeName = data.data.tacheTypeName;
					coursePost.grade = data.data.grade;
					coursePost.departmentId = data.data.departmentId;
					coursePost.departmentName = data.data.departmentName;
					coursePost.majorId = data.data.majorId;
					coursePost.majorName = data.data.majorName;
					coursePost.groupNo = data.data.groupNo;
					coursePost.memberCount = data.data.memberCount;
					coursePost.linkTitle = data.data.linkTitle;
					coursePost.linkContent = data.data.linkContent;
					coursePost.linkTitle = data.data.linkTitle;
					coursePost.listPracticalTeacherDto = data.data.listPracticalTeacherDto;
					coursePost.listPracticalTacheStudentDto = data.data.listPracticalTacheStudentDto;

					// 像弹框穿参
					popup.setData("coursePost", coursePost);
					popup.open('./courseplan/practice/arrange/html/edit.html', // 这里是页面的路径地址
					{
						id : 'addgroup',// 唯一标识
						title : '小组修改',// 这是标题
						width : 900,// 这是弹窗宽度。其实可以不写
						height : 690,// 弹窗高度*/
						button : [
								{
									name : '保存',
									callback : function() {

										// 获取‘小组修改’弹框内对象
										var addTeamArr = popup.getData('addTeamArr'), errormsg = "";

										if (!addTeamArr.getTeamAdd()) {
											// 判断验证提醒
											errormsg = addTeamArr.errormsg;
											if (utils.isNotEmpty(errormsg)) {
												popup.warPop(errormsg.content);
												return false;
											} else {
												return false;
											}

										} else {
											data = addTeamArr.teamAddinfo;
											data.practicalArrangeId = reqDataId;

											ajaxData.setContentType("application/json;charset=utf-8");
											ajaxData.request(URL_COURSEPLAN.ARRANGE_COURSE_UPDATE,
													JSON.stringify(data), function(dt) {
														if (dt.code == config.RSP_SUCCESS) {
															popup.okPop("保存成功");
															// 刷新列表并保存查询数据
															arrangeList.pagination.loadData();
														} else {
															popup.errPop("加载数据失败：" + data.msg);
														}
													});
										}

									},
									focus : true
								}, {
									name : '关闭',
									callback : function() {
									}
								}

						]
					});

				}

			});
		},

		/**
		 * 单个删除课程信息
		 */
		singleDeleteCourse : function(obj) {
			var courseId = $(obj).parents("tr").attr("practicalarrangeid");// 获取this对象的属性
			var ids = [];
			ids.push(courseId);
			arrangeList.deleteCourse(ids);
		},

		/**
		 * 批量删除课程信息
		 */
		batchDeleteCourse : function() {
			var hasRelated = false; // 是否有关联记录标识
			var ids = [];
			$("tbody input[type='checkbox']:checked").each(function() {
				var obj = $(this).parent().find("input[name='checNormal']");
				ids.push(obj.val());
			});
			if (ids.length == 0) {
				popup.warPop("请勾选要删除的小组");
				return false;
			}
			arrangeList.deleteCourse(ids);
		},
		/**
		 * 删除课程信息
		 */
		deleteCourse : function(ids) {
			// 参数
			var param = {
				"ids" : ids
			};
			popup.askDeletePop("小组", function() {
				ajaxData.setContentType("application/x-www-form-urlencoded");
				ajaxData.request(URL_COURSEPLAN.ARRANGE_COURSE_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						// 刷新列表并保存查询数据
						arrangeList.pagination.loadData();
						// 提示成功
						popup.okPop("删除成功", function() {
						});

					} else {
						// 提示失败
						popup.errPop(data.msg);
					}
				});

			});
		}
	}

	module.exports = arrangeList; // 根文件夹名称一致
});