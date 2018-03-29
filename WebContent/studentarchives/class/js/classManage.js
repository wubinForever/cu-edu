/**
 * 班级信息
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("basePath/config/url.udf");
	var URL_DATA = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var CONSTANT = require("basePath/config/data.constant");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var select = require("basePath/module/select");//模糊搜索
	var simpleSelect = require("basePath/module/select.simple");//公用下拉框
	var treeSelect = require("basePath/module/select.tree");//公用下拉树
	var isEnabled = require("basePath/enumeration/common/IsEnabled");//状态枚举
	var archievesStatus = require("basePath/enumeration/studentarchives/ArchievesStatus");//学籍状态枚举
	var base  =config.base;
	var importUtils = require("basePath/utils/importUtils");
	/**
	 * 班级信息
	 */
	var classManage = {
		// 初始化
		init : function() {
			//年级
			simpleSelect.loadSelect("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST, null, { firstText: CONSTANT.SELECT_ALL, firstValue: -1 });
			//院系
			simpleSelect.loadSelect("departmentId", URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			//专业
			simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,null,{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			
			//院系联动专业\固定教室
			$("#departmentId").on("change keyup",function(){
				classManage.gradeAndDepartmentChange(CONSTANT.SELECT_ALL);
			});	
			//年级联动专业
			$("#grade").on("change keyup",function(){
				classManage.gradeAndDepartmentChange(CONSTANT.SELECT_ALL);
			});	
			//班级状态
			simpleSelect.loadEnumSelect("isEnabled",isEnabled,{defaultValue:-1,firstText:CONSTANT.SELECT_ALL,firstValue:-1});
			// 新增
			$(document).on("click", "button[name='add']", function() {
				classManage.add();
			});
			// 修改
			$(document).on("click", "button[name='edit']", function() {
				classManage.edit(this);
			});
			// 删除
			$(document).on("click", "button[name='delete']", function() {
				classManage.deleted(this);
			});
			// 批量删除
			$("button[name='batchDelete']").bind("click", function() {
				classManage.batchDeleted();
			});
           // 学生名单
			$(document).on("click", "button[name='studentList']", function() {
				classManage.studentlist(this);
			});
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
			
			// 分页
			classManage.pagination = new pagination({
				url : URL_STUDENTARCHIVES.CLASS_GET_PAGEDLIST
			}, function(data) {
				if (data.length>0) {
					$("#tbodycontent").empty().append(
							$("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
					$("#pagination").show();
				} else {
					$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>")
							.addClass("no-data-html");
					$("#pagination").hide();
				}
				//取消全选
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");
			}).init();
			// 查询
			$("#query").on("click", function() {
				var param=utils.getQueryParamsByFormId("queryForm");
				param.ClassNo=$("#className").val();
				classManage.pagination.setParam(param);
			});
			//导出
			$(document).on("click", "button[name='export']", function() {
				ajaxData.exportFile(URL_STUDENTARCHIVES.CLASS_EXPORT, classManage.pagination.option.param);
			});
			// 导入
			$(document).on("click", "button[name='import']", function() {
				new importUtils({
					title : "导入班级",
					uploadUrl : URL_STUDENTARCHIVES.CLASS_IMPORTFILE,
					exportFailUrl : URL_STUDENTARCHIVES.CLASS_EXPORT_FAILMESSATE,
					templateUrl : URL_STUDENTARCHIVES.CLASS_EXPORTTEMPLATE,
					data:[{name:"班号",field:"classNo"},{name:"班级名称",field:"className"},{name:"导入失败原因",field:"message"}],
					dispalyImportWay:false,
					successCallback:function(){
						// 刷新列表
						var param=utils.getQueryParamsByFormId("queryForm");
						param.ClassNo=$("#className").val();
						classManage.pagination.setParam(param);
					}
				}).init();
			});
		},
		addInit:function(){
			classManage.loadData();
			classManage.initUser();
			classManage.validate();
		},
		updateInit:function(){
			classManage.loadData();
			var classId=classManage.getUrlParam("classId");
			ajaxData.request(URL_STUDENTARCHIVES.CLASS_GET_ITEM, {"classId":classId}, function(data) {
				var classModel = data.data;
				if(classModel!=null){
					utils.setForm($("#addWorkForm"),classModel);
					classManage.gradeAndDepartmentChange(CONSTANT.PLEASE_SELECT, classModel.majorId);
					classManage.initVenue(classModel.venueId);
					classManage.initUser(classModel.userId);
					$("#remark").val(classModel.remark);					
				}
				
				new limit($("#remark"), $("#remarkCount"), 1000);
				classManage.validate();
			});
		},
		loadData:function(){
			//年级
			simpleSelect.loadSelect("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST,null,{ firstText: CONSTANT.PLEASE_SELECT, firstValue: "", async: false });
			//所在校区
			simpleSelect.loadSelect('campusId',URL_DATA.CAMPUS_GETALL,{isAuthority : false},{ firstText: CONSTANT.PLEASE_SELECT, firstValue: "", async: false });
			//院系
			simpleSelect.loadSelect("departmentId", URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1",isAuthority:true},{ firstText: CONSTANT.PLEASE_SELECT, firstValue: "", async: false });
			//固定教室
			classManage.initVenueSelect([]);
			
			//院系联动专业
			$("#departmentId").on("change keyup",function(){
				classManage.gradeAndDepartmentChange(CONSTANT.PLEASE_SELECT);
			});	
			//校区联动固定教室
			$("#campusId").on("change keyup",function(){
				classManage.initVenue();
			});	
			//年级联动专业
			$("#grade").on("change keyup",function(){
				classManage.gradeAndDepartmentChange(CONSTANT.PLEASE_SELECT);
			});	
			
		},
		/**
		 * 场地下拉框数据初始化
		 */
		initVenue : function(defaultValue) {
			var me = this;
			var venueDom = [];
			var campusId = $("#campusId").val();
			if (!campusId) {
				me.initVenueSelect([]);
				return;
			}
			var param={};
			
			param.campusId = campusId;
			param.isEnabled = isEnabled.Enable.value;
			
			ajaxData.request(URL_DATA.VENUE_GETLISTBYQUERY, param, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					
					$.each(data.data, function(i, item) {
						var option = {
							value : item.venueId,
							name : item.venueName
						};
						venueDom.push(option);
					});
					me.initVenueSelect(venueDom, defaultValue);
				}
			});
		},
		initVenueSelect : function(data, defaultValue){
			if(this.venueSelect){
				this.venueSelect.reload(data, defaultValue);
				return ;
			}
			this.venueSelect = new select({
				dom : $("#venueSelect"),
				defaultValue : defaultValue,
				loadData : function() {
					return data;
				},
				onclick :function(code){
					if (code === "") {
						$("#venueId").val("");
						return false;
					}
					$("#venueId").val(code); 
				}
			}).init();
		},
		/**
		 * 教师下拉框数据初始化
		 */
		initUser : function(defaultValue) {
			var me = this;
			
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL_DATA.TEACHER_GETALLLIST, null, function(data) {
				if (data.code == config.RSP_SUCCESS) {
					var userDom = [];
					$.each(data.data, function(i, item) {
						var option = {
							value : item.userId,
							name : "["+item.teacherNo+"]"+item.teacherName
						};
						userDom.push(option);
					});
					me.initUserSelect(userDom, defaultValue);
				}
			});
		},
		initUserSelect : function(data, defaultValue){
			if(this.userSelect){
				this.userSelect.reload(data, defaultValue);
				return ;
			}
			this.userSelect = new select({
				dom : $("#userSelect"),
				defaultValue : defaultValue,
				loadData : function() {
					return data
				},
				onclick :function(code){
					if (code === "") {
						$("#userId").val("");
						return false;
					}
					$("#userId").val(code); 
				}
			}).init();
		},
		/**
		 * 年级、院系联动专业
		 * @returns {Boolean}
		 */
		gradeAndDepartmentChange:function(textName, defaultValue){
			var departmentId=$("#departmentId").val();
			var grade=$("#grade").val();
			var reqData={};
			reqData.departmentId =departmentId;
			reqData.grade= grade;
			if(grade==''&&departmentId==''){
	    	   $("#majorId").html("<option value=''>"+textName+"</option>");
	    	   return false;
			}
			simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,reqData,{ firstText: textName, firstValue: "", defaultValue: defaultValue });
		},
		/**
		 * 新增 弹窗
		 */
		add: function(){
			popup.open('./studentarchives/class/html/add.html', // 这里是页面的路径地址
				{
					id : 'add',// 唯一标识
					title : '新增班级信息',// 这是标题
					width : 820,// 这是弹窗宽度。其实可以不写
					height : 560,// 弹窗高度
					okVal : '保存',
					cancelVal : '关闭',
					ok : function() {
						// 确定逻辑
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						var v = iframe.$("#addWorkForm").valid();// 验证表单
						if (v) {
							var reqData=utils.getQueryParamsByFormObject(iframe.$("#addWorkForm"));
								var rvData = null;// 定义返回对象
								// post请求提交数据
								ajaxData.contructor(false);// 同步
								ajaxData.request(URL_STUDENTARCHIVES.CLASS_ADD, reqData,
									function(data) {
										rvData = data;
									});
								if (rvData == null)
									return false;
								if (rvData.code == config.RSP_SUCCESS) {
									// 提示成功
									popup.okPop("新增成功", function() {});
									classManage.pagination.loadData();
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
							focus: true,//按钮高亮
							callback: function () {
								// 确定逻辑
								var iframe = this.iframe.contentWindow;// 弹窗窗体
								var v = iframe.$("#addWorkForm").valid();// 验证表单
								if (v) {
									var reqData=utils.getQueryParamsByFormObject(iframe.$("#addWorkForm"));
										var rvData = null;// 定义返回对象
										// post请求提交数据
										ajaxData.contructor(false);// 同步
										ajaxData.request(URL_STUDENTARCHIVES.CLASS_ADD, reqData,
											function(data) {
												rvData = data;
											});
										if (rvData == null)
											return false;
										if (rvData.code == config.RSP_SUCCESS) {
											// 提示成功
											popup.okPop("新增成功", function() {});
											// 清空数据
											iframe.$("#classNo").val("");
											iframe.$("#className").val("");
											iframe.$("#presetNumber").val("1");
											iframe.$("#venueId").val("");
											iframe.classManage.venueSelect.clearValue();
											iframe.classManage.userSelect.clearValue();
											iframe.$("#userId").val("");
											iframe.$("input:radio[name='isEnabled']:checked").parent().parent().removeClass("on-radio");
											iframe.$("input:radio[name='isEnabled'][value='1']").prop("checked","checked");
											iframe.$("input:radio[name='isEnabled'][value='1']").parent().parent().addClass("on-radio");
											iframe.$("#remark").val("");
											iframe.$("#remarkCount").text("0/1000");
											
											classManage.pagination.loadData();
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
							},
						}
					]
				});
		},
		/**
		 * 修改 弹窗
		 */
		edit: function(obj){
			var classId = $(obj).attr("data-tt-id");
			popup.open('./studentarchives/class/html/edit.html?classId='+classId, // 这里是页面的路径地址
				{
					id : 'editClass',// 唯一标识
					title : '修改班级信息',// 这是标题
					width : 820,// 这是弹窗宽度。其实可以不写
					height : 560,// 弹窗高度
					okVal : '保存',
					cancelVal : '关闭',
					ok : function() {
					
						// 确定逻辑
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						
						var v = iframe.$("#addWorkForm").valid();// 验证表单
						if (v) {
							var reqData=utils.getQueryParamsByFormObject(iframe.$("#addWorkForm"));
								var rvData = null;// 定义返回对象
								// post请求提交数据
								ajaxData.contructor(false);// 同步
								ajaxData.request(URL_STUDENTARCHIVES.CLASS_UPDATE, reqData,
									function(data) {
										rvData = data;
									});
								if (rvData == null)
									return false;
								if (rvData.code == config.RSP_SUCCESS) {
									// 提示成功
									popup.okPop("修改成功", function() {});
									classManage.pagination.loadData();
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
		studentListInit:function(){
			var classId=classManage.getUrlParam("classId");
			ajaxData.contructor(false);
			// 实现ajax请求数据
			ajaxData.request(URL_STUDENTARCHIVES.STUDENT_GETLISTBYCONDITION, {classId:classId,archievesStatusCode:archievesStatus.HAVEARCHIEVES.value}, function(data) {

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
		/**
		 * 学生名单 弹窗
		 */
		studentlist: function(obj){
			var classId = $(obj).attr("data-tt-id");
			var className = $(obj).attr("className");
			popup.open('./studentarchives/class/html/studentList.html?classId='+classId, // 这里是页面的路径地址
				{
					id : 'studentList',// 唯一标识
					title : className + "学生名单",// 这是标题
					width : 900,// 这是弹窗宽度。其实可以不写
					height : 600,// 弹窗高度
				});
		},
		/**
		 * 删除班级
		 * @param obj
		 */
		deleted: function(obj){
			var id=$(obj).attr("data-tt-id");
			var ids=[];
			ids.push(id);
			classManage.doDelete(ids);
		},
		/**
		 * 批量删除班级
		 * @returns {Boolean}
		 */
		batchDeleted:function(){
			var ids=[];
			$("input[name='checNormal']:checked").each(function() {
				ids.push($(this).attr("classId"));
			});
			if (ids.length == 0) {
				popup.warPop("请勾选要删除的班级");
				return false;
			}
			classManage.doDelete(ids);
		},
		/**
		 * 执行删除操作
		 */
		doDelete : function(arrayId) {
			// 参数
			var param = {
				ids : arrayId
			};
			popup.askPop("确认删除所选项吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_STUDENTARCHIVES.CLASS_DELETE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("删除成功", function() { });
					// 刷新列表
					classManage.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
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
		/**
		 * 验证
		 */
		validate : function() {
			$("#addWorkForm").validate({
				rules : {
					grade : {
						required : true
					},
					campusId : {
						required : true
					},
					departmentId : {
						required : true
					},
					majorId : {
						required : true
					},
					classNo : {
						required : true
					},
					className : {
						required : true
					},
				},
				messages : {
					grade : {
						required : "年级不能为空"
					},
					campusId : {
						required : "所在校区不能为空" 
					},
					departmentId : {
						required :  "所属院系不能为空"
					},
					majorId : {
						required :  "所属专业不能为空"
					},
					classNo : {
						required :  "班号不能为空"
					},
					className : {
						required :  "班级名称不能为空"
					},
				}
			});
		},
	}
	module.exports = classManage;
	window.classManage = classManage;
});
