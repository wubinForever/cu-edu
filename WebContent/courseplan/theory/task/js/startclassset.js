/**
 * 理论任务设置 -- 编辑页面
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var common = require("basePath/utils/common");
	var config = require("basePath/utils/config");
	// 下拉框
	var URL_COURSEPLAN = require("basePath/config/url.courseplan");
	var URL_UDF = require("basePath/config/url.udf");
	var URL_DATA = require("basePath/config/url.data");
	var DICTIONARY = require("basePath/config/data.dictionary");
	// 工具
	var popup = require("basePath/utils/popup");
	var mapUtil = require("basePath/utils/mapUtil");
	var teacher = require("../../../common/js/teacher");
	var openMessage = require("../../../common/js/openMessage");
	var classinfo = require("./classinfo");

	/**
	 * 开课计划对应的理论任务信息
	 */
	var startclassset = {
		/**
		 * 列表数据存储 key -value ,key:教学班号
		 */
		dataMap : new mapUtil(),
		deletedDataArray : [],
		/**
		 * 初始化
		 */
		init : function() {

			$("[data-toggle='tooltip']").tooltip();
			var startclassPanId = popup.getData("startclassPanId");
			var semester = popup.getData("semester");
			var courseId = popup.getData("courseId");
			popup.setData("startclassset", startclassset);
			var startclasspan = popup.getData("startclasspan");
			var semesters = semester.split("_");
			if (semesters.length == 2) {
				this.startclassPanId = startclassPanId;
				this.loadTheoretical(startclassPanId, semester);
				this.academicYear = semesters[0];
				this.semesterCode = semesters[1];
				this.bindEvent(courseId, this.academicYear, this.semesterCode);
				this.teachMethod = startclasspan.teachMethod;
				this.getTimeSettings();
				this.loadTeachclass(courseId);
				this.teachGroup = startclassset.loadTeachGroupData(courseId, this.academicYear, this.semesterCode);// 加载教学组
			}
		},
		/**
		 * 绑定事件
		 */
		bindEvent : function(courseId, academicYear, semesterCode) {
			// 新增理论任务（教学班）
			$("#addTeachClassBtn").click(function() {
				if (!startclassset.getTeachclassSize()) {
					popup.warPop("教学班不能超过50个");
				} else {
					startclassset.addTheoretical();
				}
			});
			// 选择任课老师
			$(document).on("click", "div.cont-list-box.teacher:not(.disabled)", function() {
				startclassset.chooseTeacher(this);
			});
			// 选择行政班
			$(document).on("click", "div.cont-list-box.classinfo:not(.disabled)", function() {
				startclassset.chooseClass(this);
			});
			// 选择行政班
			openMessage.message("div.cont-list-box.classinfo.disabled", "行政班");
			// 选择节次
			$(document).on("click", "button[name=sectionSet]:not(.disabled)", function() {
				startclassset.chooseSection(this);
			});
			// 删除
			$(document).on("click", "button[name=remove]:not(.disabled)", function() {
				var _ = this;
				popup.askDeletePop("理论任务", function() {
					startclassset.removeTeachclass(_);
				});
			});

			// 选择上课地点要求
			$(document).on("click", "div.cont-list-box.roominfo:not(.disabled)", function() {
				startclassset.chooseRoom(this);
			});
			// 批量新增教学班
			$("#batchAddTeachClassBtn").click(function() {
				var count = $("#teachclassCount").val();
				count = parseInt(count);
				var studentSize = "";
				var classList = "";
				if (startclassset.theoretical.classList.length == count) {
					classList = startclassset.theoretical.classList;
				}
				for (var i = 0; i < count; i++) {
					if (!startclassset.getTeachclassSize()) {
						popup.warPop("教学班不能超过50个");
						break;
					}
					if (classList && classList.length > 0) {
						var classinfo = classList[i];
						if (classinfo.studentCount > 0) {
							studentSize = classinfo.studentCount;
						} else {
							studentSize = classinfo.presetNumber;
						}
					}
					startclassset.addTheoretical(studentSize, classinfo);
				}
			});

			// 管理教学组
			$("#addTeachGroupBtn").click(function() {
				var semesterCourseData = {};
				semesterCourseData.academicYear = academicYear;
				semesterCourseData.semesterCode = semesterCode;
				semesterCourseData.courseId = courseId;
				startclassset.addTeachGroup(this, semesterCourseData);
			});
		},
		/**
		 * return ture:能再添加， false不能添加了
		 */
		getTeachclassSize : function() {
			var length = $("#tbodycontent tr").length;
			return length < 50 ? true : false;
		},
		/**
		 * 加载开课信息数据（包括班级）
		 */
		loadTheoretical : function(startclassPanId, semester) {
			ajaxData.contructor(false);
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETITEM, {
				id : startclassPanId,
				semester : semester
			}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					startclassset.formatHtml(data.data);
				} else {
					popup.errPop("查询失败：" + data.msg);
				}
			});
		},
		/**
		 * 封装开课信息数据的html
		 */
		formatHtml : function(item) {
			$("#courseName").html("[" + item.courseNo + "]" + item.courseName).prop("title", "[" + item.courseNo + "]" + item.courseName);
			$("#departmentName").html(item.departmentName).prop("title", item.departmentName);
			$("#courseTypeCodeName").html(item.courseTypeCodeName).prop("title", item.courseTypeCodeName);
			$("#courseAttributeCodeName").html(item.courseAttributeCodeName).prop("title", item.courseAttributeCodeName);
			$("#credit").html(item.credit);
			$("#totalPeriod").html(item.totalPeriod);
			$("#theoryPeriod").html(item.theoryPeriod);
			$("#experiPeriod").html(item.experiPeriod);
			$("#practicePeriod").html(item.practicePeriod);
			$("#otherPeriod").html(item.otherPeriod);
			$("#checkWayCodeName").html(item.checkWayCodeName);
			$("#unSettingCount").html(item.unSettingCount);
			$("#teachclassCount").val(item.unSettingCount > 50 ? 50 : item.unSettingCount);
			$("#majorName").html(item.majorName).attr("title", item.majorName);
			$("#classTbodycontent").html($("#classTmpl").tmpl(item.classList)).setNoDataHtml();
			common.titleInit();// 添加title
			this.theoretical = item;
		},
		/**
		 * 添加单条理论任务
		 */
		addTheoretical : function(count, classinfo) {
			var item = {};
			var theoryNo = this.getTheoryNo();
			if (!count) {
				count = $("#teachclassStudentCount").val();
			}
			if (theoryNo != '-1') {
				item.teachMethod = this.teachMethod;
				item.teachGroup = this.teachGroup;
				item.weeklyHours = this.theoretical.weekPeriod;
				item.teachingClassNo = theoryNo;
				item.section = this.getSection();
				item.teachingClassMemberCount = count;
				item.singleOrDoubleWeek = 0;
				item.continBlwdwnCount = 0;
				item.isContains = false;
				item.quote = false;
				item.teachingGroupId = null;
				if (!item.arrangeWeeks) {
					item.arrangeWeeks = "";
				}
				var tr = this.formatTheoreticalHtml(item);
				this.dataMap.put(theoryNo, item);
				// 行政班
				if (classinfo) {
					item.classes = [ classinfo ];
					var classDiv = tr.find("div.cont-list-box.classinfo");
					this.setClass(classDiv, item);
				}
				common.spinnerNumber();
			}
		},
		getSection : function() {
			var sectionNum = startclassset.timesettings.amSectionNumber + startclassset.timesettings.nightSectionNumber + startclassset.timesettings.pmSectionNumber;
			var section = [];
			for (var i = 1; i <= sectionNum && i <= 6; i++) {
				var obj = {};
				obj.num = i;
				if (sectionNum >= 2 && i == 2) {
					obj.selected = true;
				} else {
					obj.selected = false;
				}
				section.push(obj);
			}
			return section;
		},
		/**
		 * 封装理论任务或多条html（单条）
		 */
		formatTheoreticalHtml : function(item) {
			var tr = $("#teachclassTmpl").tmpl(item);
			$("#tbodycontent").append(tr).scrollTop(0).setNoDataHtml();
			this.resetSequence();
			return tr;
		},

		/**
		 * 重置序号
		 */
		resetSequence : function() {
			$("#tbodycontent tr").each(function(i, tr) {
				$(tr).find("td:first").html(i + 1);
			})

		},
		/**
		 * 获取教学班编号
		 */
		getTheoryNo : function() {
			var courseNo = this.theoretical.courseNo;
			var theoryNo = this.theoryNo;
			if (!theoryNo) {
				theoryNo = "001";
			} else {
				var no = parseInt(theoryNo);
				no++;
				if (no >= 1000) {
					return "-1";
				}
				if (no < 10) {
					theoryNo = "00" + no;
				} else if (no < 100) {
					theoryNo = "0" + no;
				} else {
					theoryNo = no + "";
				}
			}
			this.theoryNo = theoryNo;
			return courseNo + "-" + theoryNo;
		},
		/**
		 * 查询排课时间
		 */
		getTimeSettings : function() {
			var reqData = {};
			reqData.academicYear = this.academicYear;
			reqData.semesterCode = this.semesterCode;
			ajaxData.request(URL_COURSEPLAN.PARAMETER_TIME_GETITEM, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					startclassset.timesettings = data.data;
					startclassset.getWeekNum();
				} else {
					popup.errPop("查询失败：" + data.msg);
				}
			});
		},
		/**
		 * 获取星期
		 */
		getWeekNum : function() {
			var weekSize = startclassset.timesettings.weekCourseDays;
			var reqData = {};
			reqData.academicYear = this.academicYear;
			reqData.semesterCode = this.semesterCode;
			ajaxData.request(URL_DATA.SCHOOLCALENDAR_GETCALENDAR, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var weekStartDay = data.data.weekStartDay;
					var result = [];
					if (weekStartDay == 0) {
						result.push(7);
						for (var i = 1; i < weekSize; i++) {
							result.push(i);
						}
					} else {
						for (var i = 1; i <= weekSize; i++) {
							result.push(i);
						}
					}
					startclassset.weekNum = result;
					popup.setData("weekNum", result);
				} else {
					popup.errPop("查询失败：" + data.msg);
				}
			});
		},
		/**
		 * 选择任课老师
		 */
		chooseTeacher : function(obj) {
			var div = $(obj), me = this, tr = div.parents("tr"), code = tr.attr("code"), item = me.dataMap.get(code);
			teacher.chooseTeacher(item.teachers, function(data) {
				if (data && data.length > 10) {
					var arr = [];
					$.each(data, function(i, o) {
						if (i < 10) {
							arr.push(o);
						}
					});
					data = arr;
					popup.warPop("任课老师不能超过10个");
				}
				item.teachers = data;
				me.setTeacher(div, item);
			});
		},
		/**
		 * 设置任课老师
		 */
		setTeacher : function(div, item) {
			div.empty();
			var title = [];
			if (item.teachers) {
				$.each(item.teachers, function(i, bean) {
					var teacherStr = "[" + bean.teacherNo + "]" + bean.teacherName;
					if (i < 4) {
						var span = $("<div class='ellipsis'>" + teacherStr + "</div>");
						div.append(span);
					}
					title.push(teacherStr);
				});
				div.prop("title", title.join("\r\n"));
			}
		},
		/**
		 * 设置行政班
		 */
		chooseClass : function(obj) {
			var div = $(obj), me = this, tr = div.parents("tr"), code = tr.attr("code"), item = me.dataMap.get(code), startclassPanId = this.startclassPanId;
			this.openClass({
				id : startclassPanId,
				list : item.classes,
				data : item
			}, function(data) {
				item.classes = data;
				me.setClass(div, item);
			});
		},
		/**
		 * 设置行政班
		 */
		setClass : function(div, item) {
			div.empty();
			var title = [];
			var me = this;
			$.each(item.classes, function(i, bean) {
				var classStr = bean.className;
				if (i < 4) {
					var span = $("<div class='ellipsis'>" + classStr + "</div>");
					div.append(span);
				}
				title.push(classStr);
			});
			div.attr("data-original-title", title.join("\r\n")).attr("data", title.join("#@#"));
		},
		/**
		 * 选择行政班弹窗
		 */
		openClass : function(data, callback) {
			popup.setData("classData", data);
			popup.setData("academicYear", this.academicYear);
			popup.setData("semesterCode", this.semesterCode);
			popup.setData("theoretical", this.theoretical);
			popup.setData("classIdList", this.getClassIdList(data.data));
			popup.setData("theoreticalIdList", this.deletedDataArray);
			popup.open('./courseplan/theory/task/html/classinfo.html', {
				id : 'classinfo',// 唯一标识
				title : '行政班选择',// 这是标题
				width : 1300,// 这是弹窗宽度。其实可以不写
				height : 780,// 弹窗高度*/
				okVal : '确定',
				cancelVal : '取消',
				// fixed: true,
				ok : function() {
					var shuffing = popup.getData("shuff");
					return callback(shuffing.getData());
				},
				cancel : function() {
					return true;
				}
			});
		},
		getClassIdList : function(data) {
			var idList = [];
			$.each(this.dataMap.values(), function(i, item) {
				if (item.teachingClassNo != data.teachingClassNo) {
					if (item.classes) {
						$.each(item.classes, function(j, bean) {
							if (!idList.contains(bean.classId)) {
								idList.push(bean.classId);
							}
						});
					}
				}
			});
			return idList;
		},
		/**
		 * 设置节次
		 */
		chooseSection : function(obj) {
			var button = $(obj), me = this, tr = button.parents("tr"), code = tr.attr("code"), item = me.dataMap.get(code), startclassPanId = this.startclassPanId;
			this.openSection(item, function(data) {
				me.setSection(button, data, item);
			});
		},
		/**
		 * 选择节次弹窗
		 */
		openSection : function(data, callback) {
			popup.setData("sectionData", data);
			popup.setData("timesettings", startclassset.timesettings);
			popup.open('./courseplan/theory/task/html/section.html', {
				id : 'section',// 唯一标识
				title : '节次要求选择',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 650,// 弹窗高度*/
				// fixed: true,
				button : [ {
					name : '确定',
					focus : true,
					callback : function() {
						var section = popup.getData("section");
						return callback(section.getData());
					},
					autofocus : true
				}, {
					name : "置空",
					callback : function() {
						var section = popup.getData("section");
						section.setData([ [], [] ]);
						return callback(section.getData());
					}
				}, {
					name : "取消"
				} ]
			});
		},
		/**
		 * 设置节次
		 */
		setSection : function(obj, sectionData, item) {
			item.forbiddenSection = sectionData[0];
			item.solidLineSection = sectionData[1];
			if (item.forbiddenSection.length > 0 || item.solidLineSection.length > 0) {
				obj.html("有");
			} else {
				obj.html("无");
			}
		},
		/**
		 * 选择场地
		 */
		chooseRoom : function(obj) {
			var div = $(obj), me = this, tr = div.parents("tr"), code = tr.attr("code"), item = me.dataMap.get(code);
			this.openRoom(item, function(data) {
				me.setRoom(div, item, data);
			});
		},
		/**
		 * 打开弹窗选择场地
		 */
		openRoom : function(data, callback) {
			popup.setData("teachroomData", data);
			popup.open('./courseplan/theory/task/html/teachroom.html', {
				id : 'section',// 唯一标识
				title : '上课地点要求选择',// 这是标题
				width : 570,// 这是弹窗宽度。其实可以不写
				height : 325,// 弹窗高度*/
				fixed : true,
				button : [ {
					name : '确定',
					focus : true,
					callback : function() {
						var teachroom = popup.getData("teachroom");
						return callback(teachroom.getData());
					},
					autofocus : true
				}, {
					name : "置空",
					callback : function() {
						var teachroom = popup.getData("teachroom");
						teachroom.clear();
						return callback(teachroom.getData());
					}
				}, {
					name : "取消"
				} ]
			});
		},
		/**
		 * 选择后返回值
		 */
		setRoom : function(div, item, data) {
			item = $.extend(item, data);
			!data.teachroomTypeCode && delete item.teachroomTypeCode && delete item.teachroomTypeName;
			!data.campusId && delete item.campusId && delete item.campusName;
			!data.buildingId && delete item.buildingId && delete item.buildingName;
			!data.teachroomId && delete item.teachroomId && delete item.teachroomName;

			div.empty();
			var title = [];
			if (utils.isNotEmpty(data.teachroomTypeCode) && data.teachroomTypeCode != '-1') {
				div.append($("<div class='ellipsis'>" + data.teachroomTypeName + "</div>"));
				title.push(data.teachroomTypeName);
			}
			if (utils.isNotEmpty(data.campusId) && data.campusId != '-1') {
				div.append($("<div class='ellipsis'>" + data.campusName + "</div>"));
				title.push(data.campusName);
			}
			if (utils.isNotEmpty(data.buildingId) && data.buildingId != '-1') {
				div.append($("<div class='ellipsis'>" + data.buildingName + "</div>"));
				title.push(data.buildingName);
			}
			if (utils.isNotEmpty(data.teachroomId) && data.teachroomId != '-1') {
				div.append($("<div class='ellipsis'>" + data.teachroomName + "</div>"));
				title.push(data.teachroomName);
			}
			div.prop("title", title.join("\r\n"));
			return true;
		},
		/**
		 * 获取教学班值
		 */
		getData : function() {
			var me = this, dataMap = me.dataMap, academicYear = this.academicYear, semesterCode = this.semesterCode, theoretical = this.theoretical, courseId = theoretical.courseId;
			var data = [];
			var param = {};
			var startclassPlanIds = [];
			if (theoretical.startclassPanId) {
				$.each(theoretical.startclassPanId.split(","), function(b, bean) {
					startclassPlanIds.push(bean);
				});
			}
			param.academicYear = academicYear;
			param.semesterCode = semesterCode;
			param.courseId = courseId;
			param.startclassPlans = startclassPlanIds;
			param.list = data;
			$.each(dataMap.values(), function(i, item) {
				if (item.isContains === false) {
					var obj = {}
					var tr = $("tr[code=" + item.teachingClassNo + "]");
					obj.id = item.id;
					obj.academicYear = academicYear;
					obj.semesterCode = semesterCode;
					obj.courseId = courseId;
					obj.teachingClassNo = item.teachingClassNo;
					obj.teachingClassMemberCount = tr.find("input[name=teachingClassMemberCount]").val();
					obj.teachingMethodsCode = tr.find("select[name=teachingMethodsCode]").val();
					obj.teachingGroupId = tr.find("select[name=teachingGroupId]").val();// 教学组
					obj.weeklyHours = tr.find("input[name=weeklyHours]").val();
					obj.continBlwdwnCount = tr.find("select[name=continBlwdwnCount]").val();
					obj.arrangeWeeks = tr.find("textarea[name=arrangeWeeks]").val();
					obj.singleOrDoubleWeek = tr.find("select[name=singleOrDoubleWeek]").val();
					obj.teachroomTypeCode = item.teachroomTypeCode;
					obj.campusId = item.campusId;
					obj.buildingId = item.buildingId;
					obj.teachroomId = item.teachroomId;
					obj.solidLineSection = "";
					if (item.solidLineSection && item.solidLineSection.length > 0) {
						for (var m = 0, length = item.solidLineSection.length; m < length; m++) {
							if (m != 0) {
								obj.solidLineSection += ",";
							}
							obj.solidLineSection += item.solidLineSection[m];
						}
					}
					obj.forbiddenLineSection = "";
					if (item.forbiddenSection && item.forbiddenSection.length > 0) {
						for (var m = 0, length = item.forbiddenSection.length; m < length; m++) {
							if (m != 0) {
								obj.forbiddenLineSection += ",";
							}
							obj.forbiddenLineSection += item.forbiddenSection[m];
						}
					}
					if (item.classes) {
						var classes = [];
						$.each(item.classes, function(b, bean) {
							classes.push(bean.classId);
						});
						obj.classes = classes;
					}
					if (item.teachers) {
						var teachers = [];
						$.each(item.teachers, function(b, bean) {
							teachers.push(bean.id);
						});
						obj.teacherInfos = teachers;
					}
					obj.startclassPlans = startclassPlanIds;
					data.push(obj);
				}

			});
			return param;
		},
		validate : function() {
			var data = this.getData();
			var flag = true;
			$.each(data.list, function(i, item) {
				var teachingClassNo = item.teachingClassNo;
				if (!item.teachingMethodsCode) {
					popup.warPop("教学班（" + teachingClassNo + "）：授课方式不能为空");
					flag = false;
					return;
				}
				if (!item.weeklyHours) {
					popup.warPop("教学班（" + teachingClassNo + "）：周学时不能为空");
					flag = false;
					return;
				}
				if (!item.continBlwdwnCount) {
					popup.warPop("教学班（" + teachingClassNo + "）：连排节数不能为空");
					flag = false;
					return;
				}
				if (!item.arrangeWeeks) {
					popup.warPop("教学班（" + teachingClassNo + "）：排课周次不能为空");
					flag = false;
					return;
				} else if (!utils.isWeek(item.arrangeWeeks)) {
					popup.warPop("教学班（" + teachingClassNo + "）：排课周次格式有误");
					flag = false;
					return;
				}
				if (!item.teachingClassMemberCount) {
					popup.warPop("教学班（" + teachingClassNo + "）：教学班人数不能为空");
					flag = false;
					return;
				} else if (!utils.isNumber(item.teachingClassMemberCount)) {
					popup.warPop("教学班（" + teachingClassNo + "）：教学班人数格式有误");
					flag = false;
					return;
				}
				if (!(item.classes && item.classes.length > 0)) {
					popup.warPop("教学班（" + teachingClassNo + "）：行政班级不能为空");
					flag = false;
					return;
				}
			});
			return flag;
		},
		/**
		 * 保存数据到数据库
		 */
		save : function() {
			if (this.validate()) {
				var data = this.getData();
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_SAVE, JSON.stringify(data), function(data) {
					if (data.code == config.RSP_SUCCESS) {
						var startclasspan = popup.getData("startclasspan");
						startclasspan.startclassOpen.close();
						popup.okPop("后台理论任务数据保存中");
					} else if (data.code == 99) {
						popup.warPop(data.msg);
					} else {
						popup.errPop(data.msg);
					}
				}, true);
			}
			return false;
		},
		loadTeachclass : function(courseId) {
			var me = this;
			var param = {};
			param.courseId = courseId;
			param.academicYear = me.academicYear;
			param.semesterCode = me.semesterCode;
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETTHEORYLIST, JSON.stringify(param), function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item) {
						var isContains = me.isContains(item.startclassPlanIds);
						item.isContains = !isContains;
						me.dataMap.put(item.teachingClassNo, item);
						item.section = me.getSection();
						item.teachMethod = me.teachMethod;
						item.teachGroup = me.teachGroup;
						var tr = me.formatTheoreticalHtml(item);
						me.setRoom(tr.find("div.cont-list-box.roominfo"), item, item);

						var sectionObj = tr.find("button[name=sectionSet]");
						if (item.forbiddenLineSection) {
							item.forbiddenSection = item.forbiddenLineSection.split(",");
						} else {
							item.forbiddenSection = [];
						}
						if (item.solidLineSection) {
							item.solidLineSection = item.solidLineSection.split(",");
						} else {
							item.solidLineSection = [];
						}
						if ((item.forbiddenSection && item.forbiddenSection.length > 0) || (item.solidLineSection && item.solidLineSection.length > 0)) {
							sectionObj.html("有");
						} else {
							sectionObj.html("无");
						}
						// 行政班
						var classinfo = tr.find("div.cont-list-box.classinfo");
						item.classes = item.classInfos;
						me.setClass(classinfo, item);
						// 老师
						var teachers = tr.find("div.cont-list-box.teacher");
						me.setTeacher(teachers, item);
					});

					var length = data.data.length;
					if (data.data && length > 0) {
						var teachingClassNo = data.data[length - 1].teachingClassNo;
						var ss = teachingClassNo.split("-");
						me.theoryNo = ss[ss.length - 1];
					}
					common.spinnerNumber();
					me.getQuote();
				} else {
					popup.errPop(data.msg);
				}
			}, true);
		},
		/**
		 * 当前的理论任务是否属于当前的开课计划
		 */
		isContains : function(ids) {
			if (this.theoretical) {
				this.startclassPlanIdList = this.theoretical.startclassPanId.split(",");
				var list = this.startclassPlanIdList;
				for (var i = 0, iLength = list.length; i < iLength; i++) {
					for (var j = 0, jLength = ids.length; j < jLength; j++) {
						if (this.startclassPlanIdList[i] == ids[j]) {
							return true;
						}
					}
				}
			}
			return false;
		},
		removeTeachclass : function(obj) {
			var tr = $(obj).parents("tr"), code = tr.attr("code");
			tr.remove();
			var item = this.dataMap.get(code);
			if (item && item.id && !this.deletedDataArray.contains(item.id)) {
				this.deletedDataArray.push(item.id);
			}
			this.dataMap.remove(code);
			this.resetSequence();
			if (this.dataMap.values().length == 0) {
				delete this.theoryNo;
			}
		},
		getQuote : function() {
			var ids = [];
			$.each(this.dataMap.values(), function(i, item) {
				if (item.id) {
					ids.push(item.id);
				}
			})
			ajaxData.contructor(true);
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_QUOTE, {
				ids : ids
			}, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item) {
						if (item) {
							$("button[delete=" + i + "]").addClass("disabled");
						}
					});
				} else {
					popup.errPop(data.msg);
				}
			});
		},
		/**
		 * 管理教学组页面-zl-20180309
		 */
		addTeachGroup : function(obj, semesterCourseData) {
			var div = $(obj), me = this, tr = div.parents("tr"), code = tr.attr("code"), item = me.dataMap.get(code);

			this.openTeachGroup(item, semesterCourseData);
		},
		/**
		 * 打开弹窗管理教学组页面
		 */
		openTeachGroup : function(data, semesterCourseData) {
			popup.setData("teachgroupData", data);
			popup.setData("semesterCourseData", semesterCourseData);
			popup.open('./courseplan/theory/task/html/teachinggrouplist.html', {
				id : 'section',// 唯一标识
				title : '教学组管理',// 这是标题
				width : 570,// 这是弹窗宽度。其实可以不写
				height : 570,// 弹窗高度*/
				okVal : '确定',
				cancelVal : '取消',
				ok : function(iframeObj) {
					var teachgroup = popup.getData("teachgroup");
					var teachgroupList = teachgroup.getData();
					if (!teachgroupList) {
						return false;
					}

					var flag = true;

					// post请求提交数据
					ajaxData.contructor(false);
					ajaxData.setContentType("application/json;charset=utf-8");
					ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_SAVETEACHGROUP, JSON.stringify(teachgroupList), function(data) {
						if (data.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("保存成功", function() {
							});
							// 重新加载教学组
							startclassset.reloadTeachGroupData(iframeObj, semesterCourseData);
						} else {
							// 提示失败信息
							popup.errPop(data.msg);
							flag = false;
						}
					});
					return flag;

				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		/**
		 * 加载教学组
		 */
		loadTeachGroupData : function(courseId, academicYear, semesterCode) {
			var semesterCourseData = {};
			semesterCourseData.academicYear = academicYear;
			semesterCourseData.semesterCode = semesterCode;
			semesterCourseData.courseId = courseId;
			var reqData = [];
			ajaxData.contructor(false);
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETTEACHGROUPSELECT, semesterCourseData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					reqData = data.data;
				} else {
					popup.errPop("查询失败：" + data.msg);
				}
			});
			var me = this;
			me.teachGroup = reqData;
			return reqData;
		},
		/**
		 * 管理教学组后更新列表中教学组下拉框值
		 */
		reloadTeachGroupData : function(iframeObj, semesterCourseData) {
			var reqData = [];
			ajaxData.contructor(false);
			ajaxData.request(URL_COURSEPLAN.TEACHCLASS_THEORETICAL_GETTEACHGROUPSELECT, semesterCourseData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					reqData = data.data;
				} else {
					popup.errPop("查询失败：" + data.msg);
				}
			});
			$("select[name='teachingGroupId']").each(function() {
				var selectedVal = $(this).val();
				$(this).empty();
				var sel = $(this);
				if (selectedVal == "") {
					sel.append("<option value='' selected='selected'>请选择</option>");
				} else {
					sel.append("<option value=''>请选择</option>");
				}
				$.each(reqData, function(n, value) {					
					if (selectedVal == value.value) {
						sel.append("<option value='" + value.value + "' selected='selected'>" + value.name + "</option>");
					} else {
						sel.append("<option value='" + value.value + "'>" + value.name + "</option>");
					}
				});
			});
		}
	}
	module.exports = startclassset;
});