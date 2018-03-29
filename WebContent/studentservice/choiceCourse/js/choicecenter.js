/**
 * 选课中心js
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
	var URL_DATA = require("basePath/config/url.data");
	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var URL_STUDENTSERVICE = require("basePath/config/url.studentservice");
	var popup = require("basePath/utils/popup");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dictionary = require("basePath/config/data.dictionary");
	var helper = require("basePath/utils/tmpl.helper");
	var base = config.base;

	/**
	 * 设置选课轮次
	 */
	// 模块化
	var choicecenter = {
		roundId : "",
		teachingClassStr : "",
		isAdjust : 0,
		/**
		 * 主页面列表初始化
		 */
		init : function() {
			// 获取选课统计信息
			choicecenter.getChoiceMainInfoList();

			// 获取选课轮次
			choicecenter.getRoundList();

			// 刷新
			$("#refresh").on("click", function() {
				choicecenter.getChoiceMainInfoList();
				choicecenter.getRoundList();
			});

			// 点击选课
			$(document).on("click", "[name = 'choice-course']", function() {
				// 前端验证是否允许进入选课
				if (!choicecenter.validateRoundInfo(this)) {
					return false;
				}
				// 前台选课门数和选课学分上限判断
				if (!choicecenter.validateLimit(this)) {
					return false;
				}
				// 后台验证是否允许进入选课
				return choicecenter.validate(this);
			});

			// 重置弹框tbody高度
			$(document).find("#courseTables tbody").height("770px");
		},

		/**
		 * 选课课程列表初始化
		 */
		initChoiceCourse : function() {
			// 得到轮次ID
			choicecenter.roundId = utils.getUrlParam('roundId');
			$("#roundId").val(utils.getUrlParam('roundId'));
			$("#semester").val(utils.getUrlParam('semester'));
			$("#grade").val(utils.getUrlParam('grade'));
			$("#majorId").val(utils.getUrlParam('majorId'));
			$("#userId").val(utils.getUrlParam('userId'));
			$("#classId").val(utils.getUrlParam('classId'));
			$("#isTransCampus").val(utils.getUrlParam('isTransCampus'));

			// 获取轮次课程信息
			choicecenter.getRoundCourseList();
			$("#divLimit").hide();

			// 切换标签绑定数据
			$("ul").on("click", "li", function() {
				if ($(this).index() == 0) {
					$("#divCourse").show();
					$("#divLimit").hide();
					choicecenter.getRoundCourseList();
				} else {
					$("#divCourse").hide();
					$("#divLimit").show();
					choicecenter.getCreditNumLimitList();
				}
			})

			// 点击查看
			$(document).on(
					"click",
					"[name = 'checkHtml']",
					function() {
						choicecenter.checkPop(this, $("#semester").val(), $("#classId").val(), $("#isTransCampus")
								.val(), utils.getUrlParam('campusId'));
					});

			// 点击选择
			$(document).on(
					"click",
					"[name = 'choiceHtml']",
					function() {
						choicecenter.choicePop(this, $("#roundId").val(), $("#semester").val(), $("#userId").val(), $(
								"#classId").val(), $("#isTransCampus").val(), utils.getUrlParam('campusId'));
					});
		},

		/**
		 * 初始化选择教学班
		 */
		initTeachingClass : function() {
			$("#semester").val(utils.getUrlParam('semester'));
			$("#courseId").val(utils.getUrlParam('courseId'));
			$("#classId").val(utils.getUrlParam('classId'));
			$("#isTransCampus").val(utils.getUrlParam('isTransCampus'));
			$("#campusId").val(utils.getUrlParam('campusId'));
			// 绑定教学班列表
			choicecenter.getTeachingClassList("");

			// 单选框选中事件
			$(document).on("click", "input[name=radioButton]", function() {
				choicecenter.isAdjust = 1;
				var curCheckBoxId = $(this).attr("data-tt-id");
				// 取消所有的复选框为取消选中状态
				$("div[name='div']").each(function() {
					if ($(this).attr("id") != curCheckBoxId) {
						$(this).attr("class", "checkbox-con");
						$("#chk" + $(this).attr("id")).removeAttr("checked");
					}
				});
				// 设置当前行的复选框为选中状态
				$("#chk" + curCheckBoxId).prop("checked", true);
				$("#" + curCheckBoxId).attr("class", "checkbox-con on-check");
				var str = $(this).attr("data-tt-str");
				choicecenter.teachingClassStr = choicecenter.getTheoreticalTaskDto(str);
			});

			// 复选框选中事件
			$(document).on("click", "input[name=checkbox]", function() {
				if ($('input[name="checkbox"]').prop("checked")) {
					choicecenter.isAdjust = 1;
				} else {
					choicecenter.isAdjust = 0;
				}
				var curCheckBoxId = $(this).attr("data-tt-id");
				// 取消所有的复选框为未勾选状态
				$("div[name='div']").each(function() {
					if ($(this).attr("id") != curCheckBoxId) {
						$(this).attr("class", "checkbox-con");
						$("#chk" + $(this).attr("id")).removeAttr("checked");
					}
				});
				// 取消其他单选框的选中状态
				$("label[name='radioLabel']").each(function() {
					$(this).removeClass("on-radio");
				});
				$("#radio" + curCheckBoxId).attr('class', 'radio-inline padding0 on-radio');
				$("#" + curCheckBoxId).attr("class", "checkbox-con on-check");
				var str = $(this).attr("data-tt-str");
				choicecenter.teachingClassStr = choicecenter.getTheoreticalTaskDto(str);
			});

		},

		/**
		 * 初始化查看选课
		 */
		initViewTeachingClass : function() {
			$("#semester").val(utils.getUrlParam('semester'));
			$("#courseId").val(utils.getUrlParam('courseId'));
			$("#theoreticalTaskId").val(utils.getUrlParam('theoreticalTaskId'));
			$("#isTransCampus").val(utils.getUrlParam('isTransCampus'));
			$("#campusId").val(utils.getUrlParam('campusId'));
			$("#classId").val(utils.getUrlParam('classId'));
			// 绑定教学班列表
			choicecenter.getTeachingClassList(utils.getUrlParam('theoreticalTaskId'));
			// 默认选中已选教学班
			$("label[name='radioLabel']").each(function() {
				$(this).addClass("on-radio");
			});
		},

		/**
		 * 获取选课统计信息
		 */
		getChoiceMainInfoList : function() {
			ajaxData.contructor(false);
			ajaxData
					.request(
							URL_STUDENTSERVICE.CHOICECENTER_GETSTUDENTCHOICEISHAVAOPENEDROUND,
							null,
							function(result) {
								// 如果存在开放的轮次
								if (result.code == config.RSP_SUCCESS && result.data != null) {
									$("#academicYear").val(result.data.academicYear);
									$("#semesterCode").val(result.data.semesterCode);
									var semester = result.data.academicYear + "-" + (result.data.academicYear + 1)
											+ "学年  " + result.data.semesterName;
									$("#semester").text("学年学期：" + semester);
									var param = utils.getQueryParamsByFormId("queryForm");
									ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_GETSTUDENTCHOICEMAININFOLIST,
											param, function(data) {
												if (data != null && data.data.length > 0) {
													$("#topNumLimit").text(
															data.data[0].numLimit == null ? "不限"
																	: data.data[0].numLimit);
													$("#topCreditLimit").text(
															data.data[0].creditLimit == null ? "不限"
																	: data.data[0].creditLimit);
													$("#choicedNumLimit").text(data.data[0].choicedNum);
													$("#choicedCreditLimit").text(data.data[0].choicedCredit);
												} else {
													$("#topNumLimit").text("不限");
													$("#topCreditLimit").text("不限");
													$("#choicedNumLimit").text(0);
													$("#choicedCreditLimit").text(0);
												}
											});

								} else {
									// 如果没有则给出提示信息
									// location.href= utils.getRootPathName() +
									// "/studentservice/choiceCourse/html/wrongTips.html";
									$("#resultId")
											.html(
													"<div class='layout-index text-center'"
															+ "style='width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;'>"
															+ "<img src='../../../common/images/icons/warning.png' />"
															+ "<p style='margin: 20px 0px 10px;'>不在选课范围内， 请咨询教务管理员！</p></div>");
								}
							});
		},

		/**
		 * 查询轮次列表信息
		 */
		getRoundList : function() {
			ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_GETSTUDENTROUNDLIST, null, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html")
				if (data != null && data.data.length > 0) {
					// 绑定模板数据
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data, helper));
				} else {
					$("#tbodycontent").append("<tr><td colspan='11'></td></tr>").addClass("no-data-html");
				}
			}, true);
		},

		/**
		 * 验证是否允许进入选课
		 */
		validateRoundInfo : function(obj) {
			var isOpened = $(obj).attr("data-tt-id").split("_")[1];
			var exitControl = $(obj).attr("data-tt-id").split("_")[2];
			var startTime = $(obj).attr("data-tt-id").split("_")[3];
			var endTime = $(obj).attr("data-tt-id").split("_")[4];
			var registerStatus = $(obj).attr("data-tt-id").split("_")[5];
			var isRegister = $(obj).attr("data-tt-id").split("_")[6].replace(/^\s*|\s*$/g, "");
			var isAtSchool = $(obj).attr("data-tt-id").split("_")[7];
			var schoolStatus = $(obj).attr("data-tt-id").split("_")[8];
			var isArchive = $(obj).attr("data-tt-id").split("_")[9];
			var archievesStatus = $(obj).attr("data-tt-id").split("_")[10];
			var timestamp = new Date().getTime();
			/**
			 * 1.开放状态为否的轮次，不允许选课 2.只能退不能选的轮次不，允许选课 3.还没到开始时间的轮次，不允许选课
			 * 4.超过选课结束时间的轮次，不允许选课 5.学生学籍状态、在校状态、注册状态不符合轮次要求，不允许选课
			 */
			if (isOpened == 0 || exitControl == 3 || parseInt(startTime) - timestamp > 0
					|| timestamp - parseInt(endTime) > 0 || (isRegister == 1 && registerStatus != isRegister)
					|| (isAtSchool == 1 && schoolStatus == "002") || (isArchive == 1 && archievesStatus == "002")) {
				// 提示
				popup.warPop("不在选课范围内，请咨询教务管理员", function() {
					choicecenter.getChoiceMainInfoList();
					choicecenter.getRoundList();
				});
				return false;
			}
			return true;
		},

		/**
		 * 选课门数和选课学分上限判断
		 */
		validateLimit : function() {
			var choicedNumLimit = $("#choicedNumLimit").text();
			var topNumLimit = $("#topNumLimit").text();
			var choicedCreditLimit = $("#choicedCreditLimit").text();
			var topCreditLimit = $("#topCreditLimit").text();
			if (choicedNumLimit != "" && topNumLimit != "不限" && parseInt(choicedNumLimit) >= parseInt(topNumLimit)) {
				// 提示
				popup.warPop("已达到选课门数最高上限，请先进行退选操作", function() {
					choicecenter.getChoiceMainInfoList();
					choicecenter.getRoundList();
				});
				return false;
			}
			if (choicedCreditLimit != "" && topCreditLimit != "不限"
					&& parseFloat(choicedCreditLimit) >= parseFloat(topCreditLimit)) {
				// 提示
				popup.warPop("已达到选课学分最高上限，请先进行退选操作", function() {
					choicecenter.getChoiceMainInfoList();
					choicecenter.getRoundList();
				});
				return false;
			}
			return true;
		},

		/**
		 * 后台验证是否允许进入选课页面
		 */
		validate : function(obj) {
			var reqData = {
				"academicYear" : $("#academicYear").val(),
				"semesterCode" : $("#semesterCode").val()
			}
			// 学分及门数上限后台验证
			ajaxData.contructor(false);
			ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_VALIDATELIMIT, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var roundId = $(obj).attr("data-tt-id").split("_")[0];
					var grade = $(obj).attr("data-tt-id").split("_")[13];
					var majorId = $(obj).attr("data-tt-id").split("_")[14];
					var userId = $(obj).attr("data-tt-id").split("_")[15];
					var classId = $(obj).attr("data-tt-id").split("_")[16];
					var isTransCampus = $(obj).attr("data-tt-id").split("_")[17];
					var campusId = $(obj).attr("data-tt-id").split("_")[18];
					var param = {
						"roundId" : roundId
					};
					// 轮次信息后台验证
					ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_VALIDATE, param, function(data) {
						if (data.code == config.RSP_SUCCESS) {
							choicecenter.courseChoice(roundId, $("#academicYear").val() + "_"
									+ $("#semesterCode").val(), grade, majorId, userId, classId, isTransCampus,
									campusId);
						} else {
							// 提示
							popup.warPop("不在选课范围内，请咨询教务管理员", function() {
								choicecenter.getChoiceMainInfoList();
								choicecenter.getRoundList();
							});
							return false;
						}
					}, false);
				} else {
					// 提示
					popup.warPop(data.msg, function() {
						choicecenter.getChoiceMainInfoList();
						choicecenter.getRoundList();
					});
					return false;
				}
			}, false);
		},

		/**
		 * 弹出 进入选课
		 */
		courseChoice : function(roundId, semester, grade, majorId, userId, classId, isTransCampus, campusId) {
			popup.open('./studentservice/choiceCourse/html/choiceCourseList.html?roundId=' + roundId + '&semester='
					+ semester + '&grade=' + grade + '&majorId=' + majorId + '&userId=' + userId + '&classId='
					+ classId + '&isTransCampus=' + isTransCampus + '&campusId=' + campusId + '', // 这里是页面的路径地址
			{
				id : 'choiceCourse',
				title : '选课',
				width : 1100,
				height : 630,
				close : function() {
					choicecenter.getChoiceMainInfoList();
					choicecenter.getRoundList();
				}
			});
		},

		/**
		 * 绑定轮次课程列表
		 */
		getRoundCourseList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
			if (reqData.semester != "" && reqData.semester != null) {
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			reqData.roundId = choicecenter.roundId;
			ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_GETSTUDENTROUNDCOURSELIST, reqData, function(data) {
				$("#tbodycontent1").html("");
				$("#tbodycontent1").removeClass("no-data-html")
				if (data != null && data.data.length > 0) {
					// 绑定模板数据
					$("#tbodycontent1").html($("#tamplContent").tmpl(data.data, helper));
				} else {
					$("#tbodycontent1").append("<tr><td colspan='11'></td></tr>").addClass("no-data-html");
				}
			}, true);
		},

		/**
		 * 绑定课程类型下拉
		 */
		getCreditNumLimitList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
			if (reqData.semester != "" && reqData.semester != null) {
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_GETSTUDENTCREDITNUMLIMITLIST, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					for (var i = 0; i < data.data.length; i++) {
						$("#tbodycontent2").html($("#tamplContent1").tmpl(data.data, helper));
					}
				} else {
					$("#tbodycontent2").append("<tr><td colspan='11'></td></tr>").addClass("no-data-html");
				}
			}, true);
		},

		/**
		 * 弹出 选教学班
		 */
		choicePop : function(obj, roundId, semester, userId, classId, isTransCampus, campusId) {
			var courseId = $(obj).attr("data-tt-id");
			popup.open('./studentservice/choiceCourse/html/teachingClassList.html?semester=' + semester + '&courseId='
					+ courseId + '&userId=' + userId + '&classId=' + classId + '&isTransCampus=' + isTransCampus
					+ '&campusId=' + campusId + '', // 这里是页面的路径地址
			{
				id : 'choicePop',
				title : '选教学班',
				width : 1000,
				height : 450,
				okVal : '选定',
				cancelVal : '取消',
				ok : function() {
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					// 点击保存时，如果没有选择教学班则给出提示
					if (iframe.choicecenter.teachingClassStr == "") {
						popup.warPop("请选择教学班", function() {
							iframe.choicecenter.getTeachingClassList("");
						});
						return false;
					}
					;
					iframe.choicecenter.teachingClassStr.userId = userId;
					iframe.choicecenter.teachingClassStr.roundId = roundId;
					iframe.choicecenter.teachingClassStr.isAdjust = iframe.choicecenter.isAdjust;
					return choicecenter.saveData(iframe, iframe.choicecenter.teachingClassStr);
				},
				cancel : function() {
					choicecenter.getRoundCourseList();
				}
			});
		},

		/**
		 * 选教学班 提交
		 */
		saveData : function(iframe, params) {
			var flag = false;
			ajaxData.contructor(false);
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_SAVETEACHING, JSON.stringify(params), function(data) {
				if (data.code == config.RSP_SUCCESS) {
					if (data.data != null && data.data.length > 0) {
						// 提示失败
						popup.warPop(data.data[0].reason, function() {
							iframe.choicecenter.getTeachingClassList("");
						});
						return false;
					} else {
						// 提示成功
						popup.okPop("选课成功", function() {
						});
						choicecenter.getRoundCourseList();
					}
				} else {
					// 提示失败
					popup.errPop(data.msg, function() {
						choicecenter.getTeachingClassList("");
					});
					return false;
				}
				flag = true;
			});
			return flag;
		},

		/**
		 * 弹出 查看选课
		 */
		checkPop : function(obj, semester, classId, isTransCampus, campusId) {
			var courseId = $(obj).attr("data-tt-id");
			var theoreticalTaskId = $(obj).attr("data-tt-teachingClass");
			popup.open('./studentservice/choiceCourse/html/viewTeachingClassList.html?semester=' + semester
					+ '&classId=' + classId + '&courseId=' + courseId + '&theoreticalTaskId=' + theoreticalTaskId
					+ '&isTransCampus=' + isTransCampus + '&campusId=' + campusId + '', // 这里是页面的路径地址
			{
				id : 'checkPop',
				title : '查看选课',
				width : 1000,
				height : 420,
				// okVal : '保存',
				cancelVal : '关闭',
				cancel : function() {
					choicecenter.getRoundCourseList();
				}
			});
		},

		/**
		 * 获取教学班列表信息
		 */
		getTeachingClassList : function(theoreticalTaskId) {
			var reqData = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
			if (reqData.semester != "" && reqData.semester != null) {
				reqData.academicYear = reqData.semester.split("_")[0];
				reqData.semesterCode = reqData.semester.split("_")[1];
			}
			ajaxData.contructor(false);
			ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_GETSTUDENTTEACHINGCLASSLIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html")
				if (data != null && data.data.length > 0) {
					// 绑定模板数据
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data, helper));

					// 将上课时间和上课地点换行后对齐
					var i = 0;
					var twoList = $("#tbodycontent .two li");
					$("#tbodycontent .one li").each(function() {
						var one = $(this).outerHeight(true);
						var twoLi = twoList.eq(i);
						if (twoLi == null) {
							twoLi.css("height", one);
						} else {
							var two = twoLi.outerHeight(true);
							if (two > one) {
								$(this).css("height", two);
							} else {
								twoLi.css("height", one);
							}
						}
						i++;
					});

				} else {
					$("#tbodycontent").append("<tr><td colspan='11'></td></tr>").addClass("no-data-html");
				}
			}, true);
		},

		/**
		 * 获取教学班信息
		 * 
		 * @param str
		 * @returns 教学班信息
		 */
		getTheoreticalTaskDto : function(str) {
			var param = {};
			// 组合教学任务信息对象
			if (str != null && str.length > 0) {
				var s = str.split("_");
				if (s.length > 0) {
					param.academicYear = s[0];
					param.semesterCode = s[1];
					param.credit = s[2];
					param.theoreticalTaskId = s[3];
					param.isCoreCurriculum = s[4];
					param.courseTypeCode = s[5];
					param.courseAttributeCode = s[6];
					var weekArr = s[7].split(",");
					var sectionArr = s[8].split(",");
					var weekList = [];// 周次集合
					var sectionList = [];// 节次集合
					for (var i = 0; i < weekArr.length; i++) {
						weekList.push(weekArr[i]);
						sectionList.push(sectionArr[i]);
					}
					param.weekList = weekList;
					param.sectionList = sectionList;
				}
			}
			return param;
		},

	/** ********************* end ******************************* */
	}
	module.exports = choicecenter;
	window.choicecenter = choicecenter;
});