/**
 * 设置选课轮次js
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
	var choiceround = {
		/**
		 * 列表查询条件
		 * 
		 * @returns 参数对象
		 */
		queryObject : function() {
			var semester = $("#semester").val();
			var param = {};
			return choiceround.getSemesterSplit(param, semester);
		},

		/**
		 * 主页面列表初始化
		 */
		init : function() {
			// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");
			// 加载列表数据
			choiceround.getList();
			// 查询按钮
			$("#query").on("click", function() {
				choiceround.getList();
			});
			// 新增弹框
			$(document).on("click", "button[name = 'addRound']", function() {
				choiceround.popAddHtml();
			});
			// 修改弹框
			$(document).on("click", "button[name = 'updateRound']", function() {
				choiceround.popUpdateHtml(this);
			});
			// 删除
			$(document).on("click", "button[name='deleteRound']", function() {
				choiceround.deleteRound(this);
			});
		},

		/**
		 * 查询轮次列表信息
		 */
		getList : function() {
			var reqData = choiceround.queryObject();
			ajaxData.request(URL_CHOICECOURSE.ROUND_GETLIST, reqData, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				if (data != null && data.data.length > 0) {
					$("#tbodycontent").html($("#tamplContent").tmpl(data.data, helper));
				} else {
					$("#tbodycontent").append("<tr><td colspan='11'></td></tr>").addClass("no-data-html");
				}
			},true);
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
		 * 新增初始化
		 */
		initAdd : function() {
			// 加载当前学年学期
			simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, "", "", "");
			// 验证
			choiceround.validateFormData();
			// 验证特殊字符
			$("#roundName").on("change keyup", function() {
				$("#roundName").val(utils.replaceSpecialStr($("#roundName").val()));
			});
		},

		/**
		 * 弹出新增页面
		 */
		popAddHtml : function() {
			popup.open('./choicecourse/parameter/choiceround/html/add.html', // 这里是页面的路径地址
			{
				id : 'popAddHtml',
				title : '新增',
				width : 950,
				height : 380,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					// 确定逻辑
					var v = iframeObj.$("#addForm").valid(); // 验证表单
					// 表单验证通过
					if (v) {
						return choiceround.save(iframeObj, URL_CHOICECOURSE.ROUND_ADD); // 绑定新增数据
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
		 * 获取界面表单内容
		 * 
		 * @param iframeObj
		 *            当前窗体对象
		 * @returns 参数对象
		 */
		getParam : function(iframeObj) {
			var param = {};
			param = utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));// 获取要保存的参数
			return choiceround.getSemesterSplit(param, param.semester);
		},

		/**
		 * 保存数据
		 * 
		 * @param iframeObj
		 *            当前窗体对象
		 * @param url
		 *            控制器url
		 */
		save : function(iframeObj, url) {
			var saveParams = choiceround.getParam(iframeObj);
			var flag = false;
			// post请求提交数据
			ajaxData.contructor(false);
			ajaxData.request(url, saveParams, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("保存成功", function() {
					});
					// 刷新列表
					choiceround.getList();
					flag = true;
				} else {
					// 提示失败信息
					popup.errPop(data.msg);
				}
			});
			return flag;
		},

		/**
		 * 弹出修改页面
		 * 
		 * @param obj
		 *            当前页面对象
		 */
		popUpdateHtml : function(obj) {
			var roundId = $(obj).attr("data-tt-id");
			popup.data("roundId", roundId);
			popup.open('./choicecourse/parameter/choiceround/html/edit.html', // 这里是页面的路径地址
			{
				id : 'popUpdateHtml',// 唯一标识
				title : '修改',// 这是标题
				width : '950px',// 这是弹窗宽度。其实可以不写
				height : '380px',// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function(iframeObj) {
					// 确定逻辑
					var v = iframeObj.$("#addForm").valid(); // 验证表单
					// 表单验证通过
					if (v) {
						return choiceround.save(iframeObj, URL_CHOICECOURSE.ROUND_UPDATE); // 绑定新增数据
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
		 * 修改初始化
		 */
		initUpdate : function() {
			// 验证
			choiceround.validateFormData();

			// 验证特殊字符
			$("#roundName").on("change keyup", function() {
				$("#roundName").val(utils.replaceSpecialStr($("#roundName").val()));
			});

			// 获取url参数
			var roundId = popup.data("roundId");
			var param = {
				"roundId" : roundId
			};

			// 获取一条数据
			ajaxData.request(URL_CHOICECOURSE.ROUND_GETITEM, param, function(data) {
				if (data != null && data.code == config.RSP_SUCCESS) {
					utils.setForm($("#addForm"), data.data); // 表单自动绑定
					$("#startTime").val(new Date(data.data.startTime).format("yyyy-MM-dd hh:mm"));
					$("#endTime").val(new Date(data.data.endTime).format("yyyy-MM-dd hh:mm"));
					// 加载当前学年学期
					simpleSelect.loadCommonSmester("semester", URL_DATA.COMMON_GETSEMESTERLIST, data.data.academicYear
							+ "_" + data.data.semesterCode, "", "");
				}
			},true);

		},

		/**
		 * 删除选课轮次
		 * 
		 * @param obj
		 *            当前页面对象
		 */
		deleteRound : function(obj) {
			// 参数
			var param = {
				"roundId" : $(obj).attr("data-tt-id")
			};
			popup.askPop("确认删除吗？", function() {
				ajaxData.request(URL_CHOICECOURSE.ROUND_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("删除成功", function() {
						});
						// 刷新列表
						choiceround.getList();
					} else {
						// 业务提醒
						popup.errPop(data.msg);
					}
				},true);
			});
		},

		/**
		 * 验证表单
		 */
		validateFormData : function() {
			ve.validateEx();
			// 验证
			$("#addForm").validate({
				rules : {
					semester : {
						"required" : true
					},
					roundName : {
						"required" : true,
						maxlength : 20
					},
					startTime : {
						"required" : true,
						"isDateTimeFormat" : true
					},
					endTime : {
						"required" : true,
						"isDateTimeFormat" : true
					},
					remark : {
						maxlength : 200
					}
				},
				messages : {
					semester : {
						"required" : "学年学期不能为空"
					},
					roundName : {
						"required" : "选课轮次不能为空",
						maxlength : "不超过20个字符"
					},
					startTime : {
						"required" : "选课开始时间不能为空",
						"isDateTimeFormat" : "请填写正确的时间格式"
					},
					endTime : {
						"required" : "选课结束时间不能为空",
						"isDateTimeFormat" : "请填写正确的时间格式"
					},
					remark : {
						maxlength : "不超过200个字符"
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			});

			// 重名验证
			jQuery.validator.addMethod("nameRepeatVerify", function(value, element) {
				return false;
			}, "名称不能重复");

			// 选课轮次改变时，校验本学期下轮次名称不能重复
			$(document).on("change", "#roundName", function() {
				choiceround.checkValue();
			});
			// 学年学期改变时，选课轮次改变，校验本学期下轮次名称不能重复
			$(document).on("change", "#semester", function() {
				choiceround.checkValue();
			});
		},

		/**
		 * 本学期下轮次名称不能重复
		 */
		checkValue : function() {
			var roundId = $.trim($("#roundId").val());
			var semester = $.trim($("#semester").val());
			var roundName = $.trim($("#roundName").val());

			if (utils.isNotEmpty(roundName)) {
				var param = {
					roundId : roundId,
					roundName : roundName
				};
				param = choiceround.getSemesterSplit(param, semester);

				ajaxData.contructor(false);
				ajaxData.request(URL_CHOICECOURSE.ROUND_VALIDATION, param, function(data) {
					// 返回内容
					if (data.code == config.RSP_SUCCESS) {
						if (utils.isNotEmpty(data.data.roundName) && data.data.remark == 'roundName') {
							$("#roundName").rules("add", {
								"nameRepeatVerify" : true,
								messages : {
									"nameRepeatVerify" : data.data.roundName
								}
							});
						} else {
							$("#roundName").rules("remove", "nameRepeatVerify");
						}
					}
				});
			}
		}
	/** ********************* end ******************************* */
	}
	module.exports = choiceround;
	window.choiceround = choiceround;
});