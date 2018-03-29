/**
 * 楼层信息列表
 */
define(function(require, exports, module) {
	// 引入js
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	var URL_DATA = require("basePath/config/url.data");
	var URL = require("basePath/config/url.udf");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var base = config.base;
	var data = [];// 数据
	/**
	 * 楼层信息列表
	 */
	var building = {
		queryParam : {},
		/**
		 * 页面初始化，绑定事件
		 */
		init : function() {
			$('#floorsQuantity').change(function() {
				//alert(1);
			});
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
			// 加载校区信息
			building.getCampusList();
			// 加载楼房类型
			building.getBuildingTypeList();
			var test = new semester({
				dom : $("#123123"),
				defaultValue : "2017-2"
			}).init();

			// 分页
			building.pagination = new pagination({
				url : URL_DATA.BUILDING,
				param : building.queryParam
			}, function(data) {
				if (data.length > 0) {
					$("#tbodycontent").empty().append($("#buildingTableTmpl").tmpl(data))
							.removeClass("no-data-html");
					$("#pagination").show();
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass(
							"no-data-html");
					$("#pagination").hide();
				}
				//取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();

			// 查询
			$("#query").on("click", function() {
				// 分页查询
				building.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			})
			// 新增
			$("button[name='addBuilding']").bind("click", function() {
				building.popAddBuildingHtml();
			});
			// 修改
			$(document).on("click", "button[name='editBuilding']", function() {
				building.popUpdateBuildingHtml(this);
			});
			// 删除
			$(document).on("click", "button[name='deleteBuilding']", function() {
				building.deleteBuilding(this);
			});
			// 批量删除
			$("button[name='batchDeleteBuilding']").bind("click", function() {
				building.batchDeleteBuilding();
			});
			// 修改状态
			$(document).on("click", "button[name='setStatusBuilding']", function() {
				var buildingId = $(this).attr("data-tt-id");
				var isEnabled = $(this).attr("isEnabled") == 1 ? 2 : 1;
				var param = {
					buildingId : buildingId,
					isEnabled : isEnabled
				};
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.BUILDING_SET_STATUS, param, function(data) {
					rvData = data;
					if (rvData == null) {
						return false;
					}
					if (rvData.code == config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("修改成功", function() {
						});
						// 刷新列表
						building.pagination.loadData();
					} else {
						// 提示失败
						popup.errPop(rvData.msg);
						return false;
					}

				});
			});
		},
		validate : function() {
			$("#addWorkForm").validate({
				rules : {
					buildingNo : {
						required : true,
						maxlength : 10
					},
					buildingName : {
						required : true,
						maxlength : 20
					},
					campus : {
						required : true
					},
					buildingType : {
						required : true
					}
				},
				messages : {
					buildingNo : {
						required : '楼房号不能为空',
						maxlength : '楼房号不超过10个字符'
					},
					buildingName : {
						required : '楼房名称不能为空',
						maxlength : '楼房名称不超过20个字符'
					},
					campus : {
						required : '所在校区不能为空'
					},
					buildingType : {
						required : '楼房类型不能为空'
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
		},
		/**
		 * 页面初始化，绑定事件，新增初始化
		 */
		initAdd : function() {
			// 加载校区信息
			building.getCampusList();
			// 加载楼房类型
			building.getBuildingTypeList();
			// 验证
			building.validate();
		},
		/**
		 * 页面初始化，绑定事件，更新初始化
		 */
		initUpdate : function() {
			// 加载校区信息
			building.getCampusList();
			// 加载楼房类型
			building.getBuildingTypeList();
			// 验证
			building.validate();
			// 获取url参数
			var buildingId = building.getUrlParam('buildingId');
			var rvData = null;// 定义返回对象
			var buildModel = null;// 定义前端实体对象
			// post请求提交数据
			var param = {
				"buildingId" : buildingId
			};// 新增一条数据
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.BUILDING_GET, param, function(data) {
				rvData = data;
				buildModel = data.data;
			});
			if (buildModel != null) {
				$("#buildingId").val(buildingId);
				$("#buildingNo").val(buildModel.buildingNo);
				$("#buildingName").val(buildModel.buildingName);
				$("#campusSelect").val(buildModel.campusId);
				$("#buildingTypeSelect").val(buildModel.buildingType);
				$("#floorsQuantity").val(buildModel.floorsQuantity);
				$("input[name='isEnabled'][value=" + buildModel.isEnabled + "]").attr("checked",
						true);
				$("input[name='isEnabled'][value=" + buildModel.isEnabled + "]").parent().parent()
						.addClass("on-radio");
			}
		},
		// 获取url参数
		getUrlParam : function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null)
				return unescape(r[2]);
			return null;
		},
		/**
		 * 查询所有的楼层信息列表
		 */
		getList : function() {
			ajaxData.request(URL_DATA.BUILDING, null, function(data) {
				// $("#treetableTmpl").tmpl(data.data).appendTo('#tbody');
				$("#tbody").append($("#treetableTmpl").tmpl(data.data));
			});
		},
		/**
		 * 查询所有校区信息
		 */
		getCampusList : function() {
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.CAMPUS_GETALL, null, function(data) {
				/*
				 * $("#campusSelectTmpl").tmpl(data.data)
				 * .appendTo('#campusSelect');
				 */
				$("#campusSelect").append($("#campusSelectTmpl").tmpl(data.data));
			});

		},

		/**
		 * 楼房类型下拉框数据初始化
		 */
		getBuildingTypeList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
			reqData["parentCode"] = "LFLX";
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE, reqData, function(data) {
				/*
				 * $("#buildingTypeSelectTmpl").tmpl(data.data).appendTo(
				 * '#buildingTypeSelect');
				 */
				$("#buildingTypeSelect").append($("#buildingTypeSelectTmpl").tmpl(data.data));
			});
		},
		addParam : function(iframe) {
			// 表单验证通过
			var buildingId = $.trim(iframe.$("#buildingId").val());
			var buildingName = $.trim(iframe.$("#buildingName").val());
			var buildingNo = $.trim(iframe.$("#buildingNo").val());
			var campusId = $.trim(iframe.$("#campusSelect").val());
			var buildingType = $.trim(iframe.$("#buildingTypeSelect").val());
			var floorsQuantity = $.trim(iframe.$("#floorsQuantity").val());
			var isEnabled = $.trim(iframe.$("[name=isEnabled]:checked").val());
			var param = {
				"buildingId" : buildingId,
				"buildingName" : buildingName,
				"buildingNo" : buildingNo,
				"campusId" : campusId,
				"buildingType" : buildingType,
				"floorsQuantity" : floorsQuantity,
				"isEnabled" : isEnabled,

			};// 新增一条数据
			return param;
		},
		/**
		 * 弹窗新增
		 */
		popAddBuildingHtml : function() {
			popup.open('./udf/building/html/add.html', // 这里是页面的路径地址
			{
				id : 'addBuilding',// 唯一标识
				title : '楼房信息新增',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 220,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单

					var floor = iframe.$('.spinner input').val();
					if ((/^(\+|-)?\d+$/.test(floor)) && floor > 0) {
					} else {
						popup.errPop("楼层数只能输入两位正整数");
						return false;
					}
					if (v) {
						var param = building.addParam(iframe);
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						ajaxData.request(URL_DATA.BUILDING_ADD, param, function(data) {
							rvData = data;
						});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("新增成功", function() {
							});
							// 刷新列表
							building.pagination.loadData();
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
								return false;
							},
							focus : true
						},
						{
							name : '保存并新增',
							focus : true,// 按钮高亮
							callback : function() {
								// 确定逻辑
								var iframe = this.iframe.contentWindow;// 弹窗窗体
								var v = iframe.$("#addWorkForm").valid();// 验证表单
								if (v) {
									var param = building.addParam(iframe);
									var rvData = null;// 定义返回对象
									// post请求提交数据
									ajaxData.contructor(false);// 同步
									ajaxData.request(URL_DATA.BUILDING_ADD, param, function(data) {
										rvData = data;
									});
									if (rvData == null)
										return false;
									if (rvData.code == config.RSP_SUCCESS) {
										// 提示成功
										popup.okPop("新增成功", function() {

											iframe.$("input:radio[name='isEnabled']:checked")
													.parent().parent().removeClass("on-radio");
											iframe.$("input:radio[name='isEnabled'][value='1']")
													.prop("checked", "checked");
											iframe.$("input:radio[name='isEnabled'][value='1']")
													.parent().parent().addClass("on-radio");
											iframe.$('#addWorkForm')[0].reset();

										});
										// 刷新列表
										building.pagination.loadData();
									} else if (rvData.code == config.RSP_FAIL) {
										// 提示失败信息
										popup.errPop(rvData.msg);
										return false;
									} else {
										// 提示失败
										popup.errPop(rvData.msg);
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
		 * 弹窗修改
		 */
		popUpdateBuildingHtml : function(obj) {
			var buildingId = $(obj).attr("data-tt-id");
			popup.open('./udf/building/html/edit.html?buildingId=' + buildingId, // 这里是页面的路径地址
			{
				id : 'updateBuilding',// 唯一标识
				title : '楼房信息修改',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 210,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						var param = building.addParam(iframe);
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						ajaxData.request(URL_DATA.BUILDING_UPDATE, param, function(data) {
							rvData = data;
						});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("修改成功", function() {
							});
							// 刷新列表
							building.pagination.loadData();
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
				}
			});
		},
		/**
		 * 单个删除
		 */
		deleteBuilding : function(obj) {
			var buildingId = $(obj).attr("data-tt-id");
			var arrayBuildingId = [];
			arrayBuildingId.push(buildingId);
			var param = {
				ids : arrayBuildingId
			};
			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.BUILDING_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {

					});
					// 刷新列表
					building.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}

			});

		},
		/**
		 * 批量删除
		 */
		batchDeleteBuilding : function() {
			// 批量
			var buildingIds = "";// 楼房Id
			var arrayBuildingId = [];
			$("input[name='checNormal']:checked").each(function() {
				arrayBuildingId.push($(this).attr("buildingId"));
			})
			if (arrayBuildingId.length == 0) {
				popup.warPop("请勾选要删除的楼房");
				return false;
			}
			// 参数
			var param = {
				ids : arrayBuildingId
			};
			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.BUILDING_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {

					});
					// 刷新列表
					building.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}

			});
		}
	}
	module.exports = building;
	window.building = building;
});
