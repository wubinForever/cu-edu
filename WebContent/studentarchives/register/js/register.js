/**
 * 注册管理
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var URL = require("basePath/config/url.udf");	
	var CONSTANT = require("basePath/config/data.constant");	
	var URL_DATA = require("basePath/config/url.data");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var simpleSelect = require("basePath/module/select.simple");//公用下拉框
	var reportStatus = require("basePath/enumeration/studentarchives/ReportStatus");//状态枚举
	var registerStatus = require("basePath/enumeration/studentarchives/RegisterStatus");//状态枚举
	var isYesOrNo = require("basePath/enumeration/common/IsYesOrNo");//状态枚举
	var applyTypeEnum = require("basePath/enumeration/studentarchives/ApplyType");
	var dataDictionary = require("basePath/config/data.dictionary");
	var base  =config.base;	
	
	/**
	 * 注册管理
	 */
	var register = {
		/**
	     * 查询条件
		 */		
		queryObject : {},
			
		// 初始化
		init : function() {
			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",
					URL_DATA.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
			$("#academicYearSemesterSelect").on("change keyup",function(){
				$("#academicYearSemester").val($(this).val());
			});
			var power=register.loadPower();
			if(power){//院系老师
				var isRegisting =register.checkReportTime();
				if(!isRegisting){
					return;
				}
			}
			
			register.queryObject.academicYearSemesterSelect = $("#academicYearSemesterSelect").val(); // 默认学年学期
			
			//年级
			simpleSelect.loadSelect("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST,null, { async: false });
			//院系
			simpleSelect.loadSelect("departmentId", URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1"},{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			//专业
			simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST, { grade: $("#grade").val() },{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			//院系联动专业
			$("#departmentId").on("change keyup",function(){
				register.gradeAndDepartmentChange();
			});	
			//年级联动专业
			$("#grade").on("change keyup",function(){
				register.gradeAndDepartmentChange();
			});	
			$("#majorId").on("change keyup",function(){
				register.majorChange($(this).val());
			});	
			//报到状态
			simpleSelect.loadEnumSelect("reportStatus",reportStatus,{defaultValue:"-2",firstText:CONSTANT.SELECT_ALL,firstValue:""});
			//注册状态
			simpleSelect.loadEnumSelect("registerStatus",registerStatus,{firstText:"",firstValue:registerStatus.notHandled.value});
			//强制注册
			simpleSelect.loadEnumSelect("isForced",isYesOrNo,{defaultValue:-1,firstText:CONSTANT.SELECT_ALL,firstValue:-1});
			
			// 查询
			$(document).on("click", "button[name='query']", function() {
				register.queryObject = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
				register.queryObject.academicYearSemesterSelect = $("#academicYearSemesterSelect").val(); // 默认学年学期
				var queryParams = utils.getQueryParamsByFormId("queryForm")
				queryParams.academicYearSemesterSelect = $("#academicYearSemesterSelect").val(); // 默认学年学期
				register.pagination.setParam(queryParams);
			});	
			 // 办理注册
			$(document).on("click", "button[name='registration']", function() {
				register.registration();
			});
			 // 撤销注册
			$(document).on("click", "button[name='cancel']", function() {
				register.cancel();
			});		

			// 分页方法 begin
			var queryParams = utils.getQueryParamsByFormId("queryForm");
			queryParams.academicYearSemesterSelect = $("#academicYearSemesterSelect").val(); // 默认学年学期
			queryParams.academicYearSemesterSelect = queryParams.academicYearSemesterSelect || $('#academicYearSemesterSelect').val();
			if(!queryParams.academicYearSemesterSelect){
				$("#tbodycontent").empty().append(
				"<tr><td colspan='12'></td></tr>")
				.addClass("no-data-html");
				return;
			}
			// 初始化列表数据
			register.pagination = new pagination({
				id : "pagination",
				url : URL_STUDENTARCHIVES.REGISTER_GETLIST,
				param : queryParams,
				pageSize : 500,
				pageSizeList : [500, 1000, 2000]
			}, function(data) {
				$("#pagination").show();
				$('#check-all').removeAttr("checked").parent().removeClass("on-check");// 取消全选
				if (data && data.length > 0) {
					$("#tbodycontent").removeClass("no-data-html").empty()
							.append($("#bodyContentImpl").tmpl(data));
				} else {
					$("#tbodycontent").empty().append(
							"<tr><td colspan='12'></td></tr>").addClass("no-data-html");
					$("#pagination").hide();
				}
			}).init();
			// 分页方法 end
			
		},
		/**
		 * 判断是否在办理时间内
		 */
		checkReportTime:function(){
			var registerData = null;
			ajaxData.contructor(false); 
			ajaxData.request(URL_STUDENTARCHIVES.REGISTERSETTING_GETITEM, null,
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							registerData = data.data;
						}
					});
			if(utils.isNotEmpty(registerData)){
				var registerBeginDate = new Date(registerData.registerBeginDate).format("yyyy-MM-dd hh:mm");
				var registerEndDate = new Date(registerData.registerEndDate).format("yyyy-MM-dd hh:mm");
				var nowDate = register.getNowDate();
				
				if (registerData.reportBeginDate == null || registerData.reportEndDate == null || registerData.registerBeginDate == null || registerData.registerEndDate == null) {
	                $("#registerList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
					return false; 
				}
				
				if (registerData.registerBeginDate != null) {
					if(registerBeginDate > nowDate){
					$("#registerList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
					return false; 
					}
				}
				if(registerData.registerEndDate != null) {
					if (registerEndDate < nowDate) {
					$("#registerList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
					return false; 
					}
				}
				if(registerData.registerBeginDate != null && registerData.registerEndDate != null) {
					if(registerBeginDate > nowDate || registerEndDate < nowDate){
					$("#registerList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
					return false; 
					}
				}
			}else{
                  $("#registerList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
				  return false;
			}
			
			return true;
		},
		/**
		 * 获取权限
		 */
		loadPower:function(){
			var powerData = null;
			ajaxData.contructor(false); // 同步，保证下拉框下拉数据在修改页面赋值之前完成
			ajaxData.request(URL_STUDENTARCHIVES.REPORT_GETPOWER,
					null, function(data) {
						if (data.code == config.RSP_SUCCESS) {
							$("#academicYearSemesterSelect").attr("disabled",data.data);
							powerData=data.data;
						}
					});
			return powerData;
		},
		/**
		 * 加载列表数据
		 */
		loadRegisterList:function(){
			var requestData = utils.getQueryParamsByFormId("queryForm");
			requestData.academicYearSemesterSelect = requestData.academicYearSemesterSelect || $('#academicYearSemesterSelect').val();
			if(!requestData.academicYearSemesterSelect){
				$("#tbodycontent").empty().append(
				"<tr><td colspan='11'></td></tr>")
				.addClass("no-data-html");
				return;
			}
			//学年
			requestData.academicYear = requestData.academicYearSemesterSelect.split("_")[0];
			//学期
			requestData.semesterCode = requestData.academicYearSemesterSelect.split("_")[1];
			ajaxData.request(URL_STUDENTARCHIVES.REGISTER_GETLIST, requestData,
					function(data) { 
						if (data.code == config.RSP_SUCCESS) {
							if (data.data.list.length > 0) {
								$("#tbodycontent").empty().append(
										$("#bodyContentImpl").tmpl(data.data.list))
										.removeClass("no-data-html");
							} else {
								$("#tbodycontent").empty().append(
										"<tr><td colspan='11'></td></tr>")
										.addClass("no-data-html");
							}
							//取消全选
							$('#check-all').removeAttr("checked").parent().removeClass("on-check");
						}
					}, true);
		},
		/**
		 * 办理注册 弹窗
		 */
		registration: function(){
			var arraUserIds=[];
			var academicYearSemester=$("#academicYearSemester").val();
			var result= register.getCheck(arraUserIds,registerStatus.registered.value,'已注册的学生不能重复办理注册');
			if(!result){
				return;
			}

			var academicYearSemesterSelect = register.queryObject.academicYearSemesterSelect;
			// 主页面参数
			popup.data("param", {
				userIds : arraUserIds,
				academicYearSemester : academicYearSemesterSelect
			});
			popup.open(base+'/studentarchives/register/html/registration.html', // 这里是页面的路径地址
				{
					id : 'registration',// 唯一标识
					title : '办理注册',// 这是标题
					width : 440,// 这是弹窗宽度。其实可以不写
					height :360,// 弹窗高度
					okVal : '保存',
					cancelVal : '取消',
					ok : function(iframeObj) {
						// 确定逻辑
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						var v = iframe.$("#addWorkForm").valid();// 验证表单
						var reqData=utils.getQueryParamsByFormObject(iframe.$("#addWorkForm"));
						reqData.userIds=arraUserIds;
						ajaxData.setContentType("application/json;charset=UTF-8");
						// post请求提交数据
						ajaxData.request(URL_STUDENTARCHIVES.REGISTER_ADD,JSON.stringify(reqData),
							function(rvData) {
								if (rvData == null)
									return false;
								if (rvData.code == config.RSP_SUCCESS) {
									// 提示成功
									popup.okPop("保存成功", function() {});
									register.pagination.loadData();
									//取消全选
									$('#check-all').removeAttr("checked").parent().removeClass("on-check");
								} else {
									// 提示失败
									popup.errPop(rvData.msg);
									return false;
								}
							},true);
					},
					cancel : function() {
						// 取消逻辑
					}
				});
		},
		/**
		 * 注册弹窗初始化
		 */
		registrationInit:function(){
			var reqData = popup.data("param");// 获取主页面的参数
			if (reqData == null || utils.isEmpty(reqData.academicYearSemester)){
				// 提示失败
				popup.errPop("学年学期不能为空");
				return false;
			}
		 	var academicYearSemester = reqData.academicYearSemester;
			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmester("academicYearSemesterSelect",URL_DATA.COMMON_GETSEMESTERLIST, academicYearSemester, null, null);
			$("#academicYearSemester").val(academicYearSemester);	
			var newregisterStatus=registerStatus;
			delete newregisterStatus.notHandled;
			//注册状态
			simpleSelect.loadEnumSelect("registerStatus",newregisterStatus,{firstText:"",firstValue:newregisterStatus.registered.value});
		
			//强制注册
			simpleSelect.loadEnumSelect("isForced",isYesOrNo,{firstText:"",firstValue:isYesOrNo.Yes.value});
			$("#academicYearSemesterSelect").on("change keyup",function(){
				$("#academicYearSemester").val($(this).val());
			});
			register.loadPower();
			$("#academicYearSemesterSelect").prop("disabled","disabled");	
		},
		/**
		 * 撤销注册
		 */		
		cancel:function(){
			var arraUserIds=[];
			var academicYearSemester=$("#academicYearSemesterSelect").val();
			var result= register.getCheck(arraUserIds,registerStatus.notHandled.value,'未办理注册的学生不能撤销注册');
			if(!result){
				return;
			}
			var cancelDialog = popup.askPop("确认撤销注册吗？", function() {
				var reqData={};
				reqData.userIds=arraUserIds;
				reqData.registerStatus="";
				reqData.remark="";
				reqData.academicYearSemester=academicYearSemester;
				reqData.isForced="";
				ajaxData.setContentType("application/json;charset=UTF-8");
				ajaxData.request(URL_STUDENTARCHIVES.REGISTER_REVOK, JSON.stringify(reqData), function(rvData) {
					if (rvData.code ==  config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("撤销成功", function() {});
						// 刷新列表
						register.pagination.loadData();
						//register.loadRegisterList();
						//取消全选
						$('#check-all').removeAttr("checked").parent().removeClass("on-check");
					} else {
						// 提示失败
						popup.errPop(rvData.msg);
					}
				},true);
			});
		},
		/**
		 * 验证勾选数据是否有效
		 * @param arraUserIds 学生id数组
		 * @param rstatus 报到状态
		 * @param message 提示消息
		 * @returns {Boolean}
		 */
		getCheck:function(arraUserIds,rstatus,message){
			var isCancel=true;
			$("input[name='checNormal']:checked").each(function() {
				arraUserIds.push($(this).attr("userId"));
				var status=$(this).attr("registerStatus");
				if(rstatus==""){
				if(status==null||status==""){
					isCancel=false;
					return false;
				}}else if(status==rstatus){
					isCancel=false;
					return false;
				}
			});
			if(arraUserIds.length==0){
				popup.warPop("请勾选要处理的数据");
				return false;
			}
			if(!isCancel){
				popup.warPop(message);
				return false;
			}
			return true;
		},
		/**
		 * 批量注册初始化
		 */
		batchRegisterInit:function(){
			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmester("academicYearSemester",
					URL_DATA.COMMON_GETSEMESTERLIST, "", null, null);
			
			 // 批量注册
			$(document).on("click", "button[name='btnSave']", function() {
				register.btnSave();
			});
		},
		/**
		 * 批量注册
		 */
		btnSave:function(){
			var report=$("#report").is(":checked"); //所选学年学期已报到
			var register=$("#register").is(":checked"); //所选学年学期上学期已注册
			var requestData={};
			if(report&&register){//都勾选
				requestData.registerType=3;
			}if(report&&!register){//只
				requestData.registerType=1;
			}if(!report&&register){
				requestData.registerType=2;
			}
			if(!report&!register){
				popup.warPop("请勾选批量注册方式");
				return;
			}
			requestData.academicYearSemester=$("#academicYearSemester").val();
			ajaxData.request(URL_STUDENTARCHIVES.REGISTER_BATCHREGISTER,
					requestData, function(data) {
						if (data.code == config.RSP_SUCCESS) {
							// 提示成功
							popup.okPop("批量注册成功", function() {});
						} else {
							// 提示失败
							popup.errPop(data.msg);
						}
					},true);
		},
		/**
		 * 
		 * 获取当前时间
		 */
		 p:function(s) {
		    return s < 10 ? '0' + s: s;
		},
		getNowDate:function(){
			var myDate = new Date();
			//获取当前年
			var year=myDate.getFullYear();
			//获取当前月
			var month=myDate.getMonth()+1;
			//获取当前日
			var date=myDate.getDate(); 
			var h=myDate.getHours();       //获取当前小时数(0-23)
			var m=myDate.getMinutes();     //获取当前分钟数(0-59)
			var s=myDate.getSeconds();  

			var now=year+'-'+register.p(month)+"-"+register.p(date)+" "+register.p(h)+':'+register.p(m);
			return now;
		},
		//初始化注册学生名册
		initRegisterRoll: function(){
			//初始化查询条件
			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",
					URL_DATA.COMMON_GETSEMESTERLIST, "");
			
			//年级
			simpleSelect.loadSelect("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST,null,{ firstText: CONSTANT.SELECT_ALL, firstValue: -1 });
			//院系
			simpleSelect.loadSelect("departmentId", URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS,{departmentClassCode:"1"},{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			//专业
			simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,null,{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			//院系联动专业
			$("#departmentId").on("change keyup",function(){
				register.gradeAndDepartmentChange();
			});	
			//年级联动专业
			$("#grade").on("change keyup",function(){
				register.gradeAndDepartmentChange();
			});	
			//专业联动班级
			$("#majorId").on("change keyup",function(){
				register.majorChange($(this).val());
			});	
			//注册状态
			$("#registerStatusContainer").append($("#registerStatusImpl").tmpl(utils.getEnumValues(registerStatus)));
			//默认选择"未办理"
			$(".checkbox-con input[type=checkbox][value="+reportStatus.notHandled.value+"]").click();
			//培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode",dataDictionary.ID_FOR_TRAINING_LEVEL, {firstText:"全部",firstValue:""});
			//初始化分页列表
			register.pagedRegisterRollList = new pagination(
				{ url : URL_STUDENTARCHIVES.REGISTER_ROLL }, 
				function(data) {
					if (data && data.length > 0) {
						$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
						$("#pagination").show();
					} else {
						$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
						$("#pagination").hide();
					}
				});
			
			//加载列表数据
			this.loadRegisterRollList();
			
			//绑定查询
			$("#query").on("click", function() {
				register.loadRegisterRollList();
			});	
			
			//绑定导出
			$(document).on("click", "#export", function() {
				ajaxData.exportFile(URL_STUDENTARCHIVES.REGISTER_EXPORT, register.pagedRegisterRollList.option.param);
			});
		},
		//分页加载注册学生名册列表
		loadRegisterRollList:function(){
			//获取查询参数
			var requestParam = utils.getQueryParamsByFormId("queryForm");
			//学年
			requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
			//学期
			requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
			//注册状态
			var registerStatuses = [];
			$.each($("#registerStatusContainer [type=checkbox]:checked"), function(i, item){
				registerStatuses.push(item.value);
			});
			requestParam.registerStatus = registerStatuses.join(",");
			
			//设置参数&刷新列表
			register.pagedRegisterRollList.setParam(requestParam);
		},
		/**
		 * 年级、院系联动专业
		 * @returns {Boolean}
		 */
		gradeAndDepartmentChange : function(){
			var departmentId=$("#departmentId").val();
			var grade=$("#grade").val();
			var reqData={};
			reqData.departmentId =departmentId;
			reqData.grade= grade;
			if(grade==''&&departmentId==''){
	    	   $("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
	    	   return;
			}
			simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,reqData,{ firstText: CONSTANT.SELECT_ALL, firstValue: "", async: false });
			register.majorChange("");
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
		}
	}
	module.exports = register;
	window.register = register;
});
