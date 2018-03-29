/**
 * 批量选课js
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
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var dictionary = require("basePath/config/data.dictionary");
	// 左右切换js
	var shuffling = require("basePath/utils/shuffling");
	/**
	 * 批量选课
	 */
	// 模块化
	var batchchoice = {
		/**
		 * 记住查询条件
		 */
		queryRememberObject : {},
		/**
		 * 主列表页面初始化
		 */
		init : function() {
			// 加载查询条件
			batchchoice.initQuery();
			batchchoice.queryRememberObject = batchchoice.queryObject();// 获取查询参数
			// 加载列表数据
			batchchoice.getBatchChoiceList();
			// 查询按钮
			$("#query").on("click", function() {
				batchchoice.queryRememberObject = batchchoice.queryObject();// 获取查询参数
				batchchoice.getBatchChoiceList();
			});
			// 双表格右侧全选
			utils.checkAllCheckboxes('check-all-right', 'checNormal-right');

			// 批量选课 弹框
			$(document).on("click", "button[name = 'batch-elective']", function() {
				var param = batchchoice.queryRememberObject;
				batchchoice.popBatchElective(param);
			});

			// 调整选课 弹框
			$(document).on("click", "button[name = 'adjust-course']", function() {
				// 参数
				var param = {};
				var str = $(this).attr("data-tt-id");
				param = batchchoice.getTheoreticalTaskDto(str);

				// 右侧列表数据-已经选课的学生
				var data = batchchoice.getExistChoiceStudentList(param);

				batchchoice.popAdjustCourse(data, param, function(saveData) {
					// 保存选择课程数据
					batchchoice.saveChoiceStudent(saveData);
				});
			});

		},

		/**
		 * 获取批量选课课程列表
		 * 
		 */
		getBatchChoiceList : function() {
			var reqData = batchchoice.queryObject();
			ajaxData.request(URL_CHOICECOURSE.BATCHCHOICE_GET_BATCH_CHOICE_LIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data != null && data.data.length > 0) {
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
				} else {
					$("#tbodycontent").append("<tr><td colspan='11'></td></tr>").addClass("no-data-html");
				}
			}, true);
		},
		/**
		 * 查询条件初始化
		 * 
		 */
		initQuery : function() {
			// 加载当前学年学期
			var semester = simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");

			// 绑定开课单位下拉框
			simpleSelect.loadAuthStartClass("openDepartmentId", {
				isAuthority : true
			}, "", "全部", "");

		},

		/**
		 * 获取查询条件
		 */
		queryObject : function() {
			var param = {};
			var semester = $("#semester").val();
			param.openDepartmentId = $("#openDepartmentId").val();
			param.courseName = $.trim($("#courseName").val());
			if ($('#notContainRound').is(":checked")) {
				param.notContainRound = true;// 限选课轮次中未开放的课程
			} else {
				param.notContainRound = false;// 查询全部
			}
			return batchchoice.getSemesterSplit(param, semester);
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
		 * 弹框 批量选课
		 */
		popBatchElective : function(param) {
			popup.data("param", param);
			popup.open('./choicecourse/manage/batchchoice/html/batchElective.html', // 这里是页面的路径地址
			{
				id : 'popbatchElective',
				title : '批量选课',
				width : 850,
				height : 420,
				okVal : '批量选课',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					// 批量选课-教学班
					var batchSaveCourseDtoList = [];// 
					iframeObj.$("#tbodycontent .selectData").each(function() {
						var str = $(this).attr("data-tt-id");
						// 课程Id、教学班Id、班级Id、课程类别、课程属性、是否通识课、学分、学年、学期、可选人数上限、已选人数、已排课周次、已排课节次
						var batchSaveCourseDto = batchchoice.getTheoreticalTaskDto(str);
						batchSaveCourseDto.flag = 1;// 批量选课
						if (utils.isNotEmpty(batchSaveCourseDto)) {
							batchSaveCourseDtoList.push(batchSaveCourseDto);
						}
					});

					if (batchSaveCourseDtoList.length == 0) {
						popup.warPop("无批量选课数据");
						return false;
					}

					// post请求提交数据
					batchchoice.saveChoiceStudent(batchSaveCourseDtoList);

				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},

		/**
		 * 调整选课-保存学生选课数据
		 * 
		 * @param batchSaveCourseDtoList
		 *            课程学生对象
		 */
		saveChoiceStudent : function(batchSaveCourseDtoList) {
			var flag = false;
			// post请求提交数据
			ajaxData.contructor(false);
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_CHOICECOURSE.BATCHCHOICE_ADD_BATCH_CHOICE, JSON.stringify(batchSaveCourseDtoList),
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("保存成功", function() {
							});
							// 弹出不成功学生名单
							if (data.data.length > 0) {
								batchchoice.popSelectionResults(data);
							} else {
								// 刷新列表
								batchchoice.getBatchChoiceList();
							}
							flag = true;
						} else {
							// 提示失败信息
							popup.errPop(data.msg);
						}
					}, true);
		},

		/**
		 * 批量选课列表表页面初始化
		 */
		initBatchElective : function() {
			var param = popup.data("param");
			param.teaNum = 1;// 同一个课程中，教学班和行政班一一对应
			// 加载列表数据
			batchchoice.getOpenBatchChoiceList(param);
		},

		/**
		 * 增加-获取批量选课课程列表
		 * 
		 */
		getOpenBatchChoiceList : function(reqData) {
			ajaxData.request(URL_CHOICECOURSE.BATCHCHOICE_GET_BATCH_CHOICE_LIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data != null && data.data.length > 0) {
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
					$("#teachingClassCount").html(data.data.length);
				} else {
					$("#tbodycontent").append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");
					$("#teachingClassCount").html(0);
				}
			}, true);
		},

		/** ********************调整选课********************************************* */
		/**
		 * 组合教学任务信息对象
		 * 
		 * @param
		 * str:courseId_theoreticalTaskId_classIds_courseTypeCode_courseAttributeCode_isCoreCurriculum_credit_academicYear_semesterCode
		 * _choiceLimit_choicedNum_weekList_sectionList
		 * 课程Id、教学班Id、班级Id、课程类别、课程属性、是否通识课、学分、学年、学期、可选人数上限、已选人数、已排课周次、已排课节次
		 * @param param
		 *            参数对象
		 * @returns 教学任务信息对象
		 */
		getTheoreticalTaskDto : function(str) {
			var param = {};
			// 组合教学任务信息对象
			if (str != null && str.length > 0) {
				var s = str.split("_");
				if (s.length > 0) {
					param.courseId = s[0];
					param.theoreticalTaskId = s[1];
					param.classIds = s[2];// 批量选课时是一个行政班Id，调整选课时可多个
					param.courseTypeCode = s[3];
					param.courseAttributeCode = s[4];
					param.isCoreCurriculum = s[5];
					param.credit = s[6];
					param.academicYear = s[7];
					param.semesterCode = s[8];
					param.choiceLimit = s[9];
					param.choicedNum = s[10];
					var weekArr = s[11].split(",");
					var sectionArr = s[12].split(",");
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

		/**
		 * 调整选课学生-已经选课的学生列表
		 * 
		 * @param param
		 *            查询条件
		 * 
		 */
		getExistChoiceStudentList : function(param) {
			var rqData = [];
			ajaxData.contructor(false);
			ajaxData.request(URL_CHOICECOURSE.BATCHCHOICE_GET_TEACHING_CHOICE_STUDENT_LIST, param, function(data) {
				if (data != null && data.data.length > 0) {
					rqData = data.data;
				}
			});
			return rqData;
		},

		/**
		 * 初始化调整选课学生
		 */
		initStudent : function() {
			// 数据库中传过来已有的右侧数据
			var rightData = popup.data("data");
			// 从主界面传递过来的参数
			var param = popup.data("param");
			// 左右列表数据加载
			var shuff = new shuffling({
				left : [ {
					name : "班级",
					field : "className",
					rigthLeftStyle : "text-l"
				}, {
					name : "学号",
					field : "studentNo",
					rigthLeftStyle : "text-l"
				}, {
					name : "姓名",
					field : "studentName",
					rigthLeftStyle : "text-l"
				}, {
					name : "性别",
					field : "sexName",
					widthStyle : "width12"
				}, {
					field : "userId",
					unique : true,
					show : false
				} ],
				url : URL_CHOICECOURSE.BATCHCHOICE_GET_TEACHING_WANT_STUDENT_LIST,// 左侧数据url
				selectedData : rightData, // 右侧数据填充
				param : {
					theoreticalTaskId : param.theoreticalTaskId,
					academicYear : param.academicYear,
					semesterCode : param.semesterCode
				},
				selectedCanRemove : true,
				pullLeftHeaderText : "可选学生：", // 左侧顶部文本
				pullRightHeaderText : "已选学生：" // 右侧顶部文本
			}).init();
			batchchoice.shuff = shuff;
			popup.data("shuff", shuff);

			// 班级下拉数据
			var reqData = {};
			reqData.classIds = param.classIds;// 根据班级Ids查询
			simpleSelect.loadSelect("classId", URL_STUDENT.CLASS_GET_CLASSSELECTBYQUERY, reqData, {
				firstText : "全部",
				firstValue : ""
			});

			$("#searchBtn").click(function() {
				// 绑定左侧自定义数据
				var queryParam = {};
				queryParam.theoreticalTaskId = param.theoreticalTaskId;
				queryParam.academicYear = param.academicYear;
				queryParam.semesterCode = param.semesterCode;
				queryParam.classId = $("#classId").val();
				queryParam.studentName = $.trim($("#studentName").val());

				batchchoice.shuff.loadData(queryParam);
			});
		},
		getSelectedStudent : function() {
			// 保存
			batchchoice.shuff.getData();
		},

		/**
		 * 弹框 调整选课学生
		 * 
		 * @param data
		 *            已选学生集合
		 * @param param
		 *            查询参数
		 * @param callback
		 *            回调函数
		 */
		popAdjustCourse : function(data, param, callback) {
			popup.data("data", data);// 数据库中传过来已有的右侧数据
			popup.data("param", param);// 从主界面传递过来的参数

			popup.open('./choicecourse/manage/batchchoice/html/adjustCourse.html', // 这里是页面的路径地址
			{
				id : 'popadjustCourse',
				title : '调整选课',
				width : 1300,
				height : 435,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					var shuffing = popup.data("shuff");
					var saveData = shuffing.getData();// 待置课的选课学生
					// 要保存的学生选课数据
					var batchSaveCourseDtoList = [];

					var deleteUserIds = [];// 待退课的选课学生
					if (data != null) {
						$.each(data, function(index, obj) { // 循环数据库中存在
							var count = 0;
							if (saveData != null) {
								$.each(saveData, function(index, saveObj) {// 循环右边要保存的
									if (obj == saveObj) {
										count++
									}
								});
							}
							if (count == 0) {
								deleteUserIds.push(obj.userId);
							}
						});
						param.deleteUserIdList = deleteUserIds;// 待退课的选课学生
					}

					var userIds = [];
					if (saveData != null) {
						$.each(saveData, function(index, obj) {
							userIds.push(obj.userId)
						});
						param.userIdList = userIds;// 待置课的选课学生
					}
					param.flag = 2;// 调整选课
					batchSaveCourseDtoList.push(param);
					// 返回数据
					return callback(batchSaveCourseDtoList);
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},

		/**
		 * 弹框 选课不成功学生名单
		 */
		popSelectionResults : function(data) {
			popup.data("data", data);// 选课不成功学生名单数据
			popup.open('./choicecourse/manage/batchchoice/html/selectionResults.html', // 这里是页面的路径地址
			{
				id : 'selectionResults',
				title : '选课不成功学生名单',
				width : 750,
				height : 300,
				okVal : '关闭',
				// cancelVal : '关闭',
				ok : function() {
					// 刷新列表
					batchchoice.getBatchChoiceList();
				}
			});
		},

		/**
		 * 选课不成功学生名单列表数据
		 * 
		 */
		initSelectionResults : function() {
			var data = popup.data("data");// 选课不成功学生名单数据
			$("#tbodycontent").html("");
			$("#tbodycontent").removeClass("no-data-html");
			if (data != null && data.data.length > 0) {
				if (data.data[0].userId == "500") {
					$("#tbodycontent").append("<tr><td colspan='5'>" + data.data[0].reason + "</td></tr>");
				} else {
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
				}
			} else {
				$("#tbodycontent").append("<tr><td colspan='5'></td></tr>").addClass("no-data-html");				
			}
		}

	/** ********************* end ******************************* */
	}
	module.exports = batchchoice;
	window.batchchoice = batchchoice;
});