/**
 * 预计毕业学生列表
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	
	//url
	var URLDATA = require("basePath/config/url.data");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var URL_GRADUATION = require("basePath/config/url.graduation");
	var CONSTANT = require("basePath/config/data.constant");

	// 枚举
	var isCurrentSemester = require("basePath/enumeration/common/IsCurrentSemester");
	var departmentClassEnum = require("basePath/enumeration/udf/DepartmentClass");
	var graduateTypeEnum = require("basePath/enumeration/graduation/GraduateType");
	var auditResultEnum = require("basePath/enumeration/graduation/AuditResult");
	var auditRejectReasonEnum = require("basePath/enumeration/graduation/AuditRejectReason");
	var graduateStatusEnum = require("basePath/enumeration/graduation/GraduateStatus");
	var isEnabled = require("basePath/enumeration/common/IsEnabled");//状态枚举
	var archievesStatus = require("basePath/enumeration/studentarchives/ArchievesStatus");//学籍状态枚举
	var dataDictionary = require("basePath/config/data.dictionary");
	
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var authority = require("basePath/utils/authority");
	var validate = require("basePath/utils/validateExtend");
	var common = require("basePath/utils/common"); //复选单选

	// 下拉框
	var select = require("basePath/module/select");//模糊搜索
	var semester = require("basePath/module/select.semester");
	var simpleSelect = require("basePath/module/select.simple");//公用下拉框


	var base = config.base;
/**
 * 预计毕业学生列表
 */
	var graduatingStudentsList = {
		// 查询条件
		queryObject:{},	
		// 毕业类别
		GRADUATE_TYPE:{},
		// 毕业状态
		GRADUATE_STATUS:{},
		// 审核结果
		AUDIT_RESULT:{},
		// 审核未通过原因
		AUDIT_REJECT_REASON:{},
		// 初始化
		init : function() {
			// 复选框
			utils.checkAllCheckboxes('check-all', 'checNormal');
	
			// 毕业类别
			graduatingStudentsList.GRADUATE_TYPE = utils.getEnumValues(graduateTypeEnum);
			// 毕业状态
			graduatingStudentsList.GRADUATE_STATUS = utils.getEnumValues(graduateStatusEnum);
			// 审核结果
			graduatingStudentsList.AUDIT_RESULT = utils.getEnumValues(auditResultEnum);
			// 审核未通过原因
			graduatingStudentsList.AUDIT_REJECT_REASON = utils.getEnumValues(auditRejectReasonEnum);
			
			var opt = {
				firstText : CONSTANT.SELECT_ALL,
				firstValue : -1
			}
			// 毕业类别
			simpleSelect.loadEnumSelect("graduateType",graduateTypeEnum,opt);
			// 学生当前状态
			simpleSelect.loadDataDictionary("currentStatusCode",dataDictionary.CURRENT_STATUS_CODE,"",CONSTANT.SELECT_ALL,"");

			//读取年届
			graduatingStudentsList.loadGraduateYear();
	
			// 取消延迟
			$(document).on("click", "button[name='cancelPostpone']", function() {
				graduatingStudentsList.cancelPostpone($(this));
			});
			// 删除提前毕业学生
			$(document).on("click", "button[name='deleteGraduateAdvance']", function() {
				graduatingStudentsList.deleteGraduateAdvance($(this));
			});
	  
			// 读取预计毕业学生
			$(document).on("click", "button[name='loadAnticipatedGraduate']", function() {
				graduatingStudentsList.loadAnticipatedGraduate();
			});
			// 添加提前毕业学生
			$(document).on("click", "button[name='addGraduateAdvance']", function() {
				graduatingStudentsList.addGraduateAdvance();
			});
			// 设置延迟毕业
			$(document).on("click", "button[name='setPostpone']", function() {
				var length = $("input[name='checNormal']:checked").length;
				var ids = [];
				if(length==0){
					popup.warPop("至少选择一条数据");
					return false;
				}
				$("input[name='checNormal']:checked").each(function(){
					ids.push($(this).attr("id"));
				})
				graduatingStudentsList.setPostpone(ids);
			});
				
			//导出
			$(document).on("click", "button[name='export']", function() {
				ajaxData.exportFile(URL_GRADUATION.GRAD_STUDENT_EXPORTANTICIPATEDGRADUATESTUDENTFILE
							, graduatingStudentsList.pagination.option.param);
			});
	    },
	    
	    //读取年届
	    loadGraduateYear:function(){
	    	ajaxData.request(URL_GRADUATION.GRAD_GRAUATEDATESET_GET, "", function(data) {
	    		//if(data.code == config.RSP_SUCCESS)
	    		{
	    			// 毕业年届
	   				$("#graduateYear").val(data.graduateYear);
	   				// 毕业时间
	   			    $("#graduateDate").val(new Date(data.graduateDate).format("yyyy-MM-dd"));
	   			    graduatingStudentsList.loadAcademicYearAndRelation();
	   			    // 查询
					$("#query").on("click", function() {
						//保存查询条件
						var param=utils.getQueryParamsByFormId("queryForm");
						graduatingStudentsList.pagination.setParam(param);
					});
					// 分页
					graduatingStudentsList.pagination = new pagination({
						url : URL_GRADUATION.GRAD_STUDENT_GETANTICIPATEDGRADUATESTUDENTPAGEDLIST
					}, function(data) {
						if (data.length>0) {
							for (var i=0;i<data.length;i++){
								data[i].index = i+1;
								data[i].graduateTypeName = graduatingStudentsList.getEnumName(data[i].graduateType,graduatingStudentsList.GRADUATE_TYPE);
							}
							$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
							$("#pagination").show();
						} else {
							$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
							$("#pagination").hide();
						}
						//取消全选
						$('#check-all').removeAttr("checked").parent().removeClass("on-check");
					})
					var param=utils.getQueryParamsByFormId("queryForm");
					graduatingStudentsList.pagination.setParam(param);
	    		}
   				
   			},false);
	    },
	    
	    /*
		 * 加载学年、院系、专业、班级		 
		 */
		loadAcademicYearAndRelation : function(){
			var graduateYear = $('#graduateYear').val();
			var param = {
				graduateYear : graduateYear
			};
			// 年级（从数据库获取数据）
			simpleSelect.loadSelect("grade", URL_GRADUATION.GRAD_STUDENT_GETGRADUATEGRADELIST,
				param, {
					firstText : CONSTANT.SELECT_ALL,
					firstValue : "",
					async: false
				});
			// 院系（从数据库获取数据）
			simpleSelect
					.loadSelect(
							"departmentId",
							URLDATA.DEPARTMENT_GETDEPTLISTBYCLASS,
							{
								departmentClassCode : departmentClassEnum.TEACHINGDEPARTMENT.value, isAuthority : false
							}, {
								firstText : CONSTANT.SELECT_ALL,
								firstValue : ""
							});
			
			//专业
			simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,null,{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			
			// 年级联动专业
			$("#grade").change(
					function() {
						var reqData = {};
						reqData.isAuthority = false;
						reqData.grade = $(this).val();
						reqData.departmentId = $("#departmentId").val();
						if (utils.isNotEmpty($(this).val())
								&& $(this).val() == '-1'
								&& utils.isEmpty($("#departmentId").val())) {
							$("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
							return false;
						}
						simpleSelect.loadSelect("majorId",
								URL_TRAINPLAN.GRADEMAJOR_MAJORLIST, reqData, {
									firstText : CONSTANT.SELECT_ALL,
									firstValue : "",
									async: false
							});
						graduatingStudentsList.majorChange("")
					});
			// 院系联动专业
			$("#departmentId").change(
				function() {
					var reqData = {};
					reqData.isAuthority = false;
					reqData.departmentId = $(this).val();
					reqData.grade = $("#grade").val();
					if (utils.isEmpty($(this).val())
							&& utils.isNotEmpty($("#grade").val())
							&& $("#grade").val() == '-1') {
						$("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
						return false;
					}
					simpleSelect.loadSelect("majorId",
						URL_TRAINPLAN.GRADEMAJOR_MAJORLIST, reqData, {
							firstText : CONSTANT.SELECT_ALL,
							firstValue : "",
							async: false
						});
					graduatingStudentsList.majorChange("")
			});
			
			//专业联动班级
			$("#majorId").change(function(){
				graduatingStudentsList.majorChange($(this).val())
			});
		},
		
		/**
		 * 专业Change触发动作
		 * @returns {Boolean}
		 */
		majorChange : function(value){
			if(!value){
	    	   $("#classId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
	    	   return;
			}
			simpleSelect.loadSelect("classId", URL_STUDENTARCHIVES.CLASS_GET_CLASSSELECTBYQUERY,{majorId:value,grade : $("#grade").val()},{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
		},
	
		// 删除提前毕业学生
	    deleteGraduateAdvance:function(obj){

	      	popup.askPop("确认删除所选项吗？", function() {
	      		var id=$(obj).attr("data-tt-id");
		      	var param = {
					id : id
				};
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_GRADUATION.GRAD_STUDENT_DELETEGRADUATEADVANCE, param, function(data) {
					rvData = data;
				});
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("删除成功", function() { });
					{
						var graduateYear = $('#graduateYear').val();
						var param = {
							graduateYear : graduateYear
						};
						// 年级（从数据库获取数据）
						simpleSelect.loadSelect("grade", URL_GRADUATION.GRAD_STUDENT_GETGRADUATEGRADELIST,
							param, {
								firstText : CONSTANT.SELECT_ALL,
								firstValue : "",
								async: false
							});
					}
					// 刷新列表
					graduatingStudentsList.pagination.loadData();
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			});
	    },
	    
	    // 读取预计毕业学生
	    loadAnticipatedGraduate:function(){
	    	var gYear = $("#graduateYear").val();
   			var gDate = $("#graduateDate").val();
   			if(!gYear || gYear == '' || !gDate || gDate == ''){
   				popup.okPop("毕业年届未加载", function() { });
   				return;
   			}
   			var param = {
				graduateYear : gYear,
				graduateDate : gDate
			};
			var rvData = null;
			// post请求提交数据
			ajaxData.contructor(false);
			ajaxData.SetRequestTimeOut(60000);//延长请求等待时间
			ajaxData.request(URL_GRADUATION.GRAD_STUDENT_LOADANTICIPATEDGRADUATE, param, function(data) {
				rvData = data;
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					var param=utils.getQueryParamsByFormId("queryForm");
					graduatingStudentsList.pagination.setParam(param);
					{
						var graduateYear = $('#graduateYear').val();
						var param = {
							graduateYear : graduateYear
						};
						// 年级（从数据库获取数据）
						simpleSelect.loadSelect("grade", URL_GRADUATION.GRAD_STUDENT_GETGRADUATEGRADELIST,
							param, {
								firstText : CONSTANT.SELECT_ALL,
								firstValue : "",
								async: false
							});
					}
					// 提示成功
					popup.okPop("操作成功", function() { });
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			},true);
		},
		
	    // 添加提前毕业学生
	    addGraduateAdvance:function(){
	    	var gYear = $('#graduateYear').val();
	    	var gDate = $("#graduateDate").val();
	    	if(!gYear || gYear == '' || !gDate || gDate == ''){
   				popup.okPop("毕业年届未加载", function() { });
   				return;
   			}
	    	popup.setData('graduateYear',gYear);
	      	popup.open('./graduation/setting/html/addGraduateAdvance.html', // 这里是页面的路径地址
				{
					id : 'addGraduateAdvanceWin',// 唯一标识
					title : '添加提前毕业学生',// 这是标题
					width : 1230,// 这是弹窗宽度。其实可以不写
					height : 470,// 弹窗高度
					okVal : '保存',
					cancelVal : '关闭',
					ok : function() {
						// 确定逻辑
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						var ids = [];
						var data = iframe.addGraduateAdvance.shuff.getData();
						if(data && data.length > 0){
							for (var k = 0, length = data.length; k < length; k++) {
								ids.push(data[k].userId);
							}
							var param = { 
								ids : ids,
								graduateYear:gYear,
								graduateDate : gDate
							};
							// post请求提交数据
							ajaxData.contructor(false);// 同步
							ajaxData.request(URL_GRADUATION.GRAD_STUDENT_ADDGRADUATEADVANCE, param,
								function(data) {
									rvData = data;
									if (rvData == null)
										return false;
									if (rvData.code == config.RSP_SUCCESS) {
										{
											var graduateYear = $('#graduateYear').val();
											var param = {
												graduateYear : graduateYear
											};
											// 年级（从数据库获取数据）
											simpleSelect.loadSelect("grade", URL_GRADUATION.GRAD_STUDENT_GETGRADUATEGRADELIST,
												param, {
													firstText : CONSTANT.SELECT_ALL,
													firstValue : "",
													async: false
												});
										}
										// 提示成功
										popup.okPop("修改成功", function() {});
										graduatingStudentsList.pagination.loadData();
									} else {
										// 提示失败
										popup.errPop(rvData.msg);
										return false;
									}
								});
						}
						return true;

					},
					cancel : function() {
						// 取消逻辑
					}
			});
		},
		
	    // 设置延迟毕业
	    setPostpone:function(ids){
	      popup.open('./graduation/setting/html/delayGraduate.html', // 这里是页面的路径地址
					{
						id : 'delayGraduateWin',// 唯一标识
						title : '设置延迟毕业',// 这是标题
						width : 650,// 这是弹窗宽度。其实可以不写
						height : 155,// 弹窗高度
						okVal : '保存',
						cancelVal : '取消',
						ok : function() {
							var iframe = this.iframe.contentWindow;// 弹窗窗体
							iframe.$("#setPostponeYear").validate(
								{
									rules : {
										postponeYears:{
											required:true,
											min:1,
											max:99
										}
									},
									messages : {
										postponeYears:{
											required:"请输入延迟年数",
											min:$.validator.format( "请输入大于等于{0}的值" ),
											max:$.validator.format( "请输入小于等于{0}的值" )
										}
									}
								});
							var v = iframe.$("#setPostponeYear").valid();// 验证表单
							if(v){
								var reqData = utils.getQueryParamsByFormObject(iframe.$("#setPostponeYear"));
								reqData.ids = ids;
								// post请求提交数据
								ajaxData.contructor(false);// 同步
								ajaxData.request(URL_GRADUATION.GRAD_STUDENT_SETPOSTPONE, reqData,
									function(data) {
										rvData = data;
										if (rvData == null)
											return false;
										if (rvData.code == config.RSP_SUCCESS) {
											// 提示成功
											popup.okPop("修改成功", function() {});
											graduatingStudentsList.pagination.loadData();
										} else {
											// 提示失败
											popup.errPop(rvData.msg);
											return false;
										}
									});
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
			
	   	// 取消延迟
	    cancelPostpone:function(obj){
	    	var id=$(obj).attr("data-tt-id");
	    	var param = {
				id : id
			};
			popup.askPop("确认取消延迟毕业吗？", function() {
				var rvData = null;
				// post请求提交数据
				ajaxData.contructor(false);
				ajaxData.request(URL_GRADUATION.GRAD_STUDENT_CANCELPOSTPONE, param, function(data) {
					rvData = data;
					if (rvData == null)
						return false;
					if (rvData.code == config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("操作成功", function() { });
						// 刷新列表
						graduatingStudentsList.pagination.loadData();
					} else {
						// 提示失败
						popup.errPop(rvData.msg);
					}
				});
			});
	    },
	
		getEnumName : function(value, arr) {
			for(var j = 0; j < arr.length; j++){
				if(arr[j].value == value){
					return arr[j].name;
				}
			}
			return '';
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
		 * 绑定验证事件
		 */
		validation : function() {
			// 校验
			validate.validateEx();
		},
	}
	module.exports = graduatingStudentsList; // 根据文件名称一致
	window.graduatingStudentsList = graduatingStudentsList; // 根据文件名称一致
});