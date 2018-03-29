/**
 * 场地信息
 */
define(function(require, exports, module) {
	// 引入js
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL_DATA = require("configPath/url.data");
	var URL = require("configPath/url.udf");
	var common = require("basePath/utils/common");
	var popup = require("basePath/utils/popup");
	var pagination = require("basePath/utils/pagination");
	var importUtils = require("basePath/utils/importUtils"); //文件上传帮助
	var treeSelect = require("basePath/module/select.tree");//公用下拉树
	var base = config.base;
	var data = [];// 数据
	// 树目录控件初始化单选框------------------------------------
	var setting = {
		view : {
			showLine : false,
			nameIsHTML : true
		},
		data : {
			simpleData : {
				enable : true,
				idKey : "id",
				pIdKey : "pId",
				rootPId : "0"
			},
			key : {
				title : "name"
			}
		},
		callback : {
			onDblClick : function(event, treeId, treeNode) {
			},
			onClick : function(event, treeId, treeNode) {
				$("#treeCode").hide();
				$("#departmentName").val(treeNode.name);
				$("#departmentId").val(treeNode.id);
				$("#departmentId").next().remove();

			}
		}
	};
	/**
	 * 教师信息
	 */
	var venue = {
		queryParam : {},
		/**
		 * 页面初始化，绑定事件
		 */
		init : function() {
			venue.loadData();
			venue.validation();
			venue.campusChange("全部");
			// 分页
			venue.pagination = new pagination({
				url : URL_DATA.VENUE_GET_PAGEDLIST,
				param : venue.queryParam
			}, function(data) {
				if (data.length>0) {
					$("#tbodycontent").empty().append(
							$("#venueTableTmpl").tmpl(data)).removeClass("no-data-html");
					$("#pagination").show();
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='11'></td></tr>")
							.addClass("no-data-html");
					$("#pagination").hide();
				}
				//取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();
			// 查询
			$("#query").on(
					"click",
					function() {
						venue.pagination.setParam(utils
								.getQueryParamsByFormId("queryForm"));
					});
			// 新增
			$("button[name='addVenue']").bind("click", function() {
				venue.popAddVenueHtml();
			});
			// 修改
			$(document).on("click", "button[name='editVenue']", function() {
				venue.popUpdateVenueHtml(this);
			});
			// 导入
			$(document).on("click", "button[name='importBtn']", function() {
				new importUtils({
					title : "场地信息导入",
					uploadUrl : URL_DATA.VENUE_IMPORTFILE,
					exportFailUrl : URL_DATA.VENUE_EXPORT_FAILMESSATE,
					templateUrl : URL_DATA.VENUE_EXPORTTEMPLATE,
					data:[{name:"所在楼房",field:"buildingId"},{name:"场地号",field:"venueNo"},{name:"场地名称",field:"venueName"},{name:"导入失败原因",field:"message"}],
					successCallback:function(){
						venue.pagination.loadData();
					}
				}).init();
			});
			//导出
			$(document).on("click", "button[name='exportBtn']", function() {
				ajaxData.exportFile(URL_DATA.VENUE_EXPORT, venue.pagination.option.param);
			});
			// 删除
			$(document).on("click", "button[name='deleteVenue']", function() {
				venue.deleteVenue(this);
			});
			// 批量删除
			$("button[name='batchDeleteVenue']").bind("click", function() {
				venue.batchDeleteVenue();
			});
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
			// 修改状态
			$(document).on(
					"click",
					"button[name='setStatusVenue']",
					function() {
						var venueId = $(this).attr("data-tt-id");
						var isEnabled = $(this).attr("isEnabled") == 1 ? 2 : 1;
						var param = {
							venueId : venueId,
							isEnabled : isEnabled
						};
						var rvData = null;
						ajaxData.contructor(false);
						ajaxData.request(URL_DATA.VENUE_SET_STATUS, param,
								function(data) {
									rvData = data;
									if (rvData == null) {
										return false;
									}
									if (rvData.code == config.RSP_SUCCESS) {
										// 提示成功
										popup.okPop("修改成功", function() {
										});
										// 刷新列表
										venue.pagination.loadData();
									} else {
										// 提示失败
										popup.errPop(rvData.msg);
										return false;
									}
								});
					});
		},

		/**
		 * 查询所有单位信息
		 */
		getDepartmentList : function() {
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.DEPARTMENT_GETALLLIST, null, function(
					data) {
				$("#departmentSelectTmpl").tmpl(data.data).appendTo(
						'#departmentId');
			});
		},
		/**
		 * 查询所有校区信息
		 */
		getCampusList : function() {

			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.CAMPUS_GETALL, null, function(data) {
				$("#campusSelectTmpl").tmpl(data.data).appendTo('#campusId');
			});

		},
		/**
		 * 根据校区查询楼房信息
		 */
		getBuildingList : function(campusId) {
			var param = {
				"campusId" : campusId
			}
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.BUILDING_GET_LIST_BY_CAMPUS_ID, param,
					function(data) {
						$("#buildingSelectTmpl").tmpl(data.data).appendTo(
								'#buildingId');
					});
		},
		/**
		 * 获取场地类型信息
		 */
		getVenueTypeList : function() {
			var reqData = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
			reqData["parentCode"] = "JSLX";
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE, reqData,
					function(data) {
						$("#venueTypeSelectTmpl").tmpl(data.data).appendTo( '#venueTypeCode');
					});
		},
		/**
		 * 角色列表查询分页函数
		 * 
		 * @param pageIndex
		 *            当前页码
		 */
		venueQuery : function(pageIndex) {
			// 最初初始的数据
			var reqData = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
			var pageSize = $("select[name='page_size']")
					.find("option:selected").val();
			if (utils.isEmpty(pageSize)) {
				pageSize = 10;// 初始化数据
			}
			if (utils.isNotEmpty(pageIndex) || pageIndex == '0') {
				$("#pageIndex").val(pageIndex);
			}
			reqData["pageIndex"] = $("#pageIndex").val();
			reqData["pageSize"] = pageSize;
			venue.commonAjax(reqData, URL_DATA.VENUE_GET_PAGEDLIST, pageSize);
		},
		/**
		 * 2.3 新增保存时，组装表单参数
		 * 
		 * @param iframe
		 *            弹框窗口
		 */
		addParam : function(iframe) {
			// 表单验证通过
			var venueId = $.trim(iframe.$("#venueId").val());
			var venueName = $.trim(iframe.$("#venueName").val());
			var venueNo = $.trim(iframe.$("#venueNo").val());
			var departmentId = $.trim(iframe.$("#departmentId").val());
			var campusId = $.trim(iframe.$("#campusId").val());
			var buildingId = $.trim(iframe.$("#buildingId").val());
			var floor = $.trim(iframe.$("#floor").val());
			var venueTypeCode = $.trim(iframe.$("#venueTypeCode").val());
			var seatAmount = $.trim(iframe.$("#seatAmount").val());
			var effectiveSeatAmount = $.trim(iframe.$("#effectiveSeatAmount")
					.val());
			var examsSeatAmount = $.trim(iframe.$("#examsSeatAmount").val());
			var isEnabled = $.trim(iframe.$("[name=isEnabled]:checked").val());

			var param = {
				"venueId" : venueId,
				"venueName" : venueName,
				"venueNo" : venueNo,
				"departmentId" : departmentId,
				"campusId" : campusId,
				"buildingId" : buildingId,
				"floor" : floor,
				"venueTypeCode" : venueTypeCode,
				"seatAmount" : seatAmount,
				"effectiveSeatAmount" : effectiveSeatAmount,
				"examsSeatAmount" : examsSeatAmount,
				"isEnabled" : isEnabled,
			};// 新增一条数据
			return param;
		},
		clearData : function (iframe){
			iframe.$("input:radio[name='isEnabled']:checked").parent().parent().removeClass("on-radio");
			iframe.$("input:radio[name='isEnabled'][value='1']").prop("checked","checked");
			iframe.$("input:radio[name='isEnabled'][value='1']").parent().parent().addClass("on-radio");
			iframe.$('#addWorkForm')[0].reset();
			iframe.$('.curSelectedNode', "#treeCode").removeClass("curSelectedNode");
			iframe.$("#buildingId").empty();
			iframe.$("#buildingId").prepend("<option value=''>--请选择--</option>");
		},
		/**
		 * 弹窗新增
		 */
		popAddVenueHtml : function() {
			art.dialog
					.open(
							base + '/udf/venue/html/add.html', // 这里是页面的路径地址
							{
								id : 'addVenue',// 唯一标识
								title : '场地信息新增',// 这是标题
								width : 760,// 这是弹窗宽度。其实可以不写
								height : 400,// 弹窗高度
								okVal : '保存',
								cancelVal : '关闭',
								ok : function() {
									// 确定逻辑
									var iframe = this.iframe.contentWindow;// 弹窗窗体
									var v = iframe.$("#addWorkForm").valid();// 验证表单
									if (v) {
										var param = venue.addParam(iframe);
										var rvData = null;// 定义返回对象
										// post请求提交数据
										ajaxData.contructor(false);// 同步
										ajaxData.request(URL_DATA.VENUE_ADD,
												param, function(data) {
													rvData = data;
												});
										if (rvData == null) {
											return false;
										}
										if (rvData.code == config.RSP_SUCCESS) {
											// 提示成功
											popup.okPop("新增成功", function() {
											});
											// 刷新列表
											venue.pagination.loadData();
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
												var v = iframe
														.$("#addWorkForm")
														.valid();// 验证表单
												if (v) {
													var param = venue.addParam(iframe);
													var rvData = null;// 定义返回对象
													// post请求提交数据
													ajaxData.contructor(false);// 同步
													ajaxData.request(
															URL_DATA.VENUE_ADD,
															param, function(
																	data) {
																rvData = data;
															});
													if (rvData == null) {
														return false;
													}
													if (rvData.code == config.RSP_SUCCESS) {
														// 提示成功
														popup.okPop("新增成功", function() {});
														// 清空数据
														venue.clearData(iframe);
														// 刷新列表
														venue.pagination.loadData();
													} else {
														// 提示失败
														popup
																.errPop(rvData.msg);
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
		 * 弹窗修改
		 */
		popUpdateVenueHtml : function(obj) {
			var venueId = $(obj).attr("data-tt-id");
			popup.open('./udf/venue/html/edit.html?venueId='
					+ venueId, // 这里是页面的路径地址
			{
				id : 'editVenue',// 唯一标识
				title : '场地信息修改',// 这是标题
				width : 760,// 这是弹窗宽度。其实可以不写
				height : 400,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						var param = venue.addParam(iframe);
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						ajaxData.request(URL_DATA.VENUE_UPDATE, param,
								function(data) {
									rvData = data;
								});
						if (rvData == null) {
							return false;
						}
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("修改成功", function() {
							});
							// 刷新列表
							venue.pagination.loadData();
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
		 * 弹窗修改
		 */
		popImportVenueHtml : function(obj) {
			var venueId = $(obj).attr("data-tt-id");
			popup.open('./udf/venue/html/import.html',{
				id : 'importVenue',// 唯一标识
				title : '修改场地',// 这是标题
				width : 900,// 这是弹窗宽度。其实可以不写
				height : 600,// 弹窗高度
				okVal : '确定',
				ok : function() {

				} 
			});
		},
		// 获取url参数
		getUrlParam : function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null)
				return unescape(r[2]);
			return null;
		},
		campusChange : function(firstText) {
			$("#campusId").on("change keyup", function() {
				$("#buildingId").empty();
				$("#buildingId").prepend("<option value=''>"+firstText+"</option>"); //为Select插入一个Option(第一个位置) 
				venue.getBuildingList($("#campusId").val());
			});
		},
		/**
		 * 页面初始化，绑定事件，新增初始化
		 */
		initAdd : function() {
			venue.loadData();
			venue.validation();
			venue.campusChange("--请选择--");
		},
		/**
		 * 页面初始化，绑定事件，更新初始化
		 */
		initUpdate : function() {
			venue.loadData();
			venue.validation();
			venue.campusChange("--请选择--");
			// 获取url参数
			var venueId = venue.getUrlParam('venueId');
			var rvData = null;// 定义返回对象
			var venueModel = null;// 定义前端实体对象
			// post请求提交数据
			var param = {
				"venueId" : venueId
			};// 新增一条数据

			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.VENUE_GET_ITEM, param, function(data) {
				rvData = data;
				venueModel = data.data;
			});
			if (venueModel != null) {
				$("#venueId").val(venueId);
				$("#venueNo").val(venueModel.venueNo);
				$("#venueName").val(venueModel.venueName);
				$("#departmentName").val(venueModel.departmentName);
				$("#departmentId").val(venueModel.departmentId);
				$("#campusId").val(venueModel.campusId);
				venue.getBuildingList($("#campusId").val());
				$("#buildingId").val(venueModel.buildingId);
				$("#floor").val(venueModel.floor);
				$("#venueTypeCode").val(venueModel.venueTypeCode);
				$("#seatAmount").val(venueModel.seatAmount);
				$("#effectiveSeatAmount").val(venueModel.effectiveSeatAmount);
				$("#examsSeatAmount").val(venueModel.examsSeatAmount);
				$("input[name='isEnabled'][value=" + venueModel.isEnabled + "]")
						.attr("checked", true);
				$("input[name='isEnabled'][value=" + venueModel.isEnabled + "]")
						.parent().parent().addClass("on-radio");
			}
		},
		/**
		 * 获取单条信息
		 * 
		 */
		getItem : function() {
			ajaxData.request(URL.SCHOOL_GET, null, function(data) {
				var item = data.data;
				$("#schoolId").val(item.schoolId);
				$("#name").val(item.name);
			})
		},
		/**
		 * 加载数据
		 */
		loadData : function() {
			// 点击权限码输入框阻拦(stopPropagation阻拦click事件冒泡)
			$('#departmentName').click(function(event) {
				event.stopPropagation();
			});
			
			var opt = {
					idTree : "treeCode", // 树Id
					id : "departmentId", // 下拉数据隐藏Id
					name : "departmentName", // 下拉数据显示name值
					code : "", // 下拉数据隐藏code值（数据字典）
					url : URL_DATA.DEPARTMENT_ZTREE, // 下拉数据获取路径
					defaultValue : "" // 默认值（修改时显示值）
				};
			treeSelect.loadTree(opt);
			
			venue.getCampusList();
			venue.getVenueTypeList();

		},
		/**
		 * 验证
		 */
		validation : function() {
			// 验证
			$("#addWorkForm").validate(
					{
						rules : {
							venueNo : {
								required : true
							},
							venueName : {
								required : true
							},
							departmentId : {
								required : true
							},
							campusId : {
								required : true
							},
							buildingId : {
								required : true
							},
							floor : {
								required : true
							},
							venueTypeCode : {
								required : true
							},
							seatAmount : {
								required : true
							},
							effectiveSeatAmount : {
								required : true
							},
							examsSeatAmount : {
								required : true
							}
						},
						messages : {
							venueNo : {
								required : '场地号不能为空'
							},
							venueName : {
								required : '场地名称不能为空'
							},
							departmentId : {
								required : '所属单位不能为空'
							},
							campusId : {
								required : '所在校区不能为空'
							},

							buildingId : {
								required : '所在楼房不能为空'
							},
							floor : {
								required : '所在楼层不能为空'
							},
							venueTypeCode : {
								required : '场地类型不能为空'
							},
							seatAmount : {
								required : '座位数不能为空'
							},

							effectiveSeatAmount : {
								required : '有效座位数不能为空'
							},
							examsSeatAmount : {
								required : '考试座位数不能为空'
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
		},
		/**
		 * 删除
		 */
		deleteVenue : function(obj) {
			// 获取url参数
			var venueId = $(obj).attr("data-tt-id");
			var arrayVenueId = [];
			arrayVenueId.push(venueId);
			venue.doDelete(arrayVenueId);
		},
		/**
		 * 批量删除
		 */
		batchDeleteVenue : function() {
			// 批量
			var venueIds = "";// 场地Id
			var arrayVenueId = [];
			$("input[name='checNormal']:checked").each(function() {
				arrayVenueId.push($(this).attr("venueId"));
			});
			if (arrayVenueId.length == 0) {
				popup.warPop("请勾选要删除的场地");
				return false;
			}
			venue.doDelete(arrayVenueId);
		},

		/**
		 * 执行删除操作
		 */
		doDelete : function(arrayVenueId) {
			// 参数
			var param = {
				arrayVenueId : arrayVenueId
			};
			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.VENUE_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {
					});
					// 刷新列表
					venue.pagination
							.loadData();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
		}

	}
	module.exports = venue;
	window.venue = venue;
});
 