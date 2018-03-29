/**
 * 学籍档案
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var simpleSelect = require("basePath/module/select.simple");// 下拉选择
	var urlData = require("configPath/url.data");// 基础数据url
	var urlUdf = require("basePath/config/url.udf");// 基础框架url
	var urlStu = require("configPath/url.studentarchives");// 学籍url
	var url = require("configPath/url.studentservice");// 学生服务url
	var dataDictionary = require("configPath/data.dictionary");// 数据字典
	var dataConstant = require("configPath/data.constant");// 公用常量 
	var helper = require("basePath/utils/tmpl.helper");// 帮助，如时间格式化等
	var applyTypeEnum = require("basePath/enumeration/studentarchives/ApplyType");// 枚举，异动申请类型
	var isEnabledEnum = require("basePath/enumeration/common/IsEnabled");// 枚举，是否启用
	var treeSelect = require("basePath/module/select.tree");// 公用下拉树
	var base = config.base;	
	
	/**
	 * 学籍档案
	 */
	var studentArchives = {			
		
		/**
		 * 初始化学籍异动申请
		 */
		init : function() {
			// 申请异动
			$("#applyButton").on("click", function() {
				studentArchives.apply();
			});
			// 修改
			$("#tbodycontent").on("click", "button[name='edit']", function() {
				studentArchives.edit(this);
			});
			// 查看
			$("#tbodycontent").on("click", "button[name='view']", function() {
				studentArchives.view(this);
			});
			// 删除
			$("#tbodycontent").on("click", "button[name='del']", function() {
				studentArchives.del(this);
			});
			// 加载申请时间
			studentArchives.loadApplySetting();
			// 加载学籍异动申请数据
			studentArchives.loadList();
		},
		
		/**
		 * 初始化异动申请
		 */
		initAdd : function() {
			var reqData = popup.data("param");// 获取主页面穿日的参数

			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmester("academicYearSemester",
					urlData.COMMON_GETSEMESTERLIST,
					reqData.academicYearSemester);						
			$("#academicYearSemester").prop("disabled",true);// 禁用

			// 异动类别（从枚举获取数据）
			simpleSelect.loadSelect("alienChangeCategoryCode",
					urlStu.ALIENCHANGESETTING_GETSELECTLIST, {
						isEnabled : isEnabledEnum.Enable.value
					}, {
						firstText : dataConstant.PLEASE_SELECT,
						firstValue : ""
					});

			// 异动原因下拉（从数据字典获取数据）
			var opt = {
				idTree : "alienChangeReasonCodeTree", // 树Id
				id : "", // 下拉数据隐藏Id
				name : "alienChangeReasonCodeName", // 下拉数据显示name值
				code : "alienChangeReasonCode", // 下拉数据隐藏code值（数据字典）
				url : urlUdf.DICTIONARY_GETTREELISTBYPARENTCODE, // 下拉数据获取路径
				param : {
					"parentCode" : dataDictionary.ALIENCHANGE_REASON
				// 数据字典 parentCode
				},
				parentSelected : true,// 可以选择父节点的值
				defaultValue : "" // 默认值（修改时显示值）
			};
			treeSelect.loadTree(opt);

			// 校验
			studentArchives.initFormDataValidate($("#addForm"));
		},
		
		/**
		 * 初始化异动信息修改
		 */
		initUpdate : function() {
			var reqData = popup.data("param");// 获取主页面穿日的参数
			if (utils.isEmpty(reqData.recordId)){
				popup.errPop("非法操作");
				return false;
			}
		    // 获取需要更新的数据
			studentArchives.loadRegisterItem(reqData.recordId);
			// 校验
			studentArchives.initFormDataValidate($("#addForm"));	
		},
		
		/**
		 * 初始化异动信息查看
		 */
		initView : function() {
			var reqData = popup.data("param");// 获取主页面传日的参数
			if (utils.isEmpty(reqData.recordId)){
				popup.errPop("非法操作");
				return false;
			}
		    // 获取需要更新的数据
			studentArchives.loadItem(reqData.recordId);
		},
		
		/**
		 * 加载申请时间
		 */
		loadApplySetting : function(){
			// 加载属性
			ajaxData.request(urlStu.ALIENCHANGE_GETAPPLYSETTINGITEM, {
				applyType : applyTypeEnum.AlienChange.value
			}, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					var rvData = data.data;
					if (rvData != null && rvData.settingId != null){
						// 时间
					    $("#beginTime").text(rvData.beginTime);
					    $("#endTime").text(rvData.endTime);
					    // 开始和结束时间同当前时间比较
					    var timeObject = {
					    		beginTime : rvData.beginTimeD,
					    		endTime : rvData.endTimeD
					    };
					    if(studentArchives.validateTime(timeObject)){
					    	$("#applyButton").show();
					    }
					}
				}
			});
		},
		
		/**
		 * 加载学籍异动申请列表数据
		 */
		loadList : function() {
			// 请求数据
			ajaxData.request(url.ALIENCHANGERECORD_GETLIST, null,
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData && rvData.length > 0) {
								$("#tbodycontent").removeClass("no-data-html")
										.empty().append(
												$("#bodyContentImpl").tmpl(
														rvData, helper));
							} else {
								$("#tbodycontent").empty().append(
										"<tr><td colspan='9'></td></tr>")
										.addClass("no-data-html");
							}
						}
					}, true);
		},
		
		/**
		 * 加载需要更新的数据项
		 * 
		 * @param recordId 记录Id
		 */
		loadRegisterItem : function(recordId){
			// 请求数据
			ajaxData.request(urlStu.ALIENCHANGERECORD_GETREGISTERITEM, {recordId : recordId},
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData.recordId != null) {
								utils.setForm($("#addForm"),rvData); // 表单自动绑定
								// 备注长度控制
								new limit($("#remark"), $("#remarkCount"), 200);
								
								// 学年学期 
								simpleSelect.loadCommonSmester("academicYearSemester",
											urlData.COMMON_GETSEMESTERLIST, rvData.academicYearSemester);
								$("#academicYearSemester").prop("disabled",true);// 禁用
								// 异动类别（从枚举获取数据）
								var param ={
									isEnabled :	isEnabledEnum.Enable.value
								};
								simpleSelect.loadSelect("alienChangeCategoryCode",
										urlStu.ALIENCHANGESETTING_GETSELECTLIST, param, {
									        defaultValue : rvData.alienChangeCategoryCode,
											firstText : dataConstant.PLEASE_SELECT,
											firstValue : ""
										});	
									
								// 异动原因下拉（从数据字典获取数据）
								var opt = {
									idTree : "alienChangeReasonCodeTree", // 树Id
									id : "", // 下拉数据隐藏Id
									name : "alienChangeReasonCodeName", // 下拉数据显示name值
									code : "alienChangeReasonCode", // 下拉数据隐藏code值（数据字典）
									url : urlUdf.DICTIONARY_GETTREELISTBYPARENTCODE, // 下拉数据获取路径
									param : {
										"parentCode" : dataDictionary.ALIENCHANGE_REASON // 数据字典 parentCode				
									},
									parentSelected : true,// 可以选择父节点的值
									defaultValue : rvData.alienChangeReasonCode, // 默认值（修改时显示值）
								};
								treeSelect.loadTree(opt);
							}
						}
					});	
		},
		
		/**
		 * 加载查看数据
		 * 
		 * @param recordId 记录Id
		 */
		loadItem : function(recordId){
			// 请求数据
			ajaxData.request(url.ALIENCHANGERECORD_GETITEM, {recordId : recordId},
					function(data) {
						// 返回成功
						if (data.code == config.RSP_SUCCESS) {
							var rvData = data.data;
							if (rvData.recordId != null) {
								utils.setForm($("#addForm"),rvData); // 表单自动绑定
								// 绑定表单无法绑定的值								
								$("#applyDate").text(helper.format(rvData.applyDate,"yyyy-MM-dd"));// 申请日期	
								$("#issueDate").text(helper.format(rvData.issueDate,"yyyy-MM-dd"));// 发文日期	
								$("#alienChangeDate").text(helper.format(rvData.alienChangeDate,"yyyy-MM-dd"));// 异动日期
								$("span[name='remark']").prop("title",rvData.remark);
								$("span[name='studentNo']").prop("title",rvData.studentNo);
								$("span[name='studentName']").prop("title",rvData.studentName);
								// 学制为空设置，即没有异动处理的
								if ($("#afterEducationSys").text()=="0"){
									$("#afterEducationSys").text("");
								}
							}
						}
					});	
		},
		
		/**
		 * 异动申请
		 */
		apply : function() {
			// 请求数据
			ajaxData.request(urlStu.ALIENCHANGE_GETAPPLYSETTINGITEM, {
				applyType : applyTypeEnum.AlienChange.value
			}, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					// 获取生效学年学期
					if (data.data != null
							&& data.data.academicYearSemester != null) {						
					    // 开始和结束时间同当前时间比较
						var timeObject = {
						    		beginTime : data.data.beginTimeD,
						    		endTime : data.data.endTimeD
						    };
					    if(!studentArchives.validateTime(timeObject)){
					    	popup.errPop("不在异动申请时间范围内，请与教务处管理员联系");
					    	return false;
					    }else{
							// 主页面参数
							popup.data("param", {
								academicYearSemester : data.data.academicYearSemester
							});
							var applyDialog = popup.open(
									'./studentservice/studentArchives/html/add.html', // 这里是页面的路径地址
									{
										id : 'applyDialog',// 唯一标识
										title : '异动申请',// 这是标题
										width : 600,// 这是弹窗宽度。其实可以不写
										height : 330,// 弹窗高度
										okVal : '提交',
										cancelVal : '取消',
										ok : function(iframeObj) {
											var v = iframeObj.$("#addForm").valid(); // 验证表单
											if (v) { 
												// 表单验证通过
												var saveParams = utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));// 获取要保存的参数	
												saveParams.academicYearSemester = iframeObj.$("#academicYearSemester").val();// 学年学期
												
												// ajax提示错误前会自动关闭弹框
												ajaxData.request(url.ALIENCHANGERECORD_ADD, saveParams, function(
														data) {							
							                        // 提示
													if (data.code == config.RSP_SUCCESS) {
														// 关闭窗体
														applyDialog.close();
														// 刷新列表
														studentArchives.loadList();
														// 提示成功
														popup.okPop("保存成功", function() {								
														});						    
													} else {
														// 提示失败
														popup.errPop(data.msg);				
													}
												});
											}
											return false; // 阻止弹窗
										},
										cancel : function() {
											// 取消逻辑
										}
									});
					    }
					}
				}
			});
		},
		
		/**
		 * 修改
		 * 
		 * @param obj this对象
		 */
		edit : function(obj) {
			// 请求数据
			ajaxData.request(urlStu.ALIENCHANGE_GETAPPLYSETTINGITEM, {
				applyType : applyTypeEnum.AlienChange.value
			}, function(data) {
				// 返回成功
				if (data.code == config.RSP_SUCCESS) {
					// 获取生效学年学期
					if (data.data != null
							&& data.data.academicYearSemester != null) {						
					    // 开始和结束时间同当前时间比较
						var timeObject = {
						    		beginTime : data.data.beginTimeD,
						    		endTime : data.data.endTimeD
						    };
					    if(!studentArchives.validateTime(timeObject)){
					    	popup.errPop("不在异动申请时间范围内，请与教务处管理员联系");
					    	return false;
					    }else{
							// 主页面参数
							popup.data("param", {
								recordId : $(obj).attr("recordId"),
								userId : $(obj).attr("userId")
							});
							var editDialog = popup.open(
									'./studentservice/studentArchives/html/edit.html', // 这里是页面的路径地址
									{
										id : 'editDialog',// 唯一标识
										title : '异动信息修改',// 这是标题
										width : 600,// 这是弹窗宽度。其实可以不写
										height : 330,// 弹窗高度
										okVal : '提交',
										cancelVal : '取消',
										ok : function(iframeObj) {
											var v = iframeObj.$("#addForm").valid(); // 验证表单
											if (v) {
												// 表单验证通过
												var saveParams = utils.getQueryParamsByFormObject(iframeObj.$("#addForm"));// 获取要保存的参数
												saveParams.academicYearSemester = iframeObj.$("#academicYearSemester").val();// 学年学期
												
												// ajax提示错误前会自动关闭弹框
												ajaxData.request(url.ALIENCHANGERECORD_UPDATE, saveParams, function(
														data) {							
							                        // 提示
													if (data.code == config.RSP_SUCCESS) {
														// 关闭窗体
														editDialog.close();
														// 刷新列表
														studentArchives.loadList();
														// 提示成功
														popup.okPop("保存成功", function() {								
														});						    
													} else {
														// 提示失败
														popup.errPop(data.msg);				
													}
												});
											}
											return false; // 阻止弹窗
										},
										cancel : function() {
											// 取消逻辑
										}
									});
					    }
					}
				}
			});
		},
		
		/**
		 * 查看
		 * 
		 * @param obj this对象
		 */
		view : function(obj) {
			// 主页面参数
			popup.data("param", {
				recordId : $(obj).attr("recordId")
			});
			var viewDialog = popup.open(
					'./studentservice/studentArchives/html/view.html', // 这里是页面的路径地址
					{
						id : 'viewDialog',// 唯一标识
						title : '异动信息查看',// 这是标题
						width : 1000,// 这是弹窗宽度。其实可以不写
						height : 750,// 弹窗高度
						cancelVal : '关闭',
						cancel : function() {
							// 取消逻辑
						}
					});
		},
		
		/**
	     * 删除
		 * 
		 * @param obj this对象
	     */
	    del : function(obj){
			var recordIds = []; // 记录id数组
			recordIds.push($(obj).attr("recordId"));
			// 参数
			var param = {
				"ids" : recordIds
			};
			popup.askDeletePop("学籍异动申请记录", function() {
				// post请求提交数据
				ajaxData.request(url.ALIENCHANGERECORD_DELETE, param, function(data) {
					if (data.code == config.RSP_SUCCESS) {	
						// 提示成功
						popup.okPop("删除成功", function() {
						});
						// 刷新列表
						studentArchives.loadList();	
					} else {
						// 提示失败
						popup.errPop(data.msg);
					}
				});
			});
	    },
		
	    /**
	     * 校验时间
	     * 
	     * @param rvData 对象
	     * @return bool值
	     */
		 validateTime : function(rvData) {
			var beginTime = new Date(rvData.beginTime).format("yyyy-MM-dd hh:mm");
			var endTime = new Date(rvData.endTime).format("yyyy-MM-dd hh:mm");
			var nowDate = studentArchives.getNowDate();
			// 开始和结束时间与当前时间比较
			if (rvData.beginTime != null && rvData.endTime != null) {
				if (beginTime > nowDate || endTime < nowDate) {					
					return false;
				}
			}
			// 开始时间与当前时间比较
			if (rvData.beginTime != null) {
				if (beginTime > nowDate) {
					return false;
				}
			}
			// 结束时间与当前时间比较
			if (rvData.endTime != null) {
				if (endTime < nowDate) {
					return false;
				}
			}
			return true;
		},
	    
		/**
		 * 获取当前时间
		 * 
		 * @returns 时间根式字符串
		 */
		getNowDate : function() {
			var myDate = new Date();
			// 获取当前年
			var year = myDate.getFullYear();
			// 获取当前月
			var month = myDate.getMonth() + 1;
			// 获取当前日
			var date = myDate.getDate();
			var h = myDate.getHours(); // 获取当前小时数(0-23)
			var m = myDate.getMinutes(); // 获取当前分钟数(0-59)
			var s = myDate.getSeconds();

			var now = year + '-' + studentArchives.p(month) + "-"
					+ studentArchives.p(date) + " " + studentArchives.p(h)
					+ ':' + studentArchives.p(m);
			return now;
		},

		/**
		 * 获取当前时间
		 * 
		 * @param s 时间单位
		 */
		p:function(s) {
		    return s < 10 ? '0' + s: s;
		},
		
		/**
		 * 初始化新增、编辑表单校验
		 * 
		 * formJQueryObj 表单jquery对象
		 */
		initFormDataValidate:function(formJQueryObj){
			formJQueryObj.validate({
				rules : {
					academicYearSemester : {
						required : true
					},
					alienChangeCategoryCode: {
						required : true
					},
					alienChangeReasonCode: {
						required : true
					}						
				},
				messages : {
					academicYearSemester : {
						required : '生效学年学期',
					},
					alienChangeCategoryCode : {
						required : '异动类别不能为空'
					},
					alienChangeReasonCode : {
						required : '异动原因不能为空'
					}
				},
				onchange : function(ele) {
					$(ele).valid();
				},
				onfocusout : function(ele) {
					$(ele).valid();
				}
			})
		},
	}
	module.exports = studentArchives;
	window.studentArchives = studentArchives;
});
