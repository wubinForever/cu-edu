/**
 * 单位信息
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var page = require("basePath/utils/page");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var pagination = require("basePath/utils/pagination");
	
	var URL_DATA = require("basePath/config/url.data");
	var URL = require("basePath/config/url.udf");
	var dictionary = require("basePath/config/data.dictionary");
	var importUtils = require("basePath/utils/importUtils"); //文件上传帮助
	var base  =config.base;
	var data = [];// 数据
	/**
	 * 单位信息列表
	 */
	var department = {
		//查询条件
		queryObject:{},
		/**
		 * 页面初始化，绑定事件
		 */
		init : function() {
			// 加载校区
			department.getCampusList();

			// 单位组织下拉树
			department.ztree();
			
			department.pagination = new pagination({
				url : URL_DATA.DEPARTMENT_GETLIST,
				param : department.queryObject
			},function(data){
				if (data.length > 0){
					$("#tbody").empty().append($("#treetableTmpl").tmpl(data)).removeClass("no-data-html");
					$("#pagination").show();
				}else{
					$("#tbody").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
				//取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();
			
			// 查询
			$("#query").on("click", function() {
				department.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});

			// 新增
			$("button[name='add']").bind("click", function() {
				department.popAddDepartmentHtml();
			});
			// 修改
			$(document).on("click", "button[name='update']", function() {
				department.popUpdateDepartmentHtml(this);
			});
			// 删除
			$(document).on("click", "button[name='delete']", function() {
				department.deleteDepartment(this);
			});
			// 批量删除
			$(document).on("click", "button[name='batchDelete']", function() {
				department.batchDelete(this);
			});
			// 导入
			$(document).on("click", "button[name='import']", function() {
				new importUtils({
					title : "单位信息导入",
					uploadUrl : URL_DATA.DEPARTMENT_IMPORTFILE,
					exportFailUrl : URL_DATA.DEPARTMENT_EXPORT_FAILMESSATE,
					templateUrl : URL_DATA.DEPARTMENT_EXPORTTEMPLATE,
					data:[{name:"单位号",field:"departmentNo"},{name:"单位名称",field:"departmentName"},{name:"导入失败原因",field:"message"}],
					successCallback:function(){
						// 刷新列表
						department.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
						// 单位组织下拉树
						department.ztree();
					}
				}).init();
			});
			//导出
			$(document).on("click", "button[name='export']", function() {
				ajaxData.exportFile(URL_DATA.DEPARTMENT_EXPORT, department.pagination.option.param);
			});
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
		},
		
		/**
		 * 页面初始化，绑定事件，新增初始化
		 */
		initAdd : function() {
			//获取上级单位
			department.getParentDepartment();
			// 加载校区
			department.getCampusList();

			var departmentLevel =utils.getUrlParam('departmentLevel');
			
			if(departmentLevel==="1"){
				$("#level").val("2");
				$("#departmentClassDiv").hide();
				$("#departmentTypeDiv").show();
			}else{
				$("#level").val("1");
				$("#departmentClassDiv").show();
				$("#departmentTypeDiv").hide();
			}
			
			// 加载单位类别
			department.departmentClassSelect();
			// 加载单位类型
			department.departmentTypeSelect();
			// 加载单位办别
			department.startUpTypeSelect();
			// 验证
			department.validateFormData(departmentLevel);
		},

		/**
		 * 修改页面初始化，绑定事件，更新初始化
		 */
		initUpdate : function() {
			// 加载校区
			department.getCampusList();
			
			// 加载单位类别
			department.departmentClassSelect();
			// 加载单位类型
			department.departmentTypeSelect();
			// 加载单位办别
			department.startUpTypeSelect();
			// 显示数据
			department.showData();
			
//			$("#outvalidityTime").attr("readOnly", true);
//			$("#startupTime").attr("readOnly", true);
		},
		
		/**
		 * 获取上级单位并赋值
		 */
		getParentDepartment : function() {
			$("#parentId").val(utils.getUrlParam('parentId'));
			$("#parentName").text(utils.getUrlParam('parentName'));
			$("#parentName").attr('title', utils.getUrlParam('parentName'));
		},
		
		/**
		 * 查询所有校区信息
		 */
		getCampusList : function() {
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL_DATA.CAMPUS_GETALL, null, function(data) {
				for (var i = 0; i < data.data.length; i++) {
					var jsonObj = data.data[i];
					$("#campusId").append(
											"<option value=\""
													+ jsonObj.campusId
													+ "\" title=\""
													+ jsonObj.campusName
													+ "\" >"
													+ jsonObj.campusName
													+ "</option>");
				}
			});

		},

		/**
		 * 单位类别下拉框数据初始化
		 */
		departmentClassSelect : function() {
			var reqData={parentCode : dictionary.ID_FOR_DEPARTMENT_CLASS_CODE};
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GETLISTBYPARENTCODE, reqData,
					function(data) {
						$("#dictionaryTmpl").tmpl(data.data).appendTo(
								'#departmentClass');
					});
		},

		/**
		 * 单位类型下拉框数据初始化
		 */
		departmentTypeSelect : function() {
			var reqData={parentCode : dictionary.ID_FOR_DEPARTMENT_TYPE_CODE};
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GETLISTBYPARENTCODE, reqData,
					function(data) {
						$("#dictionaryTmpl").tmpl(data.data).appendTo(
								'#departmentType');
					});
		},

		/**
		 * 单位办别下拉框数据初始化
		 */
		startUpTypeSelect : function() {
			var reqData={parentCode : dictionary.ID_FOR_START_UP_TYPE_CODE};
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GETLISTBYPARENTCODE, reqData,
					function(data) {
						$("#dictionaryTmpl").tmpl(data.data).appendTo(
								'#startupType');
					});
		},

		/**
		 * 弹窗新增
		 */
		popAddDepartmentHtml : function() {
			if ($("#departmentLevel").val() === "2") {
				// 选中三级部门点击新增按钮，提示不能新增
				popup.errPop("暂不支持新增四级部门");
				return false;
			}
			
			popup.open('./udf/department/html/add.html?parentId='
									+ $("#departmentId").val()
									+ '&departmentLevel='
									+ $("#departmentLevel").val()
									+ '&parentName='
									+ escape($("#parentName").val()), 
									// 这里是页面的路径地址,escape编码是为了对应接收参数方法中的unescape解码,保证中文不会乱码
			{
				id : 'add',
				title : '单位信息新增',
				width : 800,
				height : 630,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						// 表单验证通过
						var reqData = department.addParam(iframe); // 新增一条数据
						var rvData = null; // 定义返回对象

						// post请求提交数据
						ajaxData.contructor(false); // 同步
						ajaxData.request(URL_DATA.DEPARTMENT_ADD, reqData,
								function(data) {
									rvData = data;
								});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("新增成功", function() {
							});
						} else if(rvData.code == config.RSP_WARN){
							// 提示失败信息
							popup.errPop(rvData.msg);
							return false;
						} else {
							// 提示失败
							popup.errPop("新增失败");
							return false;
						}
						// 单位组织下拉树
						department.ztree();
						// 刷新列表
						department.pagination.loadData();
					} else {
						// 表单验证不通过
						return false;
					}
				},
				cancel : function() {
					// 取消逻辑
				},
				button: [
					        {
					            name: '保存',
					            focus:true,//按钮高亮
					            callback: function () {
					                this.content('你确定了').time(2);
					                return false;
					            },
					            focus: true
					        },
					        {
					            name: '保存并新增',
					            focus:true,//按钮高亮
					            callback: function () {
					            	var iframe = this.iframe.contentWindow;// 弹窗窗体
									var v = iframe.$("#addWorkForm").valid();// 验证表单
									if (v) {
										// 表单验证通过
										var reqData = department.addParam(iframe); // 新增一条数据
										var rvData = null; // 定义返回对象

										// post请求提交数据
										ajaxData.contructor(false); // 同步
										ajaxData.request(URL_DATA.DEPARTMENT_ADD, reqData,
												function(data) {
													rvData = data;
												});
										if (rvData == null)
											return false;
										if (rvData.code == config.RSP_SUCCESS) {
											// 提示成功
											popup.okPop("新增成功", function() {
											});	
											// 清空页面内容
											department.clearPage(iframe);

										} else if(rvData.code == config.RSP_WARN){
											// 提示失败信息
											popup.errPop(rvData.msg);
											return false;
										} else {
											// 提示失败
											popup.errPop("新增失败");
										}
										// 单位组织下拉树
										department.ztree();
										// 刷新列表
										department.pagination.loadData();
									} else {
										// 表单验证不通过
										return false;
									}
									return false;
					            }
					        }
					    ]
			});
		},

		/**
		 * 序列化参数
		 * 
		 * @param iframe 弹窗
		 * @returns 参数集合
		 */
		addParam : function(iframe) {
			var parentId = $.trim(iframe.$("#parentId").val());
			var departmentNo = $.trim(iframe.$("#departmentNo").val());
			var departmentId = $.trim(iframe.$("#departmentId").val());
			var departmentName = $.trim(iframe.$("#departmentName").val());
			var shortName = $.trim(iframe.$("#shortName").val());
			var englishName = $.trim(iframe.$("#englishName").val());
			var departmentClass = $.trim(iframe.$("#departmentClass").val());
			var departmentType = $.trim(iframe.$("#departmentType").val());
			var startupType = $.trim(iframe.$("#startupType").val());
			var campusId = $.trim(iframe.$("#campusId").val());
			var leader = $.trim(iframe.$("#leader").val());
			var outvalidityTime = $.trim(iframe.$("#outvalidityTime").val());
			var isValidity = $.trim(iframe.$("[name=isValidity]:checked").val());
			var isEntity = $.trim(iframe.$("[name=isEntity]:checked").val());
			var startupTime = $.trim(iframe.$("#startupTime").val());
			var isEducationAdministration = $.trim(iframe.$("[name=isEducationAdministration]:checked").val());
			var address = $.trim(iframe.$("#address").val());
			var remark = $.trim(iframe.$("#remark").val());
			var level = $.trim(iframe.$("#level").val());

			var reqData = {
				"parentId" : parentId,
				"departmentNo" : departmentNo,
				"departmentId" : departmentId,
				"departmentName" : departmentName,
				"shortName" : shortName,
				"englishName" : englishName,
				"departmentClassCode" : departmentClass,
				"departmentTypeCode" : departmentType,
				"startupTypeCode" : startupType,
				"campusId" : campusId,
				"superintendent" : leader,
				"outvalidityTime" : outvalidityTime,
				"isValidity" : isValidity,
				"isEntity" : isEntity,
				"startupTime" : startupTime,
				"isEducationAdministration" : isEducationAdministration,
				"address" : address,
				"remark" : remark,
				"level" : level
			};
			return reqData;
		},

		/**
		 * 弹出修改页面
		 */
		popUpdateDepartmentHtml : function(obj) {
			var departmentId = $(obj).attr("data-tt-id");
			popup.open('./udf/department/html/update.html?departmentId='
					+ departmentId, // 这里是页面的路径地址
			{
				id : 'update',// 唯一标识
				title : '单位信息修改',// 这是标题
				width : 800,// 这是弹窗宽度。其实可以不写
				height : 630,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						// 表单验证通过
						var reqData = department.addParam(iframe); // 绑定修改数据
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);
						ajaxData.request(URL_DATA.DEPARTMENT_UPDATE, reqData,
								function(data) {
									rvData = data;
								});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("修改成功", function() {
							});
							// 刷新列表
							department.pagination.loadData();
						} else if(rvData.code == config.RSP_WARN){
							// 提示失败信息
							popup.errPop(rvData.msg);
							return false;
						} else {
							// 提示失败
							popup.errPop("修改失败");
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
		 * 显示修改页面数据
		 */
		showData : function() {
			// 获取url参数
			var departmentId = utils.getUrlParam('departmentId');
			var rvData = null;// 定义返回对象
			// post请求提交数据
			var param = {
				"departmentId" : departmentId
			};// 新增一条数据
			ajaxData.contructor(false);

			ajaxData.request(URL_DATA.DEPARTMENT_GETITEM, param,
					function(data) {
						rvData = data.data;
					});
			if (rvData != null) {
				$("#parentId").val(rvData.parentId);
				$("#parentName").text(rvData.parentName);
				$("#parentName").attr('title', rvData.parentName);
				$("#departmentId").val(rvData.departmentId);
				$("#departmentNo").val(rvData.departmentNo);
				$("#departmentName").val(rvData.departmentName);
				$("#shortName").val(rvData.shortName);
				$("#englishName").val(rvData.englishName);
				$("#departmentClass").val(rvData.departmentClassCode);
				$("#departmentType").val(rvData.departmentTypeCode);
				$("#startupType").val(rvData.startupTypeCode);
				
				/**
				 * 修改的单位的层级判断，用作显示单位类别还是单位类型，并添加对应的验证
				 * 单位类别不为空为二级部门，为空为三级部门
				 */
				var level = "";
				if(utils.isNotEmpty(rvData.departmentClassCode)){
					$("#level").val("1");
					$("#departmentClassDiv").show();
					$("#departmentTypeDiv").hide();
				}else{
					level="1";
					$("#level").val("2");
					$("#departmentClassDiv").hide();
					$("#departmentTypeDiv").show();
				}
				// 验证
				department.validateFormData(level);
				
				
				$("#campusId").val(rvData.campusId);
				$("#leader").val(rvData.superintendent);

				if (rvData.outvalidityTime !== null && rvData.outvalidityTime !== ""){
					$("#outvalidityTime").val(new Date(rvData.outvalidityTime).format("yyyy-MM-dd"));
				}
				
				$("input:radio[name='isValidity']:checked").parent().parent().removeClass("on-radio");
				$("input:radio[name='isValidity'][value='"+rvData.isValidity+"']").prop("checked","checked");
				$("input:radio[name='isValidity'][value='"+rvData.isValidity+"']").parent().parent().addClass("on-radio");

				$("input:radio[name='isEntity']:checked").parent().parent().removeClass("on-radio");
				$("input:radio[name='isEntity'][value='"+rvData.isEntity+"']").prop("checked","checked");
				$("input:radio[name='isEntity'][value='"+rvData.isEntity+"']").parent().parent().addClass("on-radio");

				if (rvData.startupTime !== null && rvData.startupTime !== ""){
					$("#startupTime").val(new Date(rvData.startupTime).format("yyyy-MM"));
				}

				$("input:radio[name='isEducationAdministration']:checked")
						.parent().parent().removeClass("on-radio");
				$("input:radio[name='isEducationAdministration'][value='"
								+ rvData.isEducationAdministration + "']")
						.prop("checked", "checked");
				$("input:radio[name='isEducationAdministration'][value='"
								+ rvData.isEducationAdministration + "']")
						.parent().parent().addClass("on-radio");
				
				$("#address").val(rvData.address);
				$("#remark").val(rvData.remark);
			}
		},

		/**
		 * 删除
		 */
		deleteDepartment : function(obj) {
			// 批量
			var departmentIds = [];// 单位Id
			var departmentId = $(obj).attr("data-tt-id");
			departmentIds.push(departmentId);
			var selectNode = false;
			if($("#departmentId").val()==departmentId){
				selectNode = true;
			}
			var param = {
				"departmentIds" : departmentIds
			};

			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.DEPARTMENT_DELETE, param, function(
						data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {});
					if(selectNode){
						$("#departmentId").val("");
						$("#departmentLevel").val("0");
						// 单位组织下拉树
						department.ztree();
						// 刷新列表
						department.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
					}
					else{
						// 单位组织下拉树
						department.ztree();
						// 刷新列表
						department.pagination.loadData();
					}
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
		},

		/**
		 * 批量删除
		 */
		batchDelete : function() {
			// 批量
			var departmentIds = [];// 单位Id
			var selectNode = false;
			$("tbody input[type='checkbox']:checked").each(
					function() {
						var departmentId = $(this).parent().find(
								"input[name='checNormal']").val();
						departmentIds.push(departmentId);
						if($("#departmentId").val()==departmentId){
							selectNode = true;
						}
					});
			if (departmentIds.length == 0) {
				popup.warPop("请勾选单位");
				return false;
			}
			// 参数
			var param = {
				"departmentIds" : departmentIds
			};
			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_DATA.DEPARTMENT_DELETE, param,
						function(data) {
							rvData = data;
						});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {});
					if(selectNode){
						$("#departmentId").val("");
						$("#departmentLevel").val("0");
						// 单位组织下拉树
						department.ztree();
						// 刷新列表
						department.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
					}
					else{
						// 单位组织下拉树
						department.ztree();
						// 刷新列表
						department.pagination.loadData();
					}
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
		},

		/**
		 * 5.1 验证表单
		 */
		validateFormData : function(level) {
			//ve.validateEx();
			
			// 验证
			$("#addWorkForm").validate({
				rules : {
					departmentNo : {
						required : true,
						maxlength : 10
					},
					departmentName : {
						required : true,
						maxlength : 50
					},
					startupType : {
						required : true
					},
					campusId : {
						required : true
					},
					shortName : {
						maxlength : 20
					},
					englishName : {
						maxlength : 100
					},
					leader : {
						maxlength : 50
					},
					address : {
						maxlength : 100
					},
					remark : {
						maxlength : 200
					}
				},
				messages : {
					departmentNo : {
						required : '单位号不能为空',
						maxlength : '单位号不能超过10个字符'
					},
					departmentName : {
						required : '单位名称不能为空',
						maxlength : '单位名称不能超过50个字符'
					},
					startupType : {
						required : '单位办别不能为空'
					},
					campusId : {
						required : '所在校区不能为空'
					},
					shortName : {
						maxlength : '单位简称不能超20个字符'
					},
					englishName : {
						maxlength : '单位英文名称不能超100个字符'
					},
					leader : {
						maxlength : '负责人不能超50个字符'
					},
					address : {
						maxlength : '地址不能超过100个字符'
					},
					remark : {
						maxlength : '备注不能超过200个字符'
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

			if(level==="1"){
				$("#departmentType").rules("add", {
					required : true, messages : { required : "单位类型不能为空" }
				});
				$("#departmentClass").rules("remove", "required");
			}else{
				$("#departmentClass").rules("add", {
					required : true, messages : { required : "单位类别不能为空" }
				});
				$("#departmentType").rules("remove", "required" );
			}
		},
		
		/**
		 * 清空页面内容
		 */
		clearPage:function(iframe){
			// 清空页面内容
			iframe.$("#departmentNo").val("");
			iframe.$("#departmentName").val("");
			iframe.$("#shortName").val("");
			iframe.$("#englishName").val("");
			iframe.$("#leader").val("");
			iframe.$("#address").val("");
			iframe.$("#remark").val("");

			iframe.$("#departmentClass").val("");
			iframe.$("#departmentType").val("");
			iframe.$("#startupType").val("");
			iframe.$("#campusId").val("");
			iframe.$("#outvalidityTime").val("");
			iframe.$("#startupTime").val("");

			iframe.$("input:radio[name='isValidity']:checked").parent()
					.parent().removeClass("on-radio");
			iframe.$("input:radio[name='isValidity'][value='1']").prop(
					"checked", "checked");
			iframe.$("input:radio[name='isValidity'][value='1']").parent()
					.parent().addClass("on-radio");

			iframe.$("input:radio[name='isEntity']:checked").parent().parent()
					.removeClass("on-radio");
			iframe.$("input:radio[name='isEntity'][value='1']").prop("checked",
					"checked");
			iframe.$("input:radio[name='isEntity'][value='1']").parent()
					.parent().addClass("on-radio");

			iframe.$("input:radio[name='isEducationAdministration']:checked")
					.parent().parent().removeClass("on-radio");
			iframe.$("input:radio[name='isEducationAdministration'][value='0']")
					.prop("checked", "checked");
			iframe.$("input:radio[name='isEducationAdministration'][value='0']")
					.parent().parent().addClass("on-radio");
		},
		
		// 下拉树插件加载
		ztree:function(){
			var setting = {
				view : {
					showLine : false,
					nameIsHTML : false
				},
				data : {
					simpleData : {
						enable : true,
						idKey : "id",
						pIdKey : "pId",
						rootPId : "0"
					},
				},
				callback : {
					onClick : function(event, treeId, treeNode) {
						$("#departmentId").val(treeNode.id);
						$("#parentName").val(treeNode.name);
						$("#departmentLevel").val(treeNode.departmentLevel);
						department.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
					}
				}
			};
			   
		    ajaxData.request(URL_DATA.DEPARTMENT_ZTREE,null,function(data){
		    	var treeList = data.data;
				ajaxData.request(URL_DATA.SCHOOL_GET, null, function(data) {
					var school = {
						"checked" : "true",
						"departmentLevel" : 0,
						"isSchool" : "true",
						"chkDisabled" : "false",
						"count" : "",
						"id" : data.data.schoolId,
						"isParent" : "true",
						"name" : data.data.schoolName,
						"nocheck" : "false",
						"open" : "true",
						"pId" : "0",
						"times" : ""
					};
					treeList.push(school);
					$.fn.zTree.init($("#ztree"), setting, treeList);
					// 初始选中学校
					var zTree = $.fn.zTree.getZTreeObj("ztree");
					var nodeId = $("#departmentId").val();
					var node;
					if (utils.isNotEmpty(nodeId)) {
						node = zTree.getNodeByParam("id", nodeId);
					} else {
						node = zTree.getNodeByParam("isSchool", "true");
					}
					zTree.selectNode(node);
					department.queryObject = {
						departmentId : node.id
					};
					$("#departmentId").val(node.id);
					$("#parentName").val(node.name);
				});
			});
		},

	/** ********************* end ******************************* */
	}
	module.exports = department;
	window.department = department;
});
