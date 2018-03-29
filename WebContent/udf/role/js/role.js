/**
 * 角色管理
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("configPath/url.udf");
	var URL_DATA = require("configPath/url.data");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var treeSelect = require("basePath/module/select.tree");//公用下拉树
	var roleMenuPermissionFlagEnum = require("basePath/enumeration/udf/RoleMenuPermissionFlag");// 枚举
	var base  =config.base;
	
	/**
	 * 角色被授权列表
	 */
	var roleMenuPermissionList = {	
			roleId : 0, // 角色Id
			menuList : [ {
				menuId : 0, // 树节点编码
				flag : 0, // 0 不变，1新增， 2删除
			} ]		
	};

	var treeChild = new Array();  
	/**
	 * 维护用户-添加页面-添加 变量
	 */
    var usersInRole = {
        roleId: 0, //角色Id
        users: [
            {
                userId: 0, // 用户id
                accountName: 0, // 用户账号
                userName: "", // 用户名称
                deptmentId: 0, // 机构id
                deptmentName: "", // 机构名称
            }
        ]
    };
    usersInRole.users.length = 0; // 长度初始化为0
    
	/**
	 * 树目录控件初始化复选框 数据
	 */
	var zNodesMenu =[];
	
	/**
	 * 角色管理
	 */
	var role = {
		//查询条件
		queryObject:{},	
		//新增用户查询条件
		queryUserObject:{},	
		// 初始化
		init : function() {
			// 新增
			$("button[name='addRole']").bind("click", function() {
				role.popAddRoleHtml();
			});
			// 删除
			$(document).on("click", "[name='deleteRole']", function() {
				role.deleteRole(this);
			});
			// 批量删除
			$(document).on("click", "button[name='batchDeleteRole']", function() {
				role.batchDeleteRole(this);
			});
			// 修改
			$(document).on("click", "[name='editRole']", function() {
				role.popUpdateRoleHtml(this);
			});
			//分页
			role.getRolePagedList();
			// 查询
			$('#query').click(function() {
				//保存查询条件
				role.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			})
			// 维护
			$(document).on("click", "[name='maintainUser']", function() {
				role.maintenance(this);
			});
			// 授权
			$(document).on("click", "[name='authorization']", function() {
				role.empowerPop(this);
			});	
		},

		/**
		 * 角色分页列表
		 */
		getRolePagedList : function() {
			//分页
			role.pagination = new pagination({
				id: "pagination", 
				url: URL.ROLE_GET_PAGEDLIST, 
				param: role.queryObject 
			},function(data){
				 //处理分页控件显示与隐藏
				 $("#pagination").show();
				 if(data && data.length != 0) {
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='6'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
				//取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();
		},
		
		/**
		 * 维护用户 初始化
		 */
		initMaintenance : function() {
			var reqData = popup.data("param");// 获取主页面传入的参数
			if (utils.isEmpty(reqData.roleId)){
				popup.errPop("非法操作");
				return false;
			}
			$("#roleName").text(reqData.roleName);
			$("#roleCode").text(reqData.roleCode);
			$("#roleDescription").text(reqData.roleDesc);
			$("#roleName").attr("title",reqData.roleName); // 显示遮盖部分
			$("#roleCode").attr("title",reqData.roleCode);
			$("#roleDescription").attr("title",reqData.roleDesc);
			
			// 初始化列表
			role.userInRoleInfoQuery(reqData);
			// 新增 用户
			$("button[name='addUsers']").bind("click", function() {
				role.popAddUsersHtml();
			});
			// 删除用户
			$("button[name='deleUsers']").bind("click", function() {
				role.deleteUserInRole();
			});
		},
		
		/**
		 * 角色 授权页面初始化
		 */
		initEmpower : function(){
			roleMenuPermissionList.menuList.length = 0; // 长度初始化为0
			// 全选
			$("button[name='btnSelectAll']").bind("click", function() {
				role.selectAllRoleMenu();
			});
			// 清空
			$("button[name='btnClear']").bind("click", function() {
				role.clearAllRoleMenu();
			});
			
			// 取树结构数据
			var roleId = utils.getUrlParam('roleId');
			var urlinfo = window.location.href
			var roleName =decodeURIComponent(urlinfo.split("?")[1].split("&")[1].split("=")[1]);// 参数
			$("#roleId").val(roleId);
			$("#roleName").text(roleName);
			$("#roleName").attr("title",roleName);
			var param = {
				"roleId" : roleId
			};			
			
			//树目录控件初始化复选框 设置
			var settingMenu = {
				view: {
					showLine: false
				},
				check: {
					enable: true
				},
				data: {
					simpleData: {
						enable: true
					}
				},
				
				callback: {
					onCheck: role.zTreeOnClick
				}
			};
			
			ajaxData.request(URL.ROLE_GET_PERMISSIONBYROLEID, param, function(data) {
				if (data.code == config.RSP_SUCCESS && data.data != null) {
					zNodesMenu=data.data;					
					// 初始化树结构			
					$.fn.zTree.init($("#treeRoleMenu"), settingMenu, zNodesMenu);
					// 初始化授权
					if (zNodesMenu){
						roleMenuPermissionList.roleId = $("#roleId").val(); // 角色Id
						for (var i=0;i<zNodesMenu.length;i++){
							var menuList = {};
							menuList.menuId = zNodesMenu[i].id; // 菜单Id
							menuList.flag = roleMenuPermissionFlagEnum.CONSTANT.value;// 不变
							roleMenuPermissionList.menuList.push(menuList);
						}
					}						
				}
			},true);
		},

		/**
		 * 维护用户 新增
		 */
		initIn : function() {
			//所属单位
			var opt = {
					idTree : "administrativeUnitTree", // 树Id
					id : "deptmentId", // 下拉数据隐藏Id
					name : "deptmentName", // 下拉数据显示name值
					code : "", // 下拉数据隐藏code值（数据字典）
					url : URL_DATA.DEPARTMENT_ZTREE, // 下拉数据获取路径
					defaultValue : "" // 默认值（修改时显示值）
				};
			treeSelect.loadTree(opt);

			// 角色Id
			var roleId = utils.getUrlParam('roleId');
			$("#roleId").val(roleId);
			// 初始化用户分页列表
			role.getUserPagedList();
			// 复选框
			utils.checkAllCheckboxes('check-all-right', 'checNormal-right');
			// 维护用户 查询
			$("button[name='btnSearch']").bind("click", function() {
				//保存查询条件
				role.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
				role.unCheckUserPagedList();
			});
			// 维护用户 新增页面-添加
			$("button[name='btnAdd']").bind("click", function() {
				role.addUserInAddUsersPage();
			});
			// 维护用户 新增页面-移除
			$("button[name='btnDelete']").bind("click", function() {
				role.deleteUserInAddUsersPage();
			});
			// 用户账号/姓名文本框改变事件
			$(document).on("input propertychange", "#userName",function(){
				//保存查询条件
				role.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
				role.unCheckUserPagedList();
			 });
		},

		/**
		 * 页面初始化，绑定事件，新增初始化
		 */
		initAdd : function() {
			// 验证
			role.addNameLengthVerify();
			role.addCodeLengthVerify();
			role.addDescLengthVerify();
			role.addNameRepeatVerify();
			$("#addWorkForm").validate({
				rules : {
					roleName : {
						required : true,
						"roleNamelengthVerify" : true
					},
					roleCode : {
						"roleCodelengthVerify" : true
					},
					roleDescription : {
						"roleDesclengthVerify" : true
					}

				},
				messages : {
					roleName : {
						required : '角色名称不能为空',
						"roleNamelengthVerify" : "角色名称长度不能超过50"
					},
					roleCode : {
						"roleCodelengthVerify" : "角色编码长度不能超过50"
					},
					roleDescription : {
						"roleDesclengthVerify" : "描述长度不能超过200"
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
			// 角色名称重复验证
			$(document).on("change", "#roleName",function(){				  
				var roleName = $.trim($(this).val());
				if (utils.isNotEmpty(roleName)){
					var param = {roleName : roleName};
					ajaxData.contructor(false);
					ajaxData.request(URL.ROLE_VALIDATIONROLE,param,function(data){
						// 返回内容
						if (data.code == config.RSP_SUCCESS){
							if(utils.isNotEmpty(data.data.warningMessage) && data.data.warningFlag == 'roleName'){
								$("#roleName").rules("add",{
									"roleNameRepeatVerify":true,
									messages: {  
										"roleNameRepeatVerify":data.data.warningMessage
									}
								});								
							}else{
								$("#roleName").rules("remove","roleNameRepeatVerify");
							}
						}
					});		
				}		  
			 });
		},

		/**
		 * 添加验证长度
		 */
		addNameLengthVerify : function() {
			jQuery.validator.addMethod("roleNamelengthVerify", function(value,
					element) {
				if (value.length > 50) {
					return false;
				} else {
					return true;
				}
			}, "角色名称长度不能超过50");
		},
		
		
		/**
		 * 添加验证重复
		 */
		addNameRepeatVerify : function() {
			jQuery.validator.addMethod("roleNameRepeatVerify", function(value,
					element) {
				return false;
			}, "角色名称不能重复");
		},
		
		/**
		 * 添加验证长度
		 */
		addCodeLengthVerify : function() {
			jQuery.validator.addMethod("roleCodelengthVerify", function(value,
					element) {
				if (value.length > 50) {
					return false;
				} else {
					return true;
				}
			}, "角色编码长度不能超过50");
		},

		/**
		 * 添加验证长度
		 */
		addDescLengthVerify : function() {
			jQuery.validator.addMethod("roleDesclengthVerify", function(value,
					element) {
				if (value.length > 200) {
					return false;
				} else {
					return true;
				}
			}, "描述长度不能超过200");
		},

		/**
		 * 页面初始化，绑定事件，更新初始化
		 */
		initUpdate : function() {
			// 验证
			role.addNameLengthVerify();
			role.addCodeLengthVerify();
			role.addDescLengthVerify();
			role.addNameRepeatVerify();
			$("#addWorkForm").validate({
				rules : {
					roleName : {
						"roleNamelengthVerify" : true
					},
					roleCode : {
						"roleCodelengthVerify" : true
					},
					roleDescription : {
						"roleDesclengthVerify" : true
					}

				},
				messages : {
					roleName : {
						"roleNamelengthVerify" : "角色名称长度不能超过50"
					},
					roleCode : {
						"roleCodelengthVerify" : "角色编码长度不能超过50"
					},
					roleDescription : {
						"roleDesclengthVerify" : "描述长度不能超过200"
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
			// 获取url参数
			var roleId = utils.getUrlParam('roleId');
			var rvData = null;// 定义返回对象
			// post请求提交数据
			var param = {
				"roleId" : roleId
			};
			// 加载属性
			ajaxData.contructor(false);
			ajaxData.request(URL.ROLE_GET_ITEM, param, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS){
					rvData = data.data;	
					// 绑定数据
					$("#roleName").val(rvData.roleName);
					$("#roleCode").val(rvData.code);
					$("#roleId").val(rvData.roleId);
					$("#roleDescription").val(rvData.description);
				}
			});
			// 角色名称重复验证
			$(document).on("change", "#roleName",function(){				  
				var roleName = $.trim($(this).val());
				if (utils.isNotEmpty(roleName)){
					var param = {
							roleName : roleName,
							roleId : rvData.roleId
							};
					ajaxData.contructor(false);
					ajaxData.request(URL.ROLE_VALIDATIONROLE,param,function(data){
						// 返回内容
						if (data.code == config.RSP_SUCCESS){
							if(utils.isNotEmpty(data.data.warningMessage) && data.data.warningFlag == 'roleName'){
								$("#roleName").rules("add",{
									"roleNameRepeatVerify":true,
									messages: {  
										"roleNameRepeatVerify":data.data.warningMessage
									}
								});								
							}else{
								$("#roleName").rules("remove","roleNameRepeatVerify");
							}
						}								
					});		
				}		  
			 });
		},

		/**
		 * 弹窗新增
		 */
		popAddRoleHtml : function() {
			popup.open('./udf/role/html/add.html', // 这里是页面的路径地址
			{
				id : 'addRole',// 唯一标识
				title : '新增角色',// 这是标题
				width : 500,// 这是弹窗宽度。其实可以不写
				height : 250,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						// 表单验证通过
						var roleName = $.trim(iframe.$("#roleName").val());
						var roleCode = $.trim(iframe.$("#roleCode").val());
						var roleDescription = $.trim(iframe.$(
								"#roleDescription").val());
						var param = {
							"roleName" : roleName,
							"code" : roleCode,
							"description" : roleDescription
						};// 新增一条数据
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						ajaxData.request(URL.ROLE_ADD, param, function(
								data) {
							rvData = data;
						});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("保存成功", function() {
							});
							// 刷新列表
							role.queryObject = {};// 清空条件
							// 刷新列表
							role.getRolePagedList();
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
		 * 
		 * @param tRole this对象
		 */
		popUpdateRoleHtml : function(tRole) {
			var roleId = $(tRole).attr("data-tt-id");// 获取this对象的属性
			popup.open('./udf/role/html/edit.html?roleId=' + roleId, // 这里是页面的路径地址
			{
				id : 'updateRole',// 唯一标识
				title : '修改角色',// 这是标题
				width : 500,// 这是弹窗宽度。其实可以不写
				height : 250,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						// 表单验证通过
						var roleName = $.trim(iframe.$("#roleName").val());
						var roleCode = $.trim(iframe.$("#roleCode").val());
						var roleDescription = $.trim(iframe.$(
								"#roleDescription").val());
						var roleId = $.trim(iframe.$("#roleId").val());
						var param = {
							"roleName" : roleName,
							"code" : roleCode,
							"roleId" : roleId,
							"description" : roleDescription
						};// 新增一条数据
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);
						ajaxData.request(URL.ROLE_UPDATE, param,
								function(data) {
									rvData = data;
								});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("保存成功", function() {
							});
							// 刷新列表
							role.pagination.loadData();
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
		 * 角色 删除 
		 * 
		 * @param tRole this对象
		 */
		deleteRole : function(tRole) {
			var roleId = $(tRole).attr("data-tt-id");// 获取this对象的属性
			var arrayId=[];
			arrayId.push(roleId);
			// 参数
			var param = {
				"arrayId" : arrayId
			};
			popup.askDeletePop("角色", function() {
				var rvData=null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL.ROLE_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {
					});
					// 刷新列表
					role.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
		},

		/**
		 * 角色 批量删除
		 */
		batchDeleteRole : function() {
			// 批量
			var roleIds="";// 角色Id
			var arrayId=[];
			$("tbody input[type='checkbox']:checked").each(function(){
				var roleId = $(this).parent().find("input[name='checNormal']").val();
				arrayId.push(roleId);
			});
			if (arrayId.length==0){
				popup.warPop("请勾选要删除的角色");
				return false;
			}
			// 参数
			var param = {
				"arrayId" : arrayId
			};
			popup.askDeletePop("角色", function() {
				var rvData=null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL.ROLE_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {
					});
					// 刷新列表
					role.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
		},

		/**
		 * 弹窗 维护
		 * @param tRole this对象
		 */
		maintenance : function(obj) {
			// 主页面参数
			popup.data("param", {
				roleId : $(obj).attr("data-tt-id"),// 获取this对象的属性
				roleName : $(obj).parent().parent().find('td').eq(1).text(),// 获取角色名称
				roleCode : $(obj).parent().parent().find('td').eq(2).text(),// 获取角色编码
				roleDesc : $(obj).parent().parent().find('td').eq(0).find("[name='desHidden']").val()// 获取描述
			});
			popup.open('./udf/role/html/maintainUsers.html', // 这里是页面的路径地址
					{
						id : 'maintenanceRole',
						title : "维护用户",
						width : 800,
						height : 760,
						okVal : '保存',
						cancelVal : "关闭",
						cancel : function() {
							// 取消逻辑
						}
					});
		},

		/**
		 * 弹窗 维护新增用户
		 */
		popAddUsersHtml : function() {
			var roleId = $("#roleId").val();
			popup.open('./udf/role/html/addUsers.html?roleId='+roleId, // 这里是页面的路径地址
			{
				id : 'maintenanceUsers',
				title : "新增用户",
				width : 1200,
				height : 690,
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var usersList = iframe.role.getUsersInRole().users; // 获取已选用户列表集合
					if(usersList==null || typeof(usersList) == "undefined" || usersList.length==0){
						// 提示失败
						popup.warPop("请添加用户");
						return false;
					}
					// 处理已选用户
					var roleId = $.trim(iframe.$("#roleId").val()); // 角色Id						 
					var josn=JSON.stringify(iframe.role.getUsersInRole());
					var param = {
						userListJson : josn
					};
					var rvData = null; // 定义返回对象
					// post请求提交数据
					ajaxData.contructor(false);
					ajaxData.request(URL.ROLE_ADDUSERSTOROLE, param,
							function(data) {
								rvData = data;
							});
					if (rvData == null)
						return false;
					if (rvData.code == config.RSP_SUCCESS) {
						// 刷新列表
						role.pagination.loadData();
						// 提示成功
						popup.okPop("保存成功", function() {});						
					} else {
						// 提示失败
						popup.errPop(rvData.msg);
					}						
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},

		/**
		 * 弹窗 授权
		 */
		empowerPop : function(obj) {
			var roleId = $(obj).attr("data-tt-id");// 获取this对象的属性
			var roleName = $(obj).parent().parent().find('td').eq(1).text();// 获取角色名称
			var dealDialog = popup.open('./udf/role/html/empowerTree.html?roleId=' + roleId + "&roleName="+encodeURIComponent(roleName), // 这里是页面的路径地址
			{
				id : 'empowerPopHtml',
				title : "授权",
				width : 500,
				height : 600,
				okVal : "保存",
				cancelVal : '关闭',
				ok : function(iframeObj) {
					// 确定逻辑				
					var roleMenuList = iframeObj.role.getLastList();
					if (roleMenuList == null
							|| typeof (roleMenuList) == "undefined"
							|| roleMenuList.menuList.length == 0) {
						// 提示失败
						popup.warPop("请勾选菜单进行授权");
						return false;
					}
					// 处理已选菜单					 
					var josn=JSON.stringify(roleMenuList);
					var param = {
							roleMenuListJson : josn
					};
					
					// ajax提示错误前会自动关闭弹框
					iframeObj.$("body").append("<div class='loading'></div>");// 缓冲提示
					iframeObj.$("body").append("<div class='loading-back'></div>");		
					// post请求提交数据
					ajaxData.request(URL.ROLE_SAVE_PERMISSION, param,
							function(data) {
								iframeObj.$(".loading,.loading-back").remove();
								var rvData = data;
								if (rvData.code == config.RSP_SUCCESS) {
									// 关闭窗体
									dealDialog.close();									
									// 提示成功
									popup.okPop("保存成功", function() {							
									});
								} else {
									// 提示失败
									popup.errPop(rvData.msg);
								}
							},true);
					return false; // 阻止弹窗
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},

		/**
		 * 用户分页列表
		 */
		getUserPagedList : function() {
			//分页
			role.pagination = new pagination({
				id: "pagination", 
				url: URL.USER_GET_USERPAGEDLISTBYPARAMS, 
				param: role.queryUserObject 
			},function(data){
				 //处理分页控件显示与隐藏
				 $("#pagination").show();
				 if(data && data.length != 0) {
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
				//取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();
		},
		
		/**
		 * 复选框取消勾选
		 */
		unCheckUserPagedList : function(){
			// 取消选中
			$("input[type='checkbox']").each(function(){
			    $(this).attr("checked",false);
			    $(this).parent().removeClass("on-check");
			    $(this).parent().parent().parent().removeClass("active-tr");
			});
		},
		
		/**
		 * 角色包含的用户列表，无分页
		 * 
		 * @param reqData 参数
		 */
		userInRoleInfoQuery : function(reqData) {
			// 分页
			role.pagination = new pagination({
				id: "pagination", 
				url: URL.ROLE_GET_PAGEDUSERLISTBYROLEID, 
				param: reqData 
			},function(data){
				 // 处理分页控件显示与隐藏
				 $("#pagination").show();
				 if(data && data.length != 0) {
					 $("#tbodycontent").removeClass("no-data-html").empty().append($("#bodyContentImpl").tmpl(data));
				 }else {
					$("#tbodycontent").empty().append("<tr><td colspan='7'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
				 //取消全选
				 $('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();
			$("#roleId").val(reqData.roleId);
		},
		
		/**
		 * 删除角色包含的用户
		 * 
		 * @param tUser this对象
		 */
		deleteUserInRole : function() {
			// 批量
			var arrayId=[];// id数组
			var roleUserIds="";// 角色用户Id
			$("tbody input[type='checkbox']:checked").each(function(){
				var roleUserId = $(this).parent().find("input[name='checNormal']").val();				
				arrayId.push(roleUserId);
			});			
			if (arrayId.length == 0){
				popup.warPop("请勾选要删除的用户");
				return false;
			}
			// 参数
			var param = {
				"arrayId" : arrayId
			};
			popup.askDeletePop("角色用户", function() {
				var rvData=null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL.ROLE_DELETE_USERINROLE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop("删除成功", function() {
						// 刷新列表
						role.pagination.loadData();
					});
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
		},
		
		/**
		 * 维护用户-新增页面-添加
		 */
		addUserInAddUsersPage:function(){
			// 获取勾选项
			var userIds=""
			$("#tbodycontent input[type='checkbox']:checked").each(function(){
				var userId = $(this).parent().find("input[name='checNormal']").val();
				var accountName = $(this).parent().parent().parent().find("td[name='accountName']").html();
				var userName = $(this).parent().parent().parent().find("td[name='userName']").html();
				var deptmentId = $(this).parent().parent().parent().find("td input[name='deptmentId']").val();
				var deptmentName=$(this).parent().parent().parent().find("td[name='deptmentName']").html();
				userIds += userId+",";
				// 加入已选用户
				role.addRowContent(userId, accountName, userName, deptmentId, deptmentName);
			});
			userIds=userIds.substring(0, userIds.length-1);// 去掉,	
			if (userIds==""){
				return false;
			}
		},
		
		/**
		 * 维护用户-新增页面-移除
		 */
		deleteUserInAddUsersPage:function(){
			// 获取勾选项
			var userIds=""
			$("#tbodyContenAdding input[type='checkbox']:checked").each(function(){
				var userId = $(this).parent().find("input[name='checNormal-right']").val();
				var accountName = $(this).parent().parent().parent().find("td[name='accountName']").html();
				var userName = $(this).parent().parent().parent().find("td[name='userName']").html();
				var deptmentId = $(this).parent().parent().parent().find("td input[name='deptmentId']").val();
				var deptmentName=$(this).parent().parent().parent().find("td[name='deptmentName']").html();
				userIds += userId+",";
				// 移除已选用户
				var index = $(this).parent().attr("index");
				var obj = {
	                accountName: accountName, // 用户账号
	                userId: userId, // 用户id
	                userName: userName, // 用户名称 
	                deptmentId: deptmentId, // 机构id
	                deptmentName: "", // 机构名称
	            }
				role.delRowContent(obj);
			});
			userIds=userIds.substring(0, userIds.length-1);// 去掉,	
			if (userIds==""){
				return false;
			}
	        role.showList(); //每删除一行，重新生成一遍列表显示
		},
		
		/**
		 * 维护用户-新增页面-新增初始化 新增行内容
		 * 
		 * @param userId 用户id
		 * @param accountName 账号
		 * @param userName 用户名称
		 * @param deptmentId 机构id
		 * @param deptmentName 机构名称
		 */
		addRowContent:function(userId, accountName, userName, deptmentId, deptmentName) {
			// 数组中是否包含当前用户id
			var userArry=[];
			$(usersInRole.users).each(function(index, element) {
				userArry.push(element.userId);
	        });
			var result = $.inArray(userId, userArry); // 数组中是否包含当前用户id
			if(result!=-1){
				return;
			}
	        var users = {}; //创建一个多次领用对象
	        users.userId = userId;
	        users.accountName=accountName;
	        users.userName=userName;
	        users.deptmentId=deptmentId;
	        users.deptmentName=deptmentName;
	        usersInRole.roleId = $("#roleId").val();
	        usersInRole.users.push(users);
	        role.showList(); //每新增一行，重新生成一遍列表显示
	    },
	    
	    /**
	     * 清空并显示已选用户
	     */
	    showList:function (){
	        $("#tbodyContenAdding").empty();
	        $("#check-all-right").attr("checked",false); // 复选框去掉选中
	        $("#check-all-right").parent().removeClass("on-check");
	        $(usersInRole.users).each(function(index, element) {
	            role.addRow(index, element.userId,element.accountName, element.userName,element.deptmentId,element.deptmentName);
	        });
	    },
	    
	    /**
	     * 显示已选用户
	     */
	    addRow:function(index, userId, accountName, userName, deptmentId, deptmentName){
			var html = [];
			html.push("<tr class=\"tr-checkbox\">");
			html.push("<td class=\"width10\" index=\"{0}\"><input type=\"text\" id=\"deptmentId\" name=\"deptmentId\" style=\"display:none;\" value=\"{1}\"><div class=\"checkbox-con\"><input type=\"checkbox\" name=\"checNormal-right\" value=\"{2}\" class=\"checNormal\"></div></td>");
			html.push("<td name=\"accountName\">{3}</td>");
			html.push("<td name=\"userName\">{4}</td>");
			html.push("<td name=\"organizationName\">{5}</td>");
			html.push("</tr>");
			var template = html.join('');
			var param = [ index, deptmentId, userId, accountName, userName, deptmentName]
			var result = utils._formatStr(template, param);// 格式化
			$("#tbodyContenAdding").append(result);
	    },
	    
	    /**
	     * 删除行内容
	     * 
	     * @param obj 集合中的对象
	     */
	    delRowContent:function(obj) {
			$(usersInRole.users).each(function(index, element) {
				$.each(obj, function(name, value) {
					if (name == "userId" && value == element.userId) {
						usersInRole.users.splice(index, 1);
					}
				});
			});
	    },
	    
	    /**
		 * 获取已选用户集合
		 * 
		 * @returns 返回已选用户集合
		 */
	    getUsersInRole:function(){
	    	return usersInRole;
	    },
	    
	    /**
	     * 授权 全选
	     */
		selectAllRoleMenu : function() {
			var treeObj = $.fn.zTree.getZTreeObj("treeRoleMenu");
			treeObj.checkAllNodes(true);
			var flag = roleMenuPermissionFlagEnum.ADD.value;// 1增加
			role.setAllRoleMenu(flag);
		},
	    
	    /**
		 * 授权 清空
		 */
		clearAllRoleMenu : function() {
			var treeObj = $.fn.zTree.getZTreeObj("treeRoleMenu");
			treeObj.checkAllNodes(false);
			var flag = roleMenuPermissionFlagEnum.DELETE.value; // 2 删除
			role.setAllRoleMenu(flag);
		},
	    
		/**
		 * 设置全选或清除数据
		 * 
		 * @param flag 标志
		 */
		setAllRoleMenu : function(flag){
			if (roleMenuPermissionList.menuList){
				var tempMenuList = roleMenuPermissionList.menuList;
				$(tempMenuList).each(function(index, element) {
					var menuList = {};				
					menuList.menuId = element.menuId; // 菜单Id
					menuList.flag = flag;
					role.arrageRoleMenuPermissionList(menuList);	
				});
			}				
		},
		
	    /**
		 * 获取勾选角色菜单集合（保留）
		 * 
		 * @returns 返回勾选角色菜单集合
		 */
		getRoleMenuList : function() {
			var roleMenuList = {
				roleId : 0, // 角色Id
				menuList : [ {
					menuId : 0, // 树节点编码
					flag : roleMenuPermissionFlagEnum.CONSTANT.value, // 0 不变
				} ]
			};
			roleMenuList.menuList.length = 0; // 长度初始化为0

			roleMenuList.roleId = $("#roleId").val(); // 角色Id
			var treeObj = $.fn.zTree.getZTreeObj("treeRoleMenu");
			var nodes = treeObj.getCheckedNodes(true);
			for (var i = 0; i < nodes.length; i++) {
				var menuList = {};
				menuList.menuId = nodes[i].id; // 菜单Id
				menuList.flag = roleMenuPermissionFlagEnum.ADD.value, // 0 不变;// 增加
				roleMenuList.menuList.push(menuList);
			}
			return roleMenuList;
		},	   

		/**
		 * ztree点击事件		 	 
		*/
		zTreeOnClick :function(event, treeId, treeNode) {
			roleMenuPermissionList.roleId = $("#roleId").val(); // 角色Id	
			role.setMenuPermissionInfo(treeNode);// 保存当前节点及子节点
			if (treeNode.getParentNode()){
				role.setFatherMenuPermissionInfo(treeNode);// 保存父节点				
			}
		},

		/**
		 * 保存当前节点及子节点
		 * 
		 * @param treeNode 节点
		 */
		setMenuPermissionInfo :function(treeNode){	
			var flag = roleMenuPermissionFlagEnum.DELETE.value; // 2 删除
			if (treeNode.checked){// 选中
				flag = roleMenuPermissionFlagEnum.ADD.value;// 1增加
			}
			if (role.judgeIsFather(treeNode)){// 是父节点	
				var menuList = {};				
				menuList.menuId = treeNode.id; // 菜单Id
				menuList.flag = flag;		
				role.arrageRoleMenuPermissionList(menuList);				
				for(var i = 0;i< treeNode.children.length ;i++){
					role.setMenuPermissionInfo(treeNode.children[i]);
				}		
			}else{
				var menuList = {};				
				menuList.menuId = treeNode.id; // 菜单Id
				menuList.flag = flag;		
				role.arrageRoleMenuPermissionList(menuList);
			}
		},
		
		/**
		 * 判断是不是父节点，并且父节点是否有值  
		 * 
		 * @param treeNode 节点
		 * return [bool]
		 */
		judgeIsFather :function(treeNode){  
		    if(!treeNode.isParent){  
		        return false;  
		    }  
		    if(treeNode.children==null||treeNode.children.length<1){  
		        return false;  
		    }  
		    return true;  
		},
		
		/**
		 * 设置父节点菜单信息
		 * 
		 * @param treeNode 父节点
		 */
		setFatherMenuPermissionInfo :function(treeNode){ 
		    if(treeNode.getParentNode()){ 	    	 
				var flag = roleMenuPermissionFlagEnum.DELETE.value;// 删除
				if (role.judgeFatherChecked(treeNode.getParentNode())){// 父节点下子节点是否选中
					flag = roleMenuPermissionFlagEnum.ADD.value;// 增加
				}	
				var menuList = {};				
				menuList.menuId = treeNode.getParentNode().id; // 菜单Id
				menuList.flag = flag;		
				role.arrageRoleMenuPermissionList(menuList);	
				role.setFatherMenuPermissionInfo(treeNode.getParentNode());// 递归
		    }
		} ,
		
		/**
		 * 父节点下子节点是否选中
		 * 
		 * @param treeNode 父节点
		 * @returns {Boolean}
		 */
		judgeFatherChecked :function(treeNode){  
		    if (role.judgeIsFather(treeNode)){
		    	// 节点是父节点且选中
		    	if (treeNode.checked){
			    	return true;		    		
		    	}
			    for(var i = 0;i< treeNode.children.length;i++){
					role.judgeFatherChecked(treeNode.children[i]);
			    }		    	
		    }
		    else{
		    	if (treeNode.checked){
			    	return true;		    		
		    	}
		    }			
		},
		
		/**
		 * 返回过滤的菜单
		 * 
		 * @param menuList 当前需要改变的
		 */
		arrageRoleMenuPermissionList : function(menuList){
			if (roleMenuPermissionList.menuList){				
				$(roleMenuPermissionList.menuList).each(function(index, element) {
					$.each(menuList, function(name, value) {
						if (name == "menuId" && value == element.menuId) {
							roleMenuPermissionList.menuList.splice(index, 1);
						}
					});
				});
				roleMenuPermissionList.menuList.push(menuList);
			}
		},
		
		/**
		 * 获取需要增删改的菜单权限list
		 */
		getLastList : function(){
			return roleMenuPermissionList;
		},
	}
	module.exports = role;
	window.role = role;
});
