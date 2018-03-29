/**
 * 设置选择学生js
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
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dictionary = require("basePath/config/data.dictionary");
	var student = require("../../../common/js/student");
	var base = config.base;
	/**
	 * 设置选课学生
	 */
	// 模块化
	var choicestudent = {
		/**
		 * 记住查询条件
		 */
		queryRememberObject : {},
		/**
		 * 主列表页面初始化
		 */
		init : function() {
			// 加载查询条件
			choicestudent.initQuery("list");
			choicestudent.queryRememberObject = choicestudent.queryObject();// 记住查询参数
			// 加载列表数据
			choicestudent.getChoiceMajorList(URL_CHOICECOURSE.CHOICESTUDENT_GETLIST);
			// 查询按钮
			$("#query").on("click", function() {
				choicestudent.queryRememberObject = choicestudent.queryObject();// 记住查询参数
				choicestudent.getChoiceMajorList(URL_CHOICECOURSE.CHOICESTUDENT_GETLIST);
			});

			// 双表格右侧全选
			utils.checkAllCheckboxes('check-all-right', 'checNormal-right');

			// 开放专业 弹框
			$(document).on("click", "button[name ='openProfession']", function() {
				choicestudent.popOpenProfession();
			});

			// 批量移除专业
			$(document).on("click", "button[name ='deleteProfession']", function() {
				choicestudent.batchDeleteProfession();
			});

			// 禁选单个学生 弹框
			$(document).on("click", "button[name ='prohibitChoose']", function() {
				// 参数
				var paramRem = choicestudent.queryRememberObject;
				// var semester = $("#semester").val();
				// var roundId = $("#roundId").val();

				// 该轮次下所有年级、专业
				var gradeMajorDtoList = [];// 年级专业对象集合
				$("tbody button[name ='setProhibitChoose']").each(function() {
					var gradeMajorIdStr = $(this).attr("data-tt-id");
					// 对字符串进行拆分组装成年级专业对象
					var gradeMajorDto = choicestudent.getGradeMajorDto(gradeMajorIdStr);
					// 添加到集合
					gradeMajorDtoList.push(gradeMajorDto);
				});

				// 传递参数到禁选单个学生界面
				choicestudent.popProhibitChoose(paramRem, gradeMajorDtoList);
			});

			// 设置禁选学生 弹框
			$(document).on("click", "button[name ='setProhibitChoose']", function() {
				// 参数
				var paramRem = choicestudent.queryRememberObject;
				// var semester = $("#semester").val();
				// var roundId = $("#roundId").val();

				// 该轮次下该专业的年级、专业、选择专业Id
				var gradeMajorIdStr = $(this).attr("data-tt-id");
				var gradeMajorDto = choicestudent.getGradeMajorDto(gradeMajorIdStr);
				var gradeMajorDtoList = [];
				gradeMajorDtoList.push(gradeMajorDto);

				// 参数
				var param = {};
				// param = choicestudent.getSemesterSplit(param, semester);
				param.academicYear = paramRem.academicYear;
				param.semesterCode = paramRem.semesterCode;
				param.gradeMajorDto = gradeMajorDtoList;
				param.roundId = paramRem.roundId;

				// 右侧列表数据-已经存在的禁选学生列表
				var data = choicestudent.getExistStudentList(param);

				// 打开设置禁选学生页面：左右切换
				student.chooseStudent(data, param, function(saveData, choiceMajorId) {
					// 保存禁选学生数据
					choicestudent.saveBatchStudent(saveData, choiceMajorId);
				});
			});
		},

		/**
		 * 查询选择学生专业信息列表
		 * 
		 * @param urlStr
		 *            选择专业主列表页面或者开放专业列表页面
		 */
		getChoiceMajorList : function(urlStr) {
			var reqData = choicestudent.queryObject();
			ajaxData.request(urlStr, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data != null && data.data.length > 0) {
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
				} else {
					$("#tbodycontent").append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
				}
				// 取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}, true);
		},

		/**
		 * 查询条件初始化
		 * 
		 * @param type:list选择专业主列表页面，openList开放专业列表页面
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

				// openList开放专业列表页面,学年学期改变时，选课轮次改变，开放专业列表更新
				if (type == "openList") {
					choicestudent.changeList();
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
				firstValue : "",
				async : false
			});

			// 加载培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode", dictionary.ID_FOR_TRAINING_LEVEL, {
				firstText : "全部",
				firstValue : ""
			});
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
			param.majorName = $.trim($("#majorName").val());
			param.trainingLevelCode = $("#trainingLevelCode").val();
			return choicestudent.getSemesterSplit(param, semester);
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
		 * 初始化开放专业
		 */
		initOpenProfession : function() {
			// 加载查询条件
			choicestudent.initQuery("openList");

			// 加载列表数据
			choicestudent.getChoiceMajorList(URL_CHOICECOURSE.CHOICESTUDENT_GETOPENLIST);

			// 验证
			choicestudent.validateFormData();

			// 选择选课轮次更新列表，并将查询条件值默认
			$("#roundId").change(function() {
				choicestudent.changeList();
			});

			// 查询按钮
			$("#queryOpen").on("click", function() {
				choicestudent.getChoiceMajorList(URL_CHOICECOURSE.CHOICESTUDENT_GETOPENLIST);
			});
		},

		/**
		 * 根据轮次刷新开放专业列表
		 */
		changeList : function() {
			$("#grade").val("-1");
			$("#departmentId").val("");
			$("#majorName").val("");
			$("#trainingLevelCode").val("");
			// 加载列表数据
			choicestudent.getChoiceMajorList(URL_CHOICECOURSE.CHOICESTUDENT_GETOPENLIST);
		},

		/**
		 * 弹框 开放专业
		 */
		popOpenProfession : function() {
			popup.open('./choicecourse/parameter/choicestudent/html/openProfession.html', // 这里是页面的路径地址
			{
				id : 'popHtmlselect',
				title : '开放专业',
				width : 950,
				height : 570,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					// 确定逻辑
					var v = iframeObj.$("#addForm").valid(); // 验证表单
					// 表单验证通过
					if (v) {
						return choicestudent.saveGradeMajor(iframeObj); // 绑定新增数据
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
		 * 批量保存开放专业
		 * 
		 * @param iframeObj
		 *            当前窗体对象
		 */
		saveGradeMajor : function(iframeObj) {
			// 批量勾选专业
			var gradeMajorIdArr = [];// 场次时间Id
			iframeObj.$("#tbodycontent input[type='checkbox']:checked").each(function() {
				var gradeMajorIdStr = $(this).val();
				if (gradeMajorIdStr != null && gradeMajorIdStr.length > 0) {
					var strArr = gradeMajorIdStr.split("_");
					var gradeMajorId = strArr[0];
					var grade = strArr[1];
					var majorId = strArr[2];
					gradeMajorIdArr.push({
						gradeMajorId : gradeMajorId,
						grade : grade,
						majorId : majorId
					});
				}
			});
			if (gradeMajorIdArr.length == 0) {
				popup.warPop("请勾选专业");
				return false;
			}

			// 参数
			var saveParams = {};
			var semester = iframeObj.$("#semester").val();
			saveParams.gradeMajorDto = gradeMajorIdArr;
			saveParams.academicYear = semester.split("_")[0];
			saveParams.semesterCode = semester.split("_")[1];
			saveParams.roundId = iframeObj.$("#roundId").val();

			var flag = false;
			// post请求提交数据
			ajaxData.contructor(false);
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_CHOICECOURSE.CHOICESTUDENT_ADD, JSON.stringify(saveParams), function(data) {
				if (data.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("保存成功", function() {
					});
					// 刷新列表
					choicestudent.getChoiceMajorList(URL_CHOICECOURSE.CHOICESTUDENT_GETLIST);
					flag = true;
				} else {
					// 提示失败
					popup.errPop(data.msg);
				}
			});
			return flag;
		},

		/**
		 * 批量移除专业
		 */
		batchDeleteProfession : function() {
			var ids = [];
			$("tbody input[type='checkbox']:checked").each(function() {
				var obj = $(this).parent().find("input[name='checNormal']").val();
				ids.push(obj);
			});
			if (ids.length == 0) {
				popup.warPop("请勾选要移除的专业");
				return false;
			}
			// 参数
			var param = {
				"ids" : ids
			};
			popup.askPop("确认移除专业并清除禁选学生吗？", function() {
				ajaxData.contructor(false);
				ajaxData.request(URL_CHOICECOURSE.CHOICESTUDENT_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("移除成功", function() {
						});
						// 刷新列表
						choicestudent.getChoiceMajorList(URL_CHOICECOURSE.CHOICESTUDENT_GETLIST);
					} else {
						// 提示失败
						popup.errPop(data.msg);
					}
				}, true);

			});
		},

		/**
		 * 初始化禁选单个学生
		 */
		initProhibitSingle : function() {
			// 验证
			choicestudent.validateFormData();

			// 加载列表数据
			// choicestudent.getStudentList();默认列表为空
			$("#tbodycontent").append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");

			// 查询按钮
			$("#queryProhibit").on("click", function() {
				var v = $("#addForm").valid(); // 验证表单
				if (v) {
					choicestudent.getStudentList();
				}
			});
		},
		/**
		 * 列表查询参数
		 * 
		 * @returns 参数集合
		 */
		getProhibitSingleParam : function() {
			// 参数
			var paramRem = popup.data("paramRem");
			var gradeMajorDtoList = popup.data("gradeMajorDtoList");

			var param = {};
			param.academicYear = paramRem.academicYear;
			param.semesterCode = paramRem.semesterCode;
			param.gradeMajorDto = gradeMajorDtoList;// 获取专业年级对象集合
			param.roundId = paramRem.roundId;
			param.studentName = $.trim($("#studentName").val());
			return param;
		},

		/**
		 * 设置禁选学生-禁选单个学生列表（排除已经存在的）或者 设置禁选学生列表页面
		 * 
		 */
		getStudentList : function() {
			var param = choicestudent.getProhibitSingleParam();
			// 没有开放专业时，不显示学生数据
			if (param.gradeMajorDto != null && param.gradeMajorDto.length > 0) {
				param.isSave = false;// 表示获取未保存的禁止学生
				ajaxData.setContentType("application/json;charset=utf-8");
				ajaxData.request(URL_CHOICECOURSE.CHOICESTUDENT_GETSTUDENTLISST, JSON.stringify(param), function(data) {
					$("#tbodycontent").html("");
					$("#tbodycontent").removeClass("no-data-html");
					if (data != null && data.data.length > 0) {
						$("#tbodycontent").html($("#tamplContent").tmpl(data.data));
					} else {
						$("#tbodycontent").append("<tr><td colspan='8'></td></tr>").addClass("no-data-html");
					}
				}, true);
			}
		},

		/**
		 * 设置禁选学生-已经存在禁选学生列表
		 * 
		 * @param param
		 *            查询条件
		 * 
		 */
		getExistStudentList : function(param) {
			param.isSave = true;// 表示获取已经存在的禁止学生
			var rqData = [];
			ajaxData.contructor(false);
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_CHOICECOURSE.CHOICESTUDENT_GETSTUDENTLISST, JSON.stringify(param), function(data) {
				if (data != null && data.data.length > 0) {
					rqData = data.data;
				}
			});
			return rqData;
		},

		/**
		 * 弹框 禁选单个学生
		 * 
		 * @param paramRem
		 *            主列表查询条件 学年学期 轮次Id
		 * 
		 * @param gradeMajorDtoList
		 *            年级专业对象集合
		 * 
		 */
		popProhibitChoose : function(paramRem, gradeMajorDtoList) {
			popup.data("paramRem", paramRem);
			popup.data("gradeMajorDtoList", gradeMajorDtoList);

			popup.open('./choicecourse/parameter/choicestudent/html/prohibitChoose.html', // 这里是页面的路径地址
			{
				id : 'ProhibitChoose',
				title : '禁选单个学生',
				width : 800,
				height : 380,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					// 确定逻辑
					var v = iframeObj.$("#addForm").valid(); // 验证表单
					// 表单验证通过
					if (v) {
						return choicestudent.saveSingleStudent(iframeObj, gradeMajorDtoList);// 保存学生
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
		 * 组合年级专业对象
		 * 
		 * @param gradeMajorIdStr：grade_majorId_choiceMajorId
		 *            年级、专业、选择专业Id字符串
		 * @returns 年级专业对象
		 */
		getGradeMajorDto : function(gradeMajorIdStr) {
			// 该轮次下该专业的年级、专业、选择专业Id
			var gradeMajorDto = {};// 定义对象
			if (gradeMajorIdStr != null && gradeMajorIdStr.length > 0) {
				var s = gradeMajorIdStr.split("_");
				if (s.length > 0) {
					gradeMajorDto.grade = s[0];
					gradeMajorDto.majorId = s[1];
					gradeMajorDto.choiceMajorId = s[2];
				}
			}
			return gradeMajorDto;
		},

		/**
		 * 保存禁选学生-单个
		 * 
		 * @param iframeObj
		 *            当前窗体对象
		 * @param gradeMajorDtoList
		 *            年级、专业、选择专业Id对象 集合
		 * @returns {Boolean}
		 */
		saveSingleStudent : function(iframeObj, gradeMajorDtoList) {
			// 获取勾选学生
			var bannedStudent = [];// 禁止学生集合
			iframeObj.$("#tbodycontent input[type='radio']:checked").each(function() {
				var str = $(this).val(); // userId_grade_majorId
				if (str.length > 0) {
					var strArr = str.split("_");
					var userId = strArr[0];
					var grade = strArr[1];
					var majorId = strArr[2];
					var choiceMajorId = "";
					$.each(gradeMajorDtoList, function(index, obj) {
						if (grade == obj.grade && majorId == obj.majorId) {
							choiceMajorId = obj.choiceMajorId;
							return false;
						}
					});
					// 添加对象
					bannedStudent.push({
						choiceMajorId : choiceMajorId,
						userId : userId,
						isBatch : false
					});
				}
			});
			if (bannedStudent.length == 0) {
				popup.warPop("请勾选学生");
				return false;
			}
			// 保存数据
			choicestudent.saveBannedStudent(bannedStudent);
		},

		/**
		 * 保存禁选学生-批量
		 * 
		 * @param saveData
		 *            学生数据
		 * @param choiceMajorId
		 *            选择专业Id
		 * 
		 */
		saveBatchStudent : function(saveData, choiceMajorId) {
			// 获取勾选学生
			var bannedStudent = [];// 禁止学生集合
			if (saveData != null) {
				$.each(saveData, function(index, obj) {
					bannedStudent.push({
						choiceMajorId : choiceMajorId,
						userId : obj.userId,
						isBatch : true
					});
				});
			}

			// 当没有数据时，要清空学生
			if (bannedStudent.length == 0) {
				bannedStudent.push({
					choiceMajorId : choiceMajorId,
					isBatch : true
				});
			}
			// 保存数据
			return choicestudent.saveBannedStudent(bannedStudent);
		},

		/**
		 * 保存禁选学生
		 * 
		 * @param bannedStudent
		 *            禁选学生集合
		 */
		saveBannedStudent : function(bannedStudent) {
			var flag = false;
			// post请求提交数据
			ajaxData.contructor(false);
			ajaxData.setContentType("application/json;charset=utf-8");
			ajaxData.request(URL_CHOICECOURSE.CHOICESTUDENT_ADDSTUDENT, JSON.stringify(bannedStudent), function(data) {
				if (data.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("保存成功", function() {
					});
					// 刷新列表
					choicestudent.getChoiceMajorList(URL_CHOICECOURSE.CHOICESTUDENT_GETLIST);
					flag = true;
				} else {
					// 提示失败
					popup.errPop(data.msg);
				}
			},true);
			return flag;
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
					},
					studentName : {
						"required" : true,
						"maxlength" : 50
					}
				},
				messages : {
					semester : {
						"required" : "学年学期不能为空"
					},
					roundId : {
						"required" : "选课轮次不能为空"
					},
					studentName : {
						"required" : "学号/姓名不能为空",
						maxlength : "不超过50个字符"
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
	module.exports = choicestudent;
	window.choicestudent = choicestudent;
});