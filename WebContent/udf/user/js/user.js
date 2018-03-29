/**
 * 用户管理
 */
define(function (require, exports, module) {
	
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("configPath/url.udf");
	var URL_DATA = require("configPath/url.data");
	//var page = require("basePath/utils/page");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var helper = require("basePath/utils/tmpl.helper");
	var treeSelect = require("basePath/module/select.tree");//公用下拉树
	var base  =config.base;
	var user = {
		//查询条件
		queryObject:{},	
		init:function(){
			//所属单位
			var opt = {
					idTree : "administrativeUnitTree", // 树Id
					id : "deptmentId", // 下拉数据隐藏Id
					name : "deptment", // 下拉数据显示name值
					code : "", // 下拉数据隐藏code值（数据字典）
					url : URL_DATA.DEPARTMENT_ZTREE, // 下拉数据获取路径
					defaultValue : "" // 默认值（修改时显示值）
				};
			treeSelect.loadTree(opt);
			
			// 查看
			$(document).on("click", "[name='userViewPop']" , function() {
				user.popViewUserHtml(this);
			});
			// 数据权限
			$(document).on("click", "button[name='authoritySet']", function() {
				user.authoritySet(this);
			});
			
			//启用
			$("#start").on("click",function(){
				  var userIdArr = [];
				  var lenth = $("input[name='checNormal']:checked").length;
				  $("input[name='checNormal']:checked").each(function(){
					  userIdArr.push($(this).attr("userId"));
	       		     })
				  if(lenth>0){
					  user.start(userIdArr);
				  }else{
					  popup.warPop("至少勾选一项");
					  return false;
				  }
			});
			//禁用 
			$("#forbid").on("click",function(){
				 var userIdArr = [];
				  var lenth = $("input[name='checNormal']:checked").length;
				  $("input[name='checNormal']:checked").each(function(){
					  userIdArr.push($(this).attr("userId"));
	       		     })
				  if(lenth>0){
					  user.forbid(userIdArr);
				  }else{
					  popup.warPop("至少勾选一项");
					  return false;
				  }
			})
			//分页
			user.pagination = new pagination({
				id: "pagination", 
				url: URL.USER_QUERY, 
				param: user.queryObject 
			},function(data){
				 $("#pagination").show();
				 if(data && data.length != 0) {
					 $("#content").removeClass("no-data-html").empty().append($("#tableWrapper").tmpl(data, helper));
				 }else {
					$("#content").empty().append("<tr><td colspan='2'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				 }
				//取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();
			//查询按钮
			$("#query").on("click",function(){
				//保存查询条件
				user.pagination.setParam(utils.getQueryParamsByFormId("queryForm"));
			});
			
			//重置密码
			$("#resetPwd").on("click",function(){			
				var userIdArr = [];
				$("input[name='checNormal']:checked").each(function(){
					userIdArr.push($(this).attr("userId"));
			    })
			    if(userIdArr.length>0){
			    	user.popResetPassword(userIdArr);
			    }else{
			    	popup.warPop("请勾选需要重置密码的用户");
					return false;
				}
			});
		},
		//新增默认加载事件
		initAdd:function(){

		},
		/**
		 * 弹窗 数据权限
		 */
		authoritySet : function(obj) {
			var userId = $(obj).attr("userId");
			popup.open('./udf/user/html/authoritySet.html?userId='
					+ userId, // 这里是页面的路径地址
			{
				id : 'authoritySet',// 唯一标识
				title : '数据权限设置',// 这是标题
				width : 760,// 这是弹窗宽度。其实可以不写
				height : 410,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var campusIds = iframe.$("#campusIds").val();
					var departmentIds = iframe.$("#departmentIds").val();
					var commencementUnitIds = iframe.$("#commencementUnitIds")
							.val();
					var param = {
						userId : userId,
						campusIds : campusIds,
						departmentIds : departmentIds,
						commencementUnitIds : commencementUnitIds
					};
					var rvData = null;// 定义返回对象
					// post请求提交数据
					ajaxData.contructor(false);// 同步
					ajaxData.request(URL.USER_SET_DATAAUTHORITY, param,
							function(data) {
								rvData = data;
								if (rvData == null) {
									return false;
								}
								if (rvData.code == config.RSP_SUCCESS) {
									// 提示成功
									popup.okPop("保存成功", function() {
									});
								} else {
									// 提示失败
									popup.errPop(rvData.msg);
									return false;
								}
							});

				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		initAuthority : function() {
			// 校区选择
			$(document).on("click", "button[name='campusSelect']", function() {
				user.campusSelect(this);
			});
			// 院系选择
			$(document).on("click", "button[name='departmentSelect']",
					function() {
						user.departmentSelect(this);
					});
			// 开课单位
			$(document).on("click", "button[name='commencementUnitSelect']",
					function() {
						user.commencementUnitSelect(this);
					});
			var userId = utils.getUrlParam('userId');
			var param = {
				"userId" : userId
			};
			var authorityModel = null;
			ajaxData.contructor(false);
			ajaxData.request(URL.USER_GET_DATAAUTHORITY, param, function(data) {
				rvData = data;
				if (rvData == null) {
					return false;
				}
				if (rvData.code == config.RSP_SUCCESS) {
					campuauthorityModel = data.data;
					if (campuauthorityModel != null) {
						$("#campusIds").val(campuauthorityModel.campusIds);
						$("#campusNames").val(campuauthorityModel.campusNames);
						$("#departmentIds").val(
								campuauthorityModel.departmentIds);
						$("#departmentNames").val(
								campuauthorityModel.departmentNames);
						$("#commencementUnitIds").val(
								campuauthorityModel.commencementUnitIds);
						$("#commencementUnitNames").val(
								campuauthorityModel.commencementUnitNames);
					}
				}
			});
		},
		/**
		 * 弹窗 校区选择
		 */
		campusSelect : function(obj) {
			var campusIds= $(obj).prev().val();
			popup.open('./udf/user/html/campusSelect.html?campusIds='+campusIds, // 这里是页面的路径地址
			{
				id : 'campusSelect',// 唯一标识
				title : '校区选择',// 这是标题
				width : 900,// 这是弹窗宽度。其实可以不写
				height : 600,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var arrayCampusId = [];
					var arrayCampusName = [];
					iframe.$("input[name='checNormal']:checked").each(
							function() {
								arrayCampusId.push($(this).attr("campusId"));
								arrayCampusName
										.push($(this).attr("campusName"));
							});
					
					$("#campusNames").val(arrayCampusName);
					$("#campusIds").val(arrayCampusId);
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		/**
		 * 初始化校区
		 */
		initCampus : function() {
			var campusIds = utils.getUrlParam('campusIds');
			var param={
					"campusIds":campusIds
			}
			var campusModel = null;
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.CAMPUS_GET_ALL_AND_CHECKED, param, function(data) {
				rvData = data;
				campusModel = data.data;
				$("#tbodycontent").html("");
				$("#campusTableTmpl").tmpl(campusModel).appendTo(
						'#tbodycontent');
					var checkedCount = $('input[type=checkbox]:checked').length;
					if(checkedCount != 0 && checkedCount + 1 == $('input[type=checkbox]').length){
						//全选
						$('#check-all').attr("checked", true).parent().addClass("on-check");
					}
			});
		},
		/**
		 * 弹窗 院系选择
		 */
		departmentSelect : function(obj) {
			var departmentIds= $(obj).prev().val();
			popup.open('./udf/user/html/departmentSelect.html?departmentIds='+departmentIds, // 这里是页面的路径地址
			{
				id : 'departmentSelect',// 唯一标识
				title : '院系选择',// 这是标题
				width : 900,// 这是弹窗宽度。其实可以不写
				height : 600,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var arrayDepartmentId = [];
					var arrayDepartmentName = [];
					iframe.$("input[name='checNormal']:checked").each(
							function() {
								arrayDepartmentId.push($(this).attr(
										"departmentId"));
								arrayDepartmentName.push($(this).attr(
										"departmentName"));
							});
					
					$("#departmentNames").val(arrayDepartmentName);
					$("#departmentIds").val(arrayDepartmentId);
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		/**
		 * 初始化单位
		 */
		initDepartment : function() {
			var departmentModel = null;
			// 获取url参数
			var departmentIds = utils.getUrlParam('departmentIds');
			var isStartClass = utils.getUrlParam('isStartClass');
			var param = {
				"departmentIds":departmentIds
			};
			if(isStartClass){
				param["isStartClass"] = isStartClass;
			}
			ajaxData.contructor(false);
			ajaxData.request(URL_DATA.DEPARTMENT_GET_LIST_AND_CHECKED, param,
					function(data) {
						rvData = data;
						departmentModel = data.data;
						$("#tbodycontent").html("");
						$("#departmentTableTmpl").tmpl(departmentModel)
								.appendTo('#tbodycontent');
						var checkedCount = $('input[type=checkbox]:checked').length;
						if(checkedCount != 0 && checkedCount + 1 == $('input[type=checkbox]').length){
							//全选
							$('#check-all').attr("checked", true).parent().addClass("on-check");
						}
					});
		},
		/**
		 * 弹窗 开课单位选择
		 */
		commencementUnitSelect : function(obj) {
			var departmentIds= $(obj).prev().val();
			popup.open('./udf/user/html/departmentSelect.html?isStartClass=1&departmentIds='+departmentIds, // 这里是页面的路径地址
			{
				id : 'commencementUnitSelect',// 唯一标识
				title : '开课单位选择',// 这是标题
				width : 900,// 这是弹窗宽度。其实可以不写
				height : 600,// 弹窗高度
				okVal : '保存',
				cancelVal : '关闭',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var arrayCommencementUnitId = [];
					var arrayCommencementUnitName = [];
					iframe.$("input[name='checNormal']:checked").each(
							function() {
								arrayCommencementUnitId.push($(this).attr(
										"departmentId"));
								arrayCommencementUnitName.push($(this).attr(
										"departmentName"));
							});
					
					$("#commencementUnitNames").val(arrayCommencementUnitName);
					$("#commencementUnitIds").val(arrayCommencementUnitId);
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},

		/**
		 * 重置密码页面初始化
		 */
		initResetPassword : function() {
			
			// 校验
			ve.validateEx();
			$("#resetPasswordForm").validate({
				debug:true,
				rules : {
					customPassword : {
						"customPasswordRequired" : true,
						"customPasswordLength":true
					}			
				},
				messages : {
					customPassword : {
						"customPasswordRequired" : '指定密码不能为空',
						"customPasswordLength":'请输入长度在6 到30 之间的字符串'
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
			
			//默认密码复选框状态改变事件
			$("#defaultPassword").on("change",function(){ 
				if(this.checked)
				{
					 $('#customPassword').attr("disabled","disabled");
				}
				else
				{
					 $('#customPassword').removeAttr("disabled");
				}			
			});	
		},
		
		//查看详情初始化事件
		initView:function(){
			var userId =utils.getUrlParam('userId');
			var reqData ={userId:userId};
			user.getDetailByUserId(URL.USER_VIEW,reqData);			
		},		
		
		/**
		 *弹窗 查看 
		 * 
		 */
		popViewUserHtml : function(obj) {
			var userId=$(obj).attr("userId");
			popup.open('./udf/user/html/view.html?userId='+userId, // 这里是页面的路径地址
			{
				id : 'userView',
				title : "查看",
				width : 800,
				height : 520,
				cancelVal: '关闭',
			    cancel: true //为true等价于function(){}
			});
		},
		
		//根据用户ID获取用户详情
		getDetailByUserId:function(url,reqData){
			ajaxData.request(url,reqData,function(data){				
				$("#isEnabled").text(data.data.userDto.isEnabled==1?"启用":"禁用");
				$("#accountName").text(data.data.userDto.accountName);
				$("#userType").text(data.data.userDto.userType==1?"教职工":"学生");
				$("#userName").text(data.data.userDto.userName);
				$("#departmentName").text(data.data.departmentName || "");
				$("#roleList").html($("#roleListScript").tmpl(data.data.roleDtoList));				
			});
		},
		
		//启用
		  start:function(userIdArr){
			   var param={ userIdArr:userIdArr};
			   popup.askPop("是否启用？",function(){
					ajaxData.contructor(false);
				    ajaxData.request(URL.USER_START,param,function(data){
				    	if(data.code==0){
							popup.okPop("启用成功",function(){
							});
							user.pagination.loadData();
							 
						}
						else{
							popup.errPop("启用失败");
						}
					});
			   });
	     },
	
		/**
		 * 弹窗 重置密码
		 */
		popResetPassword : function(userIdArr) {
			popup.open('./udf/user/html/resetPassword.html', // 这里是页面的路径地址
			{
				id : 'userPassword',
				title : "重置密码",
				width : 500,
				height : 200,
				okVal : '保存',
				cancelVal : "关闭",
				ok : function(obj) {
					var v = obj.$("#resetPasswordForm").valid();// 验证表单
					if(v){
						var defaultPassword=obj.$("#defaultPassword").is(":checked");
	                    var customPassword=obj.$("#customPassword").val();
	                    var param={ defaultPassword:defaultPassword,customPassword:customPassword,userIdArr:userIdArr};
	                    ajaxData.contructor(false);
	 				    ajaxData.request(URL.USER_RESETPWD,param,function(data){
	 				    	if(data.code==0){	 				    		
	 				    		popup.okPop("密码重置成功",function(){
	 				    		});
	 						}
	 						else{
	 							popup.errPop("密码重置失败");
	 						}
	 					});
					}else{
						return false;
					}					
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},
		
	     //禁用
	     forbid:function(userIdArr){	 
			   var param={ userIdArr:userIdArr};
			   popup.askPop("是否禁用？",function(){
					ajaxData.contructor(false);
				    ajaxData.request(URL.USER_FORBID,param,function(data){
				    	if(data.code==0){
							popup.okPop("禁用成功",function(){
							});
							user.pagination.loadData();
						}
						else{
							popup.errPop("禁用失败");
						}
					});
			   });
	     },
	     
	     /**
		 * 弹窗 修改密码
		 */
	     popUpdatePasswordHtml : function(obj) {
	    	 
	    	var userId = $(obj).val();
	    	popup.open('./udf/user/html/editPassword.html', // 这里是页面的路径地址
			{
				id : 'updatePassword',
				title : "修改密码",
				width : 500,
				height : 250,
				okVal : '保存',
				cancelVal : "关闭",
				ok : function(obj) {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#updatePassword").valid();// 验证表单
					if(v){
	                    var param={ 
	                    	userId : userId,
	                    	oldPassword : iframe.$("#oldPassword").val(),
                    		newPassword : iframe.$("#newPassword").val(),
                			confirmPassword : iframe.$("#confirmPassword").val()
	                    };
	                    var rvData = null;// 定义返回对象
	    				// post请求提交数据
	    				ajaxData.contructor(false); // 同步
	 				    ajaxData.request(URL.USER_UPDATEPASSWORD,param,function(data){
	 				    	rvData = data;
	 					});
	 				   if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("密码修改成功", function(){});
						} else {
							// 提示失败
							popup.errPop(rvData.msg);
							return false;
						}
					}else{
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
		 * 绑定验证事件
		 */
	     initUpdatePassword : function() {
	    	// 校验
			ve.validateEx();
			// 验证
			$("#updatePassword").validate({
				rules : {
					oldPassword : {
						required : true,
						"customPasswordLength":true
					},
					newPassword : {
						required : true,
						"customPasswordLength":true
					},
					confirmPassword : {
						required : true,
						"customPasswordLength":true,
						equalTo : "#newPassword"
					}
				},
				messages : {
					oldPassword : {
						required : '原密码不能为空',
						"customPasswordLength":'请输入长度在6 到30 之间的字符串'
					},
					newPassword : {
						required : '新密码不能为空',
						"customPasswordLength":'请输入长度在6 到30 之间的字符串'
					},
					confirmPassword : {
						required : '确认密码不能为空',
						"customPasswordLength":'请输入长度在6 到30 之间的字符串',
						equalTo : "新密码与确认密码不一致"
					}
				},
				// 定义公用的错误提示内容，暂时保留
				errorPlacement : function(error, element) {
					$(element).parent("div.tips-text").append(error);
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
    module.exports = user;
	window.user = user;
});
