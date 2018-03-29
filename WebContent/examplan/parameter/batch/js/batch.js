/**
 * 考试批次设置
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	
	//下拉框
	var select = require("basePath/module/select");
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");
	
	var URL = require("basePath/config/url.udf");
	var URL_EXAMPLAN = require("basePath/config/url.examplan");
	var page = require("basePath/utils/page");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var ve = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common");
	var dictionary = require("basePath/config/data.dictionary");
	var base = config.base;
	

	// 路径
	var addUrl = base + "/examplan/parameter/batch/html/add.html"; // "../html/add.html";//
														// 框架下
	// ./当前目录
	// /根目录
	var updateUrl = base + "/examplan/parameter/batch/html/edit.html"; // "../html/edit.html";//
	/**
	 * 考试批次设置
	 */
	var batch = {
		// 初始化
		init : function() {
			//绑定学年学期下拉改变事件
			batch.bindSchoolCalendarChange();
			//初始化学年学期下拉
			var semesterSelect = simpleSelect.loadSemester("schoolCalendarId");
			var semesterId=semesterSelect.getValue();
			// 1.0 获取列表
			batch.infoQuery(0,100);
			// 2.0 新增
			$("button[name='addBatch']").bind("click", function() {
				batch.popAddHtml();
			});
			// 3.0 修改
			$(document).on("click", "button[name='updateBatch']", function() {
				batch.popUpdateHtml(this);
			});
			// 4.0 删除
			$(document).on("click", "button[name='deleteBatch']", function() {
				batch.deleteBatch(this);
			});
			// 7.0 权限脚本
			authority.init();
			
		},

		/** ******************* 1.0 获取列表 ******************* */
		/**
		 * 1.1查询函数
		 */
		infoQuery : function(pageIndex, pageSize) {
			var reqData = {
				schoolCalendarId :$("#schoolCalendarId").val(),
				pageIndex : pageIndex,
				pageSize : pageSize
			};
			batch.commonAjax(reqData, URL_EXAMPLAN.BATCH_GETPAGEDLIST, pageSize);
		},
		/**
		 * 1.2获取列表
		 * 
		 * @param reqdata
		 *            查询条件
		 * @param url
		 *            控制器路径
		 * @param pageNum
		 *            页码
		 */
		commonAjax : function(reqdata, url, pageNum) {
			var _ = this;
			ajaxData.contructor(false);// 同步
			ajaxData.request(url, reqdata, function(data) {
				$("#tbodycontent").html("");
				$("#tbodycontent").removeClass("no-data-html");
				$("#pagination").show();
				if (data.code == config.RSP_SUCCESS) {
					$("#bodyContentImpl").tmpl(data.data.list).appendTo(
							'#tbodycontent');
					page.commonPagination(data.data.page, data.data.pageIndex,
							batch.infoCallBack, data.data.totalRows);
					$("select[name='page_size']").val(pageNum);
					common.checkDisable();
				} else {
					$("#tbodycontent")
							.append("<tr><td colspan='11'></td></tr>")
							.addClass("no-data-html");
					$("#pagination").hide();
				}
			});
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
				pagesize = 10;
			}
			if (pageIndex > -1) {
				var reqdata = {
					pageIndex : pageIndex,
					pageSize : pagesize
				};
				batch.commonAjax(reqdata, URL_EXAMPLAN.BATCH_GETPAGEDLIST,
						pagesize);
			}
		},

		/**
		 * 考试性质下拉框数据初始化
		 */
		getExamPropertyTypeList : function() {
			var reqData=utils.getQueryParamsByFormId("queryForm");//获取查询参数
			reqData["parentId"]="e057f912d6d6454db7f04207bbd9c50f";
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL.DICTIONARY_GETLISTBYPARENTID, reqData,
				function(data) {
					$("#examPropertyTypeSelectTmpl").tmpl(data.data).appendTo(
							'#examPropertyCode');
				});
		},
		
		//学年学年下拉改变事件
		bindSchoolCalendarChange : function() {
			$(document).on("change", "#schoolCalendarId",function(){
				var schoolCalendarId = $.trim($(this).val());
				batch.infoQuery(0,100);
			 });
		},
		
		/** ******************* 2.0 新增开始 ******************* */
		/**
		 * 2.1 弹出新增页面
		 */
		popAddHtml : function() {
			art.dialog.open(addUrl, {
				id : 'addHmtl',
				title : '考试批次新增',
				width : 640,
				height : 350,
				okVal : '保存',
				cancelVal : '取消',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow; // 弹窗窗体
					var v = iframe.$("#addWorkForm").valid(); // 验证表单
					// 表单验证通过
					if (v) {
						var reqData = batch.addParam(iframe); // 绑定新增数据
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);// 同步
						ajaxData.request(URL_EXAMPLAN.BATCH_ADD, reqData,
								function(data) {
									rvData = data;
								});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop(rvData.msg, function() {
							});
							// 刷新列表
							batch.infoQuery(0,100);
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
		 * 2.2 页面初始化，绑定事件，新增初始化
		 */
		initAdd : function() {
			//初始化学年学期下拉
			var semesterSelect = simpleSelect.loadSemester("schoolCalendarId");
			var semesterId=semesterSelect.getValue();
			// 加载考试性质类型
			batch.getExamPropertyTypeList();
			// 验证
			batch.validateFormData();
			// 批次名称唯一性校验
			batch.addNameRepeatVerify();
			
			// 角色名称重复验证
			$(document).on("change", "#batchName",function(){
				var schoolCalendarId = $.trim($("#schoolCalendarId").val());
				var batchName = $.trim($(this).val());
				if (utils.isNotEmpty(batchName)){
					var param = {schoolCalendarId : schoolCalendarId, batchName : batchName};
					ajaxData.contructor(false);
					ajaxData.request(URL_EXAMPLAN.BATCH_VALIDATIONBATCHNAME,param,function(data){
						// 返回内容
						if (data.code == config.RSP_SUCCESS){
							if(utils.isNotEmpty(data.data.warningMessage) && data.data.warningFlag == 'batchName'){
								$("#batchName").rules("add",{
									"batchNameRepeatVerify":true,
									messages: {  
										"batchNameRepeatVerify":data.data.warningMessage
									}
								});								
							}else{
								$("#batchName").rules("remove","batchNameRepeatVerify");
							}
						}
					});		
				}		  
			 });
			 
			 //弹框 校历选择
			 $("button[name='startDate']").bind("click", function() {
				batch.popDateHtml();
			});
		},
		
		/**
		 * 2.1 弹出 校历选择
		 */
		popDateHtml : function() {
			art.dialog.open(base + "/examplan/parameter/batch/html/startDate.html" , {
				id : 'startDate',
				title : '教学周',
				width : 800,
				height : 500,
				okVal : '确定',
				cancelVal : '取消',
				ok : function() {
				},
				cancel : function() {
					// 取消逻辑
				}
			});
		},

		/**
		 * 2.3 新增保存时，组装表单参数
		 * 
		 * @param iframe
		 *            弹框窗口
		 */
		addParam : function(iframe) {
			var batchId = $.trim(iframe.$("#batchId").val());
			var schoolCalendarId = $.trim(iframe.$("#schoolCalendarId").val());
			var batchName = $.trim(iframe.$("#batchName").val());
			var examPropertyCode = $.trim(iframe.$("#examPropertyCode").val());
			var startDate = $.trim(iframe.$("#startDate").val());
			var endDate = $.trim(iframe.$("#endDate").val());
			
			var reqData = {
				"batchId" : batchId,
				"schoolCalendarId" : schoolCalendarId,
				"batchName" : batchName,
				"examPropertyCode" : examPropertyCode,
				"startDate" : startDate,
				"endDate" : endDate
			};
			return reqData;
		},
		/** ******************* 3.0 修改开始 ******************* */
		/**
		 * 3.1 弹出修改页面
		 */
		popUpdateHtml : function(obj) {
			var batchId = $(obj).attr("data-tt-id");
			
			art.dialog.open(updateUrl + '?batchId=' + batchId, // 这里是页面的路径地址
			{
				id : 'updateHtml',// 唯一标识
				title : '考试批次修改',// 这是标题
				width : 540,// 这是弹窗宽度。其实可以不写
				height : 350,// 弹窗高度
				okVal : '保存',
				cancelVal : '取消',
				ok : function() {
					// 确定逻辑
					var iframe = this.iframe.contentWindow;// 弹窗窗体
					var v = iframe.$("#addWorkForm").valid();// 验证表单
					if (v) {
						// 表单验证通过
						var reqData = batch.addParam(iframe); // 绑定修改数据
						var rvData = null;// 定义返回对象
						// post请求提交数据
						ajaxData.contructor(false);
						ajaxData.request(URL_EXAMPLAN.BATCH_UPDATE, reqData,
								function(data) {
									rvData = data;
								});
						if (rvData == null)
							return false;
						if (rvData.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop(rvData.msg, function() {
							});
							// 刷新列表
							batch.infoQuery(0,100);
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
		deleteBatch : function(obj) {
			var id = $(obj).attr("data-tt-id");
			var param = {
					id : id
				};
			popup.askPop("确认删除所选考试批次吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_EXAMPLAN.BATCH_DELETE, param,
						function(data) {
							rvData = data;
						});
				if (rvData == null)
					return false;
				if (rvData.code == 0) {
					// 提示成功
					popup.okPop(rvData.msg, function() {
					});
					// 刷新列表
					batch.infoQuery(0,100);
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});

		},
		
		/**
		 * 3.2 修改页面初始化，绑定事件，更新初始化
		 */
		initUpdate : function() {
			//初始化学年学期下拉
			var semesterSelect = simpleSelect.loadSemester("schoolCalendarId");
			var semesterId=semesterSelect.getValue();
			// 加载考试性质类型
			batch.getExamPropertyTypeList();
			// 验证
			batch.validateFormData();
			// 显示数据
			batch.showData();
			// 批次名称唯一性校验
			batch.addNameRepeatVerify();
			
			// 角色名称重复验证
			$(document).on("change", "#batchName",function(){
				var batchId = $.trim($("#batchId").val());
				var schoolCalendarId = $.trim($("#schoolCalendarId").val());
				var batchName = $.trim($(this).val());
				if (utils.isNotEmpty(batchName)){
						var param = {
							batchId : batchId , 
							schoolCalendarId : schoolCalendarId, 
							batchName : batchName
						};
						ajaxData.contructor(false);
						ajaxData.request(URL_EXAMPLAN.BATCH_VALIDATIONBATCHNAME,param,function(data){
						// 返回内容
						if (data.code == config.RSP_SUCCESS){
							if(utils.isNotEmpty(data.data.warningMessage) && data.data.warningFlag == 'batchName'){
								$("#batchName").rules("add",{
									"batchNameRepeatVerify":true,
									messages: {  
										"batchNameRepeatVerify":data.data.warningMessage
									}
								});								
							}else{
								$("#batchName").rules("remove","batchNameRepeatVerify");
							}
						}
					});		
				}		  
			 });
		},

		/**
		 * 绑定验证事件
		 */
		validateFormData:function(){
			// 验证
			$("#addWorkForm").validate({
				rules: {
					schoolCalendarId:{
						"required" : true
					},
					batchName:{
						"required" : true,
						maxlength: 50
					},
					examPropertyCode:{
						"required" : true
					},
					startDate:{
						"required" : true
					},
					endDate:{
						"required" : true
					}
				},
				messages: 
				{
					schoolCalendarId:{
						"required" : '学年学期不能为空'
					},
					batchName:{
						"required" : '批次名称不能为空',
						maxlength: '不超过50个字符'
					},
					examPropertyCode:{
						"required" : '考试性质不能为空'
					},
					startDate:{
						"required" : '起始日期不能为空'
					},
					endDate:{
						"required" : '结束日期不能为空'
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
		 * 添加验证重复
		 */
		addNameRepeatVerify : function() {
			jQuery.validator.addMethod("batchNameRepeatVerify", function(value,
					element) {
				return false;
			}, "批次名称不能重复");
		},
		
		/**
		 * 3.3 修改保存时，组装表单参数
		 * 
		 * @param iframe
		 *            弹框窗口
		 */
		updateParam : function(iframe) {
			return batch.addParam(iframe);
		},
		/**
		 * 3.4 显示修改页面数据
		 */
		showData : function() {
			// 获取url参数
			var batchId = utils.getUrlParam('batchId');
			var rvData = null;// 定义返回对象
			// post请求提交数据
			var param = {
				"batchId" : batchId
			};// 新增一条数据
			ajaxData.contructor(false);
			ajaxData.request(URL_EXAMPLAN.BATCH_GETITEM, param, function(data) {
				rvData = data.data;
			});
			if (rvData != null) {
				$("#batchId").val(rvData.batchId);
				$("#schoolCalendarId").val(rvData.schoolCalendarId);
				$("#batchName").val(rvData.batchName);
				$("#examPropertyCode").val(rvData.examPropertyCode);
				$("#startDate").val(rvData.startDate);
				$("#endDate").val(rvData.endDate);
			}
		}
	/** ********************* end ******************************* */
	}
	module.exports = batch;
	window.batch = batch;
});