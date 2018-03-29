/**
 * 选课结果js
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");

	var URL_CHOICECOURSE = require("basePath/config/url.choicecourse");
	var URL_STUDENTSERVICE = require("basePath/config/url.studentservice");
	var popup = require("basePath/utils/popup");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dictionary = require("basePath/config/data.dictionary");
	var helper = require("basePath/utils/tmpl.helper");
	var base = config.base;
	var studentschedule = require("./studentschedule"); // 课表初始化

	/**
	 * 选课结果
	 */
	// 模块化
	var choiceresult = {
		divIndex : 0,
		/**
		 * 主页面列表初始化
		 */
		init : function() {
			// 加载学年学期已选课程统计数据
			choiceresult.getStaticsInfoList();
			// 退选
			$(document).on("click", "button[name='btnDrop']", function() {
				choiceresult.deleteChoice(this);
			});

			// 刷新
			$("#refresh").on("click", function() {
				if (choiceresult.divIndex == 0) {
					$("#choiceDiv").show();
					$("#scheduleDiv").hide();
					choiceresult.getStaticsInfoList();
				} else {
					$("#choiceDiv").hide();
					$("#scheduleDiv").show();
					choiceresult.getStaticsInfoList();
				}
			});

			// 切换标签绑定数据
			$("ul").on("click", "li", function() {
				choiceresult.divIndex = $(this).index();
				if (choiceresult.divIndex == 0) {
					$("#choiceDiv").show();
					$("#scheduleDiv").hide();
					choiceresult.getStaticsInfoList();
				} else {
					$("#choiceDiv").hide();
					$("#scheduleDiv").show();
					choiceresult.getStaticsInfoList();
				}
			})
		},

		/**
		 * 查询条件
		 */
		queryObject : function() {
			var reqData = {};
			reqData.academicYear = $("#academicYear").val();
			reqData.semesterCode = $("#semesterCode").val();
			return reqData;
		},

		/**
		 * 获取选课课程列表
		 * 
		 */
		getChoiceResultList : function() {
			var reqData = choiceresult.queryObject();
			if (utils.isNotEmpty(reqData.academicYear)) {
				ajaxData.request(URL_STUDENTSERVICE.CHOICECENTER_GETCHOICERESULTLIST, reqData, function(data) {
					$("#tbodycontent").html("");
					$("#tbodycontent").removeClass("no-data-html");
					if (data != null && data.data.length > 0) {
						$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
					} else {
						$("#tbodycontent").append("<tr><td colspan='15'></td></tr>").addClass("no-data-html");
					}
				}, true);
			} else {
				$("#tbodycontent").append("<tr><td colspan='15'></td></tr>").addClass("no-data-html");
			}
		},

		/**
		 * 获取选课统计信息
		 */
		getStaticsInfoList : function() {
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
									var param = choiceresult.queryObject();
									ajaxData.contructor(false);
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
													$("#choicedNumLimit").text("0");
													$("#choicedCreditLimit").text("0");
												}
											});
									if (choiceresult.divIndex == 0) {
										// 加载列表数据
										choiceresult.getChoiceResultList();
									} else {
										studentschedule.init();
									}
								} else {
									// 如果没有则给出提示信息
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
		 * 退选
		 * 
		 * @param obj
		 *            当前页面对象
		 */
		deleteChoice : function(obj) {
			popup.askPop("确定退选课程？", function() {

				var flag = false;// 判断是否可退课
				var roundId = $(obj).attr("data-tt-roundId");
				var param = {
					"roundId" : roundId
				};
				// 获取一条数据
				ajaxData.contructor(false);
				ajaxData.request(URL_CHOICECOURSE.ROUND_GETITEM, param, function(data) {
					if (data != null && data.code == config.RSP_SUCCESS) {
						/*
						 * 退选置灰条件： 1、系统置课 2、该轮次（开放选课）不开放 3、该轮次（选课退选控制）只可选课
						 * 4、该轮次选课结束时间大于系统当前时间
						 */
						if (data.data.isOpened == 0) {
							popup.warPop("该轮次不开放", function() {
								choiceresult.getStaticsInfoList();
							});
						} else if (data.data.exitControl == 2) {
							popup.warPop("该轮次选课退选控制为只可选课", function() {
								choiceresult.getStaticsInfoList();
							});
						} else if (new Date().getTime() < new Date(data.data.startTime).getTime()) {
							popup.warPop("该轮次选课时间还未开始", function() {
								choiceresult.getStaticsInfoList();
							});
						} else if (new Date().getTime() > new Date(data.data.endTime).getTime()) {
							popup.warPop("该轮次选课时间已结束", function() {
								choiceresult.getStaticsInfoList();
							});
						} else {
							flag = true;
						}
					}
				});

				if (flag) {
					var teachingClassStudentIds = [];
					teachingClassStudentIds.push($(obj).attr("data-tt-id"));
					// 参数
					var param = {
						"teachingClassStudentIds" : teachingClassStudentIds,
						"flag" : 4
					};
					ajaxData.contructor(false);
					ajaxData.request(URL_CHOICECOURSE.ADJUSTSTUDENTCHOICE_DELETE, param, function(data) {
						if (data.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("退选成功");
							// 加载学年学期已选课程统计数据
							choiceresult.getStaticsInfoList();
						} else {
							// 提示失败
							popup.errPop("退选失败");
						}
					});
				}
			});
		}

	/** ********************* end ******************************* */
	}
	module.exports = choiceresult;
	window.choiceresult = choiceresult;
});