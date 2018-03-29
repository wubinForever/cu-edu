/**
 * 校区信息
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils");
	var ajaxData = require("basePath/ajaxData");
	var config = require("basePath/config");
	var URL = require("configPath/url.data");
	var page = require("basePath/page");
	var popup = require("basePath/popup");
	var authority = require("basePath/authority");
	var ve = require("basePath/validateExtend");
	var common = require("basePath/common");
	var base = config.base;

	// 路径
	var addUrl = "./udf/campus/html/add.html"; // "../html/add.html";//
														// 框架下
	// ./当前目录
	// /根目录
	var updateUrl = "./udf/campus/html/edit.html"; // "../html/edit.html";//
	/**
	 * 管理校区信息
	 */
	var campus = {
		// 初始化
		init : function() {
			// 1.0 获取列表
			campus.infoQuery();
			// 2.0 新增
			$("button[name='add']").bind("click", function() {
				campus.popAddHtml();
			});
			// 3.0 修改
			$(document).on("click", "button[name='update']", function() {
				campus.popUpdateHtml(this);
			});
			// 4.0 删除
			$(document).on("click", "button[name='delete']", function() {
				campus.deleteCampus(this);
			});
			// 批量删除
			$(document).on("click", "button[name='batchDelete']", function() {
				campus.batchDelete(this);
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
		 * 1.1查询函数
		 */
		infoQuery : function() {
			ajaxData.contructor(false);
			// 实现ajax请求数据
			ajaxData.request(URL.CAMPUS_GETALL, null, function(data) {

				if (data.code == config.RSP_SUCCESS & data.data.length > 0) {
					// 列表模板加载
					$("#tbodycontent").empty().append(
							$("#bodyContentImpl").tmpl(data.data)).removeClass(
							"no-data-html");
				} else {
					$("#tbodycontent").empty().append(
							"<tr><td colspan='9'></td></tr>").addClass(
							"no-data-html");
				}
			});
		},

		/** ******************* 2.0 新增开始 ******************* */
		/**
		 * 2.1 弹出新增页面
		 */
		popAddHtml : function() {
			popup.open(addUrl, {
				id : 'addHmtl',
				title : '校区信息新增',
				width : 820,
				height : 300,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow; // 弹窗窗体
					var v = iframe.$("#addWorkForm").valid(); // 验证表单
					// 表单验证通过
					if (v) {
						var reqData = campus.addParam(iframe); // 绑定新增数据
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						ajaxData.request(URL.CAMPUS_ADD, reqData,
								function(data) {
									rvData = data;
								});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("新增成功", function() {});
							// 刷新列表
							campus.infoQuery();
							//重置复选框
							$("#check-all").removeAttr("checked").parent().removeClass("on-check");
						} else {
							// 提示失败
							popup.errPop(rvData.msg);
							return false;
						}
					} else {
						// 表单验证不通过
						return false;
					}
				},
				cancel : function() {
					// 取消逻辑
				},
				button : [
						{
							name : '保存',
							focus : true,// 按钮高亮
							callback : function() {
								this.content('你确定了').time(2);
								return false;
							},
							focus : true
						},
						{
							name : '保存并新增',
							focus : true,// 按钮高亮
							callback : function() {
								// 确定逻辑
								var iframe = this.iframe.contentWindow; // 弹窗窗体
								var v = iframe.$("#addWorkForm").valid(); // 验证表单
								// 表单验证通过
								if (v) {
									var reqData = campus.addParam(iframe); // 绑定新增数据
									var rvData = null;// 定义返回对象
									// post请求提交数据
									ajaxData.contructor(false);// 同步
									ajaxData.request(URL.CAMPUS_ADD, reqData,
											function(data) {
												rvData = data;
											});
									if (rvData == null)
										return false;
									if (rvData.code == config.RSP_SUCCESS) {
										// 提示成功
										popup.okPop("新增成功", function() {});
										// 刷新列表
										campus.infoQuery();
										//重置复选框
										$("#check-all").removeAttr("checked").parent().removeClass("on-check");
										// 清空数据
										iframe.$('#addWorkForm')[0].reset();
										new iframe.limit(iframe.$("#address"), iframe.$("#addressCount"), 100);
									} else {
										// 提示失败
										popup.errPop(rvData.msg);
										return false;
									}
								} else {
									// 表单验证不通过
									return false;
								}
								return false;
							}
						} ]
			});
		},

		/**
		 * 2.2 页面初始化，绑定事件，新增初始化
		 */
		initAdd : function() {
			// 验证
			campus.validateFormData();
		},

		/**
		 * 2.3 新增保存时，组装表单参数
		 * 
		 * @param iframe
		 *            弹框窗口
		 */
		addParam : function(iframe) {
			var campusId = $.trim(iframe.$("#campusId").val());
			var campusName = $.trim(iframe.$("#campusName").val());
			var campusNo = $.trim(iframe.$("#campusNo").val());
			var superintendent = $.trim(iframe.$("#superintendent").val());
			var telephone = $.trim(iframe.$("#telephone").val());
			var fax = $.trim(iframe.$("#fax").val());
			var postalCode = $.trim(iframe.$("#postalCode").val());
			var address = $.trim(iframe.$("#address").val());
			var reqData = {
				"campusId" : campusId,
				"campusName" : campusName,
				"campusNo" : campusNo,
				"superintendent" : superintendent,
				"telephone" : telephone,
				"fax" : fax,
				"postalCode" : postalCode,
				"address" : address
			};
			return reqData;
		},
		/** ******************* 3.0 修改开始 ******************* */
		/**
		 * 3.1 弹出修改页面
		 */
		popUpdateHtml : function(obj) {
			var campusId = $(obj).attr("data-tt-id");
			popup.open(updateUrl + '?campusId=' + campusId, // 这里是页面的路径地址
			{
				id : 'updateHtml',// 唯一标识
				title : '校区信息修改',// 这是标题
				width : 820,// 这是弹窗宽度。其实可以不写
				height : 300,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						// 表单验证通过
						var reqData = campus.addParam(iframe); // 绑定修改数据
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);
						ajaxData.request(URL.CAMPUS_UPDATE, reqData, function(
								data) {
							rvData = data;
						});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("修改成功", function() {});
							// 刷新列表
							campus.infoQuery();
							//重置复选框
							$("#check-all").removeAttr("checked").parent().removeClass("on-check");
						} else {
							// 提示失败
							popup.errPop(rvData.msg);
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
			campus.validateFormData();
			// 显示数据
			campus.showData();
		},

		/**
		 * 3.3 修改保存时，组装表单参数
		 * 
		 * @param iframe
		 *            弹框窗口
		 */
		updateParam : function(iframe) {
			return campus.addParam(iframe);
		},
		/**
		 * 3.4 显示修改页面数据
		 */
		showData : function() {
			// 获取url参数
			var campusId = utils.getUrlParam('campusId');
			var rvData = null;// 定义返回对象
			// post请求提交数据
			var param = {
				"campusId" : campusId
			};// 新增一条数据
			ajaxData.contructor(false);
			ajaxData.request(URL.CAMPUS_GETITEM, param, function(data) {
				rvData = data.data;
			});
			if (rvData != null) {
				$("#campusId").val(rvData.campusId);
				$("#campusNo").val(rvData.campusNo);
				$("#campusName").val(rvData.campusName);
				$("#superintendent").val(rvData.superintendent);
				$("#telephone").val(rvData.telephone);
				$("#fax").val(rvData.fax);
				$("#postalCode").val(rvData.postalCode);
				$("#address").val(rvData.address);
			}
			new limit($("#address"), $("#addressCount"), 100);
		},
		/** ******************* 4.0 删除开始 ******************* */
		/**
		 * 4.1 删除
		 */
		deleteCampus : function(obj) {
			var campusIdArr = [];// 校区Id
			campusIdArr.push($(obj).attr("data-tt-id"));

			// 参数
			var param = {
				"campusIdArr" : campusIdArr
			};

			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL.CAMPUS_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {});
					// 刷新列表
					campus.infoQuery();
					//重置复选框
					$("#check-all").removeAttr("checked").parent().removeClass("on-check");
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
				// 刷新列表
				var win = art.dialog.open.origin;
				win.location.reload();
			});
		},
		/**
		 * 4.2 批量删除
		 */
		batchDelete : function() {
			// 批量
			var campusIdArr = [];// 校区Id
			$("tbody input[type='checkbox']:checked").each(
					function() {
						var campusId = $(this).parent().find(
								"input[name='checNormal']").val();
						campusIdArr.push(campusId);
					});
			if (campusIdArr.length == 0) {
				popup.warPop("请勾选校区");
				return false;
			}
			// 参数
			var param = {
				"campusIdArr" : campusIdArr
			};
			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL.CAMPUS_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {});
					// 刷新列表
					campus.infoQuery();
					//重置复选框
					$("#check-all").removeAttr("checked").parent().removeClass("on-check");
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
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
			$("#addWorkForm").validate(
					{
						rules : {
							campusNo : {
								required : true,
								maxlength : 10
							},
							campusName : {
								required : true,
								maxlength : 20
							},
							superintendent : {
								maxlength : 50
							},
							telephone : {
								"isPhone" : true
							},
							fax : {
								"isTel" : true
							},
							postalCode:{
								"isPostalCode":true
							},
							address : {
								maxlength : 100
							}
						},
						messages : {
							campusNo : {
								required : '校区号不能为空',
								maxlength : '校区号不能超过10个字符'
							},
							campusName : {
								required : '校区名称不能为空',
								maxlength : '校区名称不能超过20个字符'
							},
							superintendent : {
								maxlength : '负责人不能超50个字符'
							},
							telephone : {
								"isPhone" : "请填写正确的联系电话"
							},
							fax : {
								"isTel" : "请填写正确的传真号码"
							},
							postalCode:{
								"isPostalCode":"邮政编码格式不正确，如：【121010】"
							},
							address : {
								maxlength : '校区地址不能超过100个字符'
							}
						},
						// 定义公用的错误提示内容，暂时保留
						errorPlacement : function(error, element) {
							var parent = $(element).parent("div.tips-text")
									.append(error);
						},
						onchange : function(ele) {
							$(ele).valid();
						},
						onfocusout : function(ele) {
							$(ele).valid();
						}
					});

			// 重名验证
			jQuery.validator.addMethod("nameRepeatVerify", function(value,
					element) {
				return false;
			}, "名称不能重复");

			// 校区号或校区名称重复验证
			$(document)
					.on(
							"change",
							"#campusNo",
							function() {
								var campusNo = $.trim($(this).val());
								var campusId = $("#campusId").val();
								if (utils.isNotEmpty(campusNo)) {
									var param = {
										campusNo : campusNo,
										campusId : campusId
									};
									ajaxData.contructor(false);
									ajaxData
											.request(
													URL.CAMPUS_VALIDATION,
													param,
													function(data) {
														// 返回内容
														if (utils
																.isNotEmpty(data.data.campusNo)
																&& data.data.campusNo == 'campusNo') {
															$("#campusNo")
																	.rules(
																			"add",
																			{
																				"nameRepeatVerify" : true,
																				messages : {
																					"nameRepeatVerify" : "校区号不能重复"
																				}
																			});
														} else {
															$("#campusNo")
																	.rules(
																			"remove",
																			"nameRepeatVerify");
														}
													});
								}
							});

			// 校区号或校区名称重复验证
			$(document)
					.on(
							"change",
							"#campusName",
							function() {
								var campusName = $.trim($(this).val());
								var campusId = $("#campusId").val();
								if (utils.isNotEmpty(campusName)) {
									var param = {
										campusName : campusName,
										campusId : campusId
									};
									ajaxData.contructor(false);
									ajaxData
											.request(
													URL.CAMPUS_VALIDATION,
													param,
													function(data) {
														// 返回内容
														if (utils
																.isNotEmpty(data.data.campusName)
																&& data.data.campusName == 'campusName') {
															$("#campusName")
																	.rules(
																			"add",
																			{
																				"nameRepeatVerify" : true,
																				messages : {
																					"nameRepeatVerify" : "校区名称不能重复"
																				}
																			});
														} else {
															$("#campusName")
																	.rules(
																			"remove",
																			"nameRepeatVerify");
														}
													});
								}
							});
		}
	/** ********************* end ******************************* */
	}
	module.exports = campus;
	window.campus = campus;
});