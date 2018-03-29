/**
 * 考试时间设置
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var pagination = require("basePath/utils/pagination");

	// 下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");

	var URL = require("basePath/config/url.udf");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dataDictionary = require("basePath/config/data.dictionary");
	var base = config.base;

	// 路径
	var addUrl = base + "/examplan/parameter/times/html/add.html"; // "../html/add.html";//
	// 框架下
	// ./当前目录
	// /根目录
	var updateUrl = base + "/examplan/parameter/times/html/edit.html"; // "../html/edit.html";//

	// 查询条件中获取批次ID
	var batchIdSel = "";
	/**
	 * 管理校区信息
	 */
	var times = {		
		// 初始化
		init : function() {
			// 加载页面查询条件

			// 模糊查询
			// var test = new semester({
			// dom:$("#123123"),
			// defaultValue:"2017-2"
			// }).init();

			// 学年学期精确查询
			var semesterSelect = simpleSelect.loadSemester("schoolCalendarId");
			var semesterId = semesterSelect.getValue();

			// 考试批次下拉框
			var batchSelect = simpleSelect.loadBatch("batchId", semesterId);
			batchIdSel = batchSelect.getValue();

			// 选择学期级联考试批次，并更新列表
			$("#schoolCalendarId").on("change keyup", function() {
				semesterId = semesterSelect.getValue();
				var batchSelect = simpleSelect.loadBatch("batchId", semesterId);
				batchIdSel = batchSelect.getValue();
				// 保存查询条件
				times.pagination.setParam({batchId : batchIdSel});
			})

			// 选择批次查询数据列表
			$("#batchId").on("change keyup", function() {
				batchIdSel = batchSelect.getValue();
				// 保存查询条件
				times.pagination.setParam({batchId : batchIdSel});
			})

			// 1.0 获取列表
			times.getPagedList();
			// 2.0 生成场次时间
			$("button[name='add']").bind("click", function() {
				times.popAddHtml(batchIdSel);
			});
			// 3.0 修改
			$(document).on("click", "button[name='update']", function() {
				times.popUpdateHtml(this, batchIdSel);
			});
			// 4.0 清除场次时间
			$(document).on("click", "button[name='delete']", function() {
				times.deleteTimes(batchIdSel);
			});
			// 批量设置禁考时段
			$(document).on("click", "button[name='forbid']", function() {
				times.forbid(URL_EXAMPLAN.TIMES_FORBID, "确认设置为禁考吗？");
			});
			// 取消禁考时段
			$(document).on("click", "button[name='cancle']", function() {
				times.forbid(URL_EXAMPLAN.TIMES_CANCLE, "确认取消禁考吗？");
			});
			// 5.0 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
			// 6.0 tr点击变色
			// utils.trCheckedCss();
			// 7.0 权限脚本
			authority.init();
		},		
		/** ******************* 1.0 获取列表 ******************* */
		/**
		 * 1.1分页列表
		 */
		getPagedList : function() {
			// 分页
			times.pagination = new pagination({
				id : "pagination",
				url : URL_EXAMPLAN.TIMES_GETPAGEDLIST,
				param : {batchId : batchIdSel}
			}, function(data) {
				// 处理分页控件显示与隐藏
				$("#pagination").show();
				if (data && data.length != 0) {
					$("#tbodycontent").removeClass("no-data-html").empty().append(
							$("#bodyContentImpl").tmpl(data));
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='6'></td></tr>").addClass(
							"no-data-html");
					$("#pagination").hide();
				}
			}).init();
		},
		/**
		 * 1.3回调函数
		 * 
		 * @param pageIndex
		 *            页码
		 */
		infoCallBack : function(pageIndex) {
			var pagesize = $("select[name='page_size']").val();
			if (pagesize != '') {
				pagesize = pagesize;
			} else {
				pagesize = 50;
			}
			if (pageIndex > -1) {
				times.infoQuery(pageIndex, pageSize);
			}
		},

		/** ******************* 2.0 新增开始 ******************* */
		/**
		 * 2.1 弹出新增页面
		 */
		popAddHtml : function(batchId) {
			art.dialog.open(addUrl + '?batchId=' + batchId, {
				id : 'addHmtl',
				title : '生成场次时间',
				width : '750px',
				height : '620px',
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow; // 弹窗窗体
					var v = iframe.$("#addWorkForm").valid(); // 验证表单
					// 表单验证通过
					if (v) {
						var reqData = times.addParam(iframe, batchId); // 绑定新增数据
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						ajaxData.request(URL_EXAMPLAN.TIMES_ADD, reqData, function(data) {
							rvData = data;
						});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("新增成功", function() {
							});
							// 刷新列表
							times.pagination.loadData();
						} else if (rvData.code == config.RSP_FAIL) {
							// 提示失败信息
							popup.errPop(rvData.msg);
							return false;
						} else {
							// 提示失败
							popup.errPop("新增失败");
							return false;
						}
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
		 * 2.2 页面初始化，绑定事件，新增初始化
		 */
		initAdd : function() {
			// 场次性质下拉框
			var timesPropertySelectObj = simpleSelect.loadDataDictionary("timesPropertyCode",
					dataDictionary.ID_FOR_TIMES_PROPERTY);

			// 验证
			times.validateFormData();

			// 根据场次性质，显示或隐藏场次数量
			for (var i = 2; i <= 5; i++) {
				$("#examTime" + i).hide();
			}
			$("#timesPropertyCode").on("change keyup", function() {
				var timesPropertySelVal = timesPropertySelectObj.getValue();
				var num = timesPropertySelVal == "" ? 1 : parseInt(timesPropertySelVal);
				for (var i = 1; i <= num; i++) {
					$("#examTime" + i).show();
				}
				for (var i = num + 1; i <= 5; i++) {
					$("#examTime" + i).hide();
				}
			});

			// 初始化学期批次数据
			times.showBatchData();
		},

		/**
		 * 2.3 新增保存时，组装表单参数
		 * 
		 * @param iframe
		 *            弹框窗口
		 */
		addParam : function(iframe, batchId) {
			var batchId = batchId;
			var timesId = $.trim(iframe.$("#timesId").val());
			var examStartDate = $.trim(iframe.$("#examStartDate").val());
			var examEndDate = $.trim(iframe.$("#examEndDate").val());
			var timesPropertyCode = $.trim(iframe.$("#timesPropertyCode").val());
			var examStartTime = "";
			var examEndTime = "";
			var est = iframe.$(".estValue");
			var eet = iframe.$(".eetValue");
			for (var i = 0; i < est.length; i++) {
				var displayDiv = iframe.$("#examTime" + (i + 1)).css("display");
				if (displayDiv != "none") {
					examStartTime += $.trim(est.eq(i).val()) + ",";
					examEndTime += $.trim(eet.eq(i).val()) + ",";
				}
			}
			// 截取最后一个字符
			if (examStartTime != "") {
				examStartTime = examStartTime.substr(0, examStartTime.length - 1)
			}
			if (examEndTime != "") {
				examEndTime = examEndTime.substr(0, examEndTime.length - 1)
			}

			var timesWeek = $.trim(iframe.$("#timesWeek").val());
			timesWeek = timesWeek.split("周")[0] + "周";

			var reqData = {
				"batchId" : batchId,
				"timesId" : timesId,
				"examStartDate" : examStartDate,
				"examEndDate" : examEndDate,
				"timesPropertyCode" : timesPropertyCode,
				"examStartTime" : examStartTime,
				"examEndTime" : examEndTime,
				"timesWeek" : timesWeek
			};
			return reqData;
		},
		/** ******************* 3.0 修改开始 ******************* */
		/**
		 * 3.1 弹出修改页面
		 */
		popUpdateHtml : function(obj, batchId) {
			var timesId = $(obj).attr("data-tt-id");
			art.dialog.open(updateUrl + '?timesId=' + timesId + '&batchId=' + batchId, // 这里是页面的路径地址
			{
				id : 'updateHtml',// 唯一标识
				title : '修改场次时间',// 这是标题
				width : '750px',// 这是弹窗宽度。其实可以不写
				height : '420px',// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						// 表单验证通过
						var reqData = times.updateParam(iframe, batchId); // 绑定修改数据
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);
						ajaxData.request(URL_EXAMPLAN.TIMES_UPDATE, reqData, function(data) {
							rvData = data;
						});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("修改成功", function() {
							});
							// 刷新列表
							times.pagination.loadData();
						} else if (rvData.code == config.RSP_FAIL) {
							// 提示失败信息
							popup.errPop(rvData.msg);
							return false;
						} else {
							// 提示失败
							popup.errPop("修改失败");
							return false;
						}
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
		 * 3.2 修改页面初始化，绑定事件，更新初始化
		 */
		initUpdate : function() {
			// 验证
			times.validateFormData();
			// 初始化学期批次数据
			times.showBatchData();
			// 显示数据
			times.showTimesData();
		},

		/**
		 * 3.3 修改保存时，组装表单参数
		 * 
		 * @param iframe
		 *            弹框窗口
		 */
		updateParam : function(iframe, batchId) {
			var batchId = batchId;
			var timesId = $.trim(iframe.$("#timesId").val());
			var examStartTime = $.trim(iframe.$("#examStartTime").val());
			var examEndTime = $.trim(iframe.$("#examEndTime").val());
			var reqData = {
				"batchId" : batchId,
				"timesId" : timesId,
				"examStartTime" : examStartTime,
				"examEndTime" : examEndTime
			};
			return reqData;
		},
		/**
		 * 3.4.1 显示修改页面数据
		 */
		showBatchData : function() {
			// 获取url参数
			var batchId = utils.getUrlParam('batchId');

			var rvData = null;// 定义返回对象
			// post请求提交数据
			var param = {
				"batchId" : batchId
			};// 新增一条数据
			ajaxData.contructor(false);
			ajaxData.request(URL_EXAMPLAN.BATCH_GETITEM, param, function(data) {
				rvData = data;
			});
			if (rvData == null)
				return false;
			if (rvData.code == config.RSP_SUCCESS) {
				var item = rvData.data;
				$("#semester").text(item.semester);
				$("#batchName").text(item.combineName);
				$("#examStartDateStr").text(item.startDate + "(" + item.startTime + ")");
				$("#examEndDateStr").text(item.endDate + "(" + item.endTime + ")");
				$("#examStartDate").val(item.startDate);
				$("#examEndDate").val(item.endDate);
				$("#timesWeek").val(item.startTime)
			}
		},
		/**
		 * 3.4.2 显示修改页面数据
		 */
		showTimesData : function() {
			// 获取url参数
			var timesId = utils.getUrlParam('timesId');
			var rvData = null;// 定义返回对象
			// post请求提交数据
			var param = {
				"timesId" : timesId
			};// 新增一条数据
			ajaxData.contructor(false);
			ajaxData.request(URL_EXAMPLAN.TIMES_GETITEM, param, function(data) {
				rvData = data;
			});
			if (rvData == null)
				return false;
			if (rvData.code == config.RSP_SUCCESS) {
				var item = rvData.data;
				$("#timesId").val(item.timesId);
				$("#examDate").text(item.examDateName);
				$("#timesPropertyCode").text(item.timesProperty);
				$("#examStartTime").val(item.examStartTime);
				$("#examEndTime").val(item.examEndTime);
			}
		},
		/** ******************* 4.0 删除开始 ******************* */
		/**
		 * 4.1 删除
		 */
		deleteTimes : function(batchId) {
			// 参数
			var param = {
				"batchId" : batchId
			};

			popup.askPop("确认清除当前考试批次的所有场次吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_EXAMPLAN.TIMES_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("清除成功", function() {
					});
					// 刷新列表
					times.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop("清除失败");
				}
			});
		},
		/**
		 * 4.2 批量设置禁考时段
		 */
		forbid : function(urlStr, askStr) {
			// 批量
			var timesIdArr = [];// 场次时间Id
			$("tbody input[type='checkbox']:checked").each(function() {
				var timesId = $(this).parent().find("input[name='checNormal']").val();
				timesIdArr.push(timesId);
			});
			if (timesIdArr.length == 0) {
				popup.warPop("请勾选场次时间");
				return false;
			}
			// 参数
			var param = {
				"timesIdArr" : timesIdArr
			};
			popup.askPop(askStr, function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(urlStr, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("设置成功", function() {
					});
					// 刷新列表
					times.pagination.loadData();
				} else if (rvData.code == config.RSP_FAIL) {
					// 提示失败信息
					popup.errPop(rvData.msg);
					return false;
				} else {
					// 提示失败
					popup.errPop("设置失败");
					return false;
				}				
			});
		},

		/** ******************* 5.0 其他公用方法 ** */
		/**
		 * 5.1 验证表单
		 */
		validateFormData : function() {
			ve.validateEx();
			// 验证
			$("#addWorkForm").validate({
				rules : {
					timesPropertyCode : {
						"required" : true
					},
					examStartTime1 : {
						"required" : true,
						"isHourMinute" : true
					},
					examStartTime2 : {
						"required" : true,
						"isHourMinute" : true
					},
					examStartTime3 : {
						"required" : true,
						"isHourMinute" : true
					},
					examStartTime4 : {
						"required" : true,
						"isHourMinute" : true
					},
					examStartTime5 : {
						"required" : true,
						"isHourMinute" : true
					},
					examEndTime1 : {
						"required" : true,
						"isHourMinute" : true
					},
					examEndTime2 : {
						"required" : true,
						"isHourMinute" : true
					},
					examEndTime3 : {
						"required" : true,
						"isHourMinute" : true
					},
					examEndTime4 : {
						"required" : true,
						"isHourMinute" : true
					},
					examEndTime5 : {
						"required" : true,
						"isHourMinute" : true
					}
				},
				messages : {
					timesPropertyCode : {
						"required" : "场次性质不能为空"
					},
					examStartTime1 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					},
					examStartTime2 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					},
					examStartTime3 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					},
					examStartTime4 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					},
					examStartTime5 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					},
					examEndTime1 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					},
					examEndTime2 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					},
					examEndTime3 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					},
					examEndTime4 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					},
					examEndTime5 : {
						"required" : "时间不能为空",
						"isHourMinute" : "请填写正确的时分"
					}
				},
				// 定义公用的错误提示内容，暂时保留
				errorPlacement : function(error, element) {
					var parent = $(element).parent("div.tips-text").append(error);
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
	module.exports = times;
	window.times = times;
});