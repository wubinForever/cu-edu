/**
 * 专业信息
 */
define(function(require, exports, module) {
	// 引入js
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var page = require("basePath/utils/page");
	var common = require("basePath/utils/common");
	var pagination = require("basePath/utils/pagination");

	var URL = require("basePath/config/url.udf");
	var URL_DATA = require("basePath/config/url.data");
	var dictionary = require("basePath/config/data.dictionary");

	var select = require("basePath/module/select");
	var simpleSelect = require("basePath/module/select.simple");
	var treeSelect = require("basePath/module/select.tree");
	var importUtils = require("basePath/utils/importUtils"); // 文件上传帮助
	var base = config.base;
	var data = []; // 数据
	/**
	 * 专业信息
	 */
	var major = {
		/**
		 * 列表页面初始化，绑定事件
		 */
		init : function() {
			// 加载院系
			simpleSelect.loadCommon("departmentId", URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS, {
				departmentClassCode : "1"
			}, "", "全部", "-1", null);

			// 加载培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode",dictionary.ID_FOR_TRAINING_LEVEL, {firstText:"全部",firstValue:""});

			// 分页
			major.pagination = new pagination({
				url : URL_DATA.MAJOR_GETLIST
			}, function(data) {
				if (data.length > 0) {
					$("#tbody").empty().append($("#treetableTmpl").tmpl(data)).removeClass(
							"no-data-html");
					$("#pagination").show();
				} else {
					$("#tbody").empty().append("<tr><td colspan='7'></td></tr>").addClass(
							"no-data-html");
					$("#pagination").hide();
				}
				//取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();

			// 查询
			$("#query").on("click", function() {
				// 保存查询条件
				major.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});

			// 新增
			$("button[name='addMajor']").bind("click", function() {
				major.popAddMajorHtml();
			});

			// 批量删除
			$("button[name='batchDeleteMajor']").bind("click", function() {
				major.batchDeleteMajor();
			});

			// 修改
			$(document).on("click", "[name='update']", function() {
				major.popUpdateMajorHtml(this);
			});

			// 删除
			$(document).on("click", "[name='delete']", function() {
				major.deleteMajor(this);
			});
			// 导入
			$(document).on("click", "button[name='import']", function() {
				new importUtils({
					title : "专业信息导入",
					uploadUrl : URL_DATA.MAJOR_IMPORTFILE,
					exportFailUrl : URL_DATA.MAJOR_EXPORT_FAILMESSATE,
					templateUrl : URL_DATA.MAJOR_EXPORTTEMPLATE,
					data : [ {
						name : "专业号",
						field : "majorNo"
					}, {
						name : "专业名称",
						field : "majorName"
					}, {
						name : "导入失败原因",
						field : "message"
					} ],
					successCallback : function() {
						// 刷新列表
						major.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
					}
				}).init();
			});
			// 导出
			$(document).on("click", "button[name='export']", function() {
				ajaxData.exportFile(URL_DATA.MAJOR_EXPORT, major.pagination.option.param);
			});
		},

		/**
		 * 新增页面初始化，绑定事件
		 */
		initAdd : function() {
			// 加载院系
			simpleSelect.loadSelect("departmentId",URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS,{"departmentClassCode" : "1"}, {firstText:"--请选择--",firstValue:""});

			// 加载培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode",dictionary.ID_FOR_TRAINING_LEVEL, {firstText:"--请选择--",firstValue:""});

			major.getSubject(); // 国标专业数据初始化
			// 专业学位
			var opt = {
				idTree : "professionalDegreeTree", // 树Id
				id : "", // 下拉数据隐藏Id
				name : "professionalDegreeName", // 下拉数据显示name值
				code : "professionalDegreeCode", // 下拉数据隐藏code值（数据字典）
				url : URL.DICTIONARY_GETTREELISTBYPARENTCODE, // 下拉数据获取路径
				param : {
					"parentCode" : dictionary.ID_FOR_HIGHEST_DEGREE_CODE // 数据字典 parentCode
				}, 
				defaultValue : "" // 默认值（修改时显示值）
			};
			treeSelect.loadTree(opt);

			major.validateBind(); // 页面绑定验证事件

			$("#establishTime").attr("readOnly", true);
		},

		/**
		 * 修改页面初始化，绑定事件
		 */
		initUpdate : function() {
			// 加载院系
			simpleSelect.loadSelect("departmentId",URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS,{"departmentClassCode" : "1"}, {firstText:"--请选择--",firstValue:"", async:false});

			// 加载培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode",dictionary.ID_FOR_TRAINING_LEVEL, { firstText:"--请选择--", firstValue:"", async:false});
			
			var majorId = utils.getUrlParam('majorId');
			var reqData = {
				"majorId" : majorId
			};
			major.getItem(reqData);

			major.validateBind(); // 页面绑定验证事件

			$("#esdablishTime").attr("readOnly", true);
		},

		/**
		 * 获取单条专业信息
		 * 
		 * @param reqData
		 *            专业信息Id
		 */
		getItem : function(reqData) {
			ajaxData.request(URL_DATA.MAJOR_GETITEM, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var item = data.data;
					$("#majorId").val(item.majorId);
					$("#majorNo").val(item.majorNo);
					$("#majorName").val(item.majorName);
					$("#shortName").val(item.shortName);
					$("#englishName").val(item.englishName);
					$("#departmentId").val(item.departmentId);
					if (item.establishTime !== null && item.establishTime !== "") {
						$("#establishTime").val(new Date(item.establishTime).format("yyyy-MM")); // 将Timestemp格式的时间转换为yyyy-MM格式
					}
					$("#educationSys").val(item.educationSys);
					$("#trainingLevelCode").val(item.trainingLevelCode);
					$("#subject").val(item.subjectCode);
					major.getSubject(item.subjectCode); // 国标专业控件数据初始化
					$("#subjectCategoryCode").val(item.subjectCategoryCode);
					$("#subjectCategory").text(item.subjectCategory);

					// 专业学位
					var opt = {
						idTree : "professionalDegreeTree", // 树Id
						id : "", // 下拉数据隐藏Id
						name : "professionalDegreeName", // 下拉数据显示name值
						code : "professionalDegreeCode", // 下拉数据隐藏code值（数据字典）
						url : URL.DICTIONARY_GETTREELISTBYPARENTCODE, // 下拉数据获取路径
						param : {
							"parentCode" : dictionary.ID_FOR_HIGHEST_DEGREE_CODE // 数据字典 parentCode
						}, 
						defaultValue : item.professionalDegreeId // 默认值（修改时显示值）
					};
					treeSelect.loadTree(opt);

					$("#remark").val(item.remark);
				}
			});
		},

		/**
		 * 单位下拉框数据初始化
		 */
		getDepartment : function() {
			var reqData = {
				"departmentClassCode" : "1" // 教学部门code值
			};
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL_DATA.DEPARTMENT_GETLISTBYCLASS, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$("#departmentIdTmpl").tmpl(data.data).appendTo('#departmentId');
				}
			});
		},

		/**
		 * 培养层次下拉框数据初始化
		 */
		getTrainingLevel : function() {
			var reqData = {
				parentCode : dictionary.ID_FOR_TRAINING_LEVEL
			}; // 培养层次主键Id
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GETLISTBYPARENTCODE, reqData, function(data) {
				$("#trainingLevelCodeTmpl").tmpl(data.data).appendTo('#trainingLevelCode');
			});
		},

		/**
		 * 国标专业下拉框数据初始化
		 */
		getSubject : function(defaultValue) {
			var subjectDom = [];
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL_DATA.SUBJECT_GETLIST, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$.each(data.data, function(i, item) {
						var option = {
							value : item.subjectCode,
							name : item.subjectName
						};
						subjectDom.push(option);
					});
					major.subjectSelect = new select({
						dom : $("#subjectCode"),
						defaultValue : defaultValue,
						loadData : function() {
							return subjectDom
						},
						onclick : major.getSubjectCategory
					}).init();
				}
			});
			
		},

		/**
		 * 获取学科门类信息
		 */
		getSubjectCategory : function(code) {
			if (code === "") {
				$("#subject").val("");
				$("#subjectCategoryCode").val("");
				$("#subjectCategory").text("");
				return false;
			}
			if (code.length < 6) {
				code = "0" + code;
			}

			$("#subject").val(code); // 方便保存时获取国标专业Id
			var reqData = {
				"subjectCode" : code.substring(0, 2)
			// 国标专业Code
			};
			ajaxData.request(URL_DATA.SUBJECT_GETITEM, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var item = data.data;
					$("#subjectCategoryCode").val(item.subjectCode);
					$("#subjectCategory").text(item.subjectName);
					$('[name=subject]').valid();
				}
			});
		},

		/**
		 * 专业学位下拉框数据初始化
		 */
		getProfessionalDegree : function() {
			var reqData = {
				"parentCode" : dictionary.ID_FOR_DEGREE
			// 专业学位主键Id
			};
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GET_SELECT_LIST_BY_PARENT_CODE, reqData, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					$("#professionalDegreeIdTmpl").tmpl(data.data)
							.appendTo('#professionalDegreeId');
				}
			});
		},

		/**
		 * 新增弹窗
		 */
		popAddMajorHtml : function() {
			popup.open('./udf/major/html/add.html', // 这里是页面的路径地址
			{
				id : 'addMajor',// 唯一标识
				title : '专业信息新增',// 这是标题
				width : 820,// 这是弹窗宽度。其实可以不写
				height : 510,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						// 表单验证通过
						var reqData = major.addParam(iframe); // 新增一条数据
						var rvData = null; // 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false); // 同步
						ajaxData.request(URL_DATA.MAJOR_ADD, reqData, function(data) {
							rvData = data;
						});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("新增成功", function() {
							});
						} else if (rvData.code == config.RSP_WARN) {
							// 提示失败信息
							popup.errPop(rvData.msg);
							return false;
						} else {
							// 提示失败
							popup.errPop("新增失败");
							return false;
						}
						// 刷新列表
						major.pagination.loadData();
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
								var iframe = this.iframe.contentWindow;// 弹窗窗体
								var v = iframe.$("#addWorkForm").valid();// 验证表单
								if (v) {
									// 表单验证通过
									var reqData = major.addParam(iframe); // 新增一条数据
									var rvData = null; // 定义返回对象

									// post请求提交数据
									ajaxData.contructor(false); // 同步
									ajaxData.request(URL_DATA.MAJOR_ADD, reqData, function(data) {
										rvData = data;
									});
									if (rvData == null)
										return false;
									if (rvData.code == config.RSP_SUCCESS) {
										// 提示成功
										popup.okPop("新增成功", function() {
										});
										// 清空页面内容
										iframe.$("#majorNo").val("");
										iframe.$("#majorName").val("");
										iframe.$("#shortName").val("");
										iframe.$("#englishName").val("");
										iframe.$("#departmentId").val("");
										iframe.$("#establishTime").val("");
										iframe.$("#educationSys").val("");
										iframe.$("#trainingLevelCode").val("");
										iframe.$("#subject").val("");
										iframe.major.subjectSelect.clearValue();// 清空国标专业搜索下拉框的值
										iframe.$("#subjectCategoryCode").val("");
										iframe.$("#subjectCategory").text("");

										var treeObj = iframe.$.fn.zTree
												.getZTreeObj("professionalDegreeTree");
										var nodes = treeObj.getSelectedNodes();
										if (nodes.length > 0) {
											treeObj.cancelSelectedNode(nodes[0]);
										}
										iframe.$("#professionalDegreeCode").val("");
										iframe.$("#professionalDegreeName").val("");

										iframe.$("#remark").val("");

									} else if (rvData.code == config.RSP_WARN) {
										// 提示失败信息
										popup.errPop(rvData.msg);
										return false;
									} else {
										// 提示失败
										popup.errPop("新增失败");
									}
									// 刷新列表
									major.pagination.loadData();
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
		 * 修改弹窗
		 */
		popUpdateMajorHtml : function(obj) {
			var majorId = $(obj).attr("data-tt-id");
			popup.open('./udf/major/html/update.html?majorId=' + majorId, // 这里是页面的路径地址
			{
				id : 'updateMajor',// 唯一标识
				title : '专业信息修改',// 这是标题
				width : 820,// 这是弹窗宽度。其实可以不写
				height : 510,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						// 表单验证通过
						var reqData = major.addParam(iframe); // 修改一条数据
						var rvData = null; // 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false); // 同步
						ajaxData.request(URL_DATA.MAJOR_UPDATE, reqData, function(data) {
							rvData = data;
						});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("修改成功", function() {
							});
							// 刷新列表
							major.pagination.loadData();
						} else if (rvData.code == config.RSP_WARN) {
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
		 * 删除专业
		 */
		deleteMajor : function(obj) {
			var majorId = $(obj).attr("data-tt-id");
			var arrayId = [];
			arrayId.push(majorId);
			major.deleteAjax(arrayId);
		},

		/**
		 * 批量删除专业
		 */
		batchDeleteMajor : function() {
			var arrayIds = [];
			$("tbody input[type='checkbox']:checked").each(function() {
				var majorId = $(this).parent().find("input[name='checNormal']").val();
				arrayIds.push(majorId);
			});
			if (arrayIds.length == 0) {
				popup.warPop("请勾选要删除的专业");
				return false;
			}
			major.deleteAjax(arrayIds);
		},

		/**
		 * 删除专业提交方法
		 * 
		 * @param arrayIds
		 *            删除的专业的id数组
		 */
		deleteAjax : function(arrayIds) {
			// 参数
			var reqData = {
				"marjorIds" : arrayIds
			};
			popup.askDeletePop("专业", function() {
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.MAJOR_DELETE, reqData, function(data) {
					if (data == null)
						return false;
					if (data.code == config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("删除成功", function() {
						});

						// 刷新列表
						major.pagination.loadData();
					} else {
						// 提示失败
						popup.errPop("删除失败");
						return false;
					}
				});
			});
		},

		/**
		 * 序列化参数
		 * 
		 * @param iframe
		 *            弹窗
		 * @returns 参数集合
		 */
		addParam : function(iframe) {
			var majorId = $.trim(iframe.$("#majorId").val());
			var majorNo = $.trim(iframe.$("#majorNo").val());
			var majorName = $.trim(iframe.$("#majorName").val());
			var departmentId = $.trim(iframe.$("#departmentId").val());
			var shortName = $.trim(iframe.$("#shortName").val());
			var englishName = $.trim(iframe.$("#englishName").val());
			var establishTime = $.trim(iframe.$("#establishTime").val());
			var educationSys = $.trim(iframe.$("#educationSys").val());
			var trainingLevelCode = $.trim(iframe.$("#trainingLevelCode").val());
			var subjectCode = $.trim(iframe.$("#subject").val());
			var subjectCategoryCode = $.trim(iframe.$("#subjectCategoryCode").val());
			var professionalDegreeId = $.trim(iframe.$("#professionalDegreeCode").val());
			var remark = $.trim(iframe.$("#remark").val());

			var reqData = {
				"majorId" : majorId,
				"majorNo" : majorNo,
				"majorName" : majorName,
				"departmentId" : departmentId,
				"shortName" : shortName,
				"englishName" : englishName,
				"establishTime" : establishTime,
				"educationSys" : educationSys,
				"trainingLevelCode" : trainingLevelCode,
				"subjectCode" : subjectCode,
				"subjectCategoryCode" : subjectCategoryCode,
				"professionalDegreeId" : professionalDegreeId,
				"remark" : remark
			};
			return reqData;
		},

		/**
		 * 绑定验证事件
		 */
		validateBind : function() {
			// 验证
			$("#addWorkForm").validate({
				rules : {
					majorNo : {
						required : true,
						maxlength : 10
					},
					majorName : {
						required : true,
						maxlength : 50
					},
					shortName : {
						maxlength : 50
					},
					englishName : {
						maxlength : 100
					},
					departmentId : {
						required : true
					},
					educationSys : {
						required : true,
						maxlength : 1
					},
					trainingLevelCode : {
						required : true
					},
					subject : {
						required : true
					},
					remark : {
						maxlength : 100
					}
				},
				messages : {
					majorNo : {
						required : '专业号不能为空',
						maxlength : '不超过10个字符'
					},
					majorName : {
						required : '专业名称不能为空',
						maxlength : '不超过50个字符'
					},
					shortName : {
						maxlength : '不超过50个字符'
					},
					englishName : {
						maxlength : '不超过100个字符'
					},
					departmentId : {
						required : '所属院系不能为空',
					},
					educationSys : {
						required : '学制不能为空',
						maxlength : '一位数字'
					},
					trainingLevelCode : {
						required : '培养层次不能为空'
					},
					subject : {
						required : '国标专业不能为空'
					},
					remark : {
						maxlength : '不超过100个字符'
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
		}
	}
	module.exports = major;
	window.major = major;
});
