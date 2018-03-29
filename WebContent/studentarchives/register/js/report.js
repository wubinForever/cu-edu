/**
 * 报到管理
 */
define(function(require, exports, module) {
	/**
	 * 导入js
	 */
	var utils = require("basePath/utils/utils");
	var ajaxData = require("basePath/utils/ajaxData");
	var config = require("basePath/utils/config");
	var CONSTANT = require("basePath/config/data.constant");
	var URL = require("basePath/config/url.udf");	
	var URL_DATA = require("basePath/config/url.data");
	var URL_STUDENTARCHIVES = require("basePath/config/url.studentarchives");
	var URL_TRAINPLAN = require("basePath/config/url.trainplan");
	var pagination = require("basePath/utils/pagination");
	var popup = require("basePath/utils/popup");
	var common = require("basePath/utils/common");
	var simpleSelect = require("basePath/module/select.simple");//公用下拉框
	var reportStatus = require("basePath/enumeration/studentarchives/ReportStatus");//状态枚举
	var applyTypeEnum = require("basePath/enumeration/studentarchives/ApplyType");
	var dataDictionary = require("basePath/config/data.dictionary");
	var base = config.base;	
	
	/**
	 * 学生报到管理
	 */
	var report = {	
		/**
		 * 查询条件
		 */		
		queryObject : {},
		
		/**
	     * 报到初始化
		 */
		init : function() {
			// 学年学期 默认生效学年学期
			simpleSelect.loadCommonSmesterTwo("academicYearSemesterSelect",URL_DATA.COMMON_GETSEMESTERLIST, "", "", "",$("#academicYearSemester"));
			$("#academicYearSemesterSelect").on("change keyup",function(){
				$("#academicYearSemester").val($(this).val());
			});
			var power=report.loadPower();
			if(power){//院系老师
				var isReporting =report.checkReportTime();
				if(!isReporting){
					return;
				}
			}
			
			report.queryObject.academicYearSemesterSelect = $("#academicYearSemesterSelect").val(); // 默认学年学期
			
			// 办理报到
			$(document).on("click", "button[name='transact']", function() {
				report.transact();
			});
			// 撤销报到
			$(document).on("click", "button[name='cancel']", function() {
				report.cancel();
			});

			// 年级
			simpleSelect.loadSelect("grade", URL_TRAINPLAN.GRADEMAJOR_GRADELIST, null, { async: false });
			// 院系
			simpleSelect.loadSelect("departmentId",
					URL_DATA.DEPARTMENT_GETDEPTLISTBYCLASS, {
						departmentClassCode : "1"
					}, { firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			//专业
			simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,{ grade: $("#grade").val() },{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
			// 院系联动专业
			$("#departmentId").on("change keyup", function() {
				report.gradeAndDepartmentChange();
			});
			// 年级联动专业
			$("#grade").on("change keyup", function() {
				report.gradeAndDepartmentChange();
			});
			// 专业联动班级
			$("#majorId").on("change keyup",function(){
				report.majorChange($(this).val());
			});	
			// 报到状态
			simpleSelect.loadEnumSelect("reportStatus", reportStatus, {
				firstText : "",
				firstValue : reportStatus.notHandled.value
			});
			// 性别
			simpleSelect.loadDictionarySelect("sexCode",dataDictionary.ID_FOR_SEX_CODE, {firstText:"全部",firstValue:""});
			// 查询
			$(document).on("click", "button[name='query']", function() {
				report.queryObject = utils.getQueryParamsByFormId("queryForm");// 获取查询参数
				report.queryObject.academicYearSemesterSelect = $("#academicYearSemesterSelect").val(); // 默认学年学期
				var queryParams = utils.getQueryParamsByFormId("queryForm");
				queryParams.academicYearSemesterSelect = $("#academicYearSemesterSelect").val(); // 默认学年学期
				report.pagination.setParam(queryParams);				
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
			report.pagination = new pagination({
				id : "pagination",
				url : URL_STUDENTARCHIVES.REPORT_GETLIST,
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
		 * 获取权限
		 */
		loadPower : function() {
			var powerData = null;
			ajaxData.contructor(false);
			ajaxData.request(URL_STUDENTARCHIVES.REPORT_GETPOWER, null,
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							$("#academicYearSemesterSelect").attr("disabled", data.data);
							powerData=data.data;
						}
					});
			return powerData;
		},
		/**
		 * 判断是否在办理时间内
		 */
		checkReportTime:function(){
			// 获取报到注册设置
			var reportData = null;
			ajaxData.contructor(false);
			ajaxData.request(URL_STUDENTARCHIVES.REGISTERSETTING_GETITEM, null,
					function(data) {
						if (data.code == config.RSP_SUCCESS) {
							reportData = data.data;
						}
					});
		    if(utils.isNotEmpty(reportData)){
                var reportBeginDate = new Date(reportData.reportBeginDate)
					.format("yyyy-MM-dd hh:mm");
				var reportEndDate = new Date(reportData.reportEndDate)
						.format("yyyy-MM-dd hh:mm");
				var nowDate = report.getNowDate();
				if (reportData.reportBeginDate == null || reportData.reportEndDate == null || reportData.registerBeginDate == null || reportData.registerEndDate == null) {
	                $("#reportList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
					return false; 
				}
				if (reportData.reportBeginDate != null) {
					if (reportBeginDate > nowDate) {
						$("#reportList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
						return false;
					}
				}
				if (reportData.reportEndDate != null) {
					if (reportEndDate < nowDate) {
						$("#reportList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
						return false;
					}
				}
				if (reportData.reportBeginDate != null
						&& reportData.reportEndDate != null) {
					if (reportBeginDate > nowDate || reportEndDate < nowDate) {
						$("#reportList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
						return false;
					}
				}
		    }else{
                  $("#reportList").html('<div class="layout-index text-center"  style="width: 500px; position: absolute; top: 50%; left: 50%; margin-left: -250px; margin-top: -200px; font-size: 16px;"><img src="../../../common/images/icons/warning.png" /><p style="margin: 20px 0px 10px;">不在办理时间内，请咨询教务处管理员！</p>');
				  return false; 
		    }
			
			return true;
		},
		/**
		 * 加载列表数据
		 */
		loadReportList : function() {
				var requestData = utils.getQueryParamsByFormId("queryForm");
				requestData.academicYearSemesterSelect = requestData.academicYearSemesterSelect || $('#academicYearSemesterSelect').val();
				if(!requestData.academicYearSemesterSelect){
					$("#tbodycontent").empty().append(
					"<tr><td colspan='9'></td></tr>")
					.addClass("no-data-html");
					return;
				}
				//学年
				requestData.academicYear = requestData.academicYearSemesterSelect.split("_")[0];
				//学期
				requestData.semesterCode = requestData.academicYearSemesterSelect.split("_")[1];
				ajaxData.request(URL_STUDENTARCHIVES.REPORT_GETLIST, requestData,
						function(data) {
							if (data.code == config.RSP_SUCCESS) {
								if (data.data.list.length > 0) {
									$("#tbodycontent").empty().append(
											$("#bodyContentImpl").tmpl(data.data.list))
											.removeClass("no-data-html");
								} else {
									$("#tbodycontent").empty().append(
											"<tr><td colspan='9'></td></tr>")
											.addClass("no-data-html");
								}
								//取消全选
								$('#check-all').removeAttr("checked").parent().removeClass("on-check");
							}
						}, true);
			},
		/**
		 * 办理报到 弹窗
		 */
		transact: function(){
			var arraUserIds=[];	
			var result= report.getCheck(arraUserIds,reportStatus.reported.value,'已报到的学生不能重复办理报到');
			if(!result){
				return;
			}		
			var academicYearSemesterSelect = report.queryObject.academicYearSemesterSelect;
			// 主页面参数
			popup.data("param", {
				academicYearSemester : academicYearSemesterSelect
			});
			popup.open(base+'/studentarchives/register/html/transact.html', // 这里是页面的路径地址
				{
					id : 'transact',// 唯一标识
					title : '办理报到',// 这是标题
					width : 440,// 这是弹窗宽度。
					height :300,// 弹窗高度
					okVal : '保存',
					cancelVal : '取消',
					ok : function() {
						// 确定逻辑
						var iframe = this.iframe.contentWindow;// 弹窗窗体
						var reqData=utils.getQueryParamsByFormObject(iframe.$("#addWorkForm"));
						reqData.userIds=arraUserIds;

						ajaxData.setContentType("application/json;charset=UTF-8");
						// post请求提交数据
						ajaxData.request(URL_STUDENTARCHIVES.REPORT_ADD,JSON.stringify(reqData),
							function(rvData) {
								if (rvData == null)
									return false;
								if (rvData.code == config.RSP_SUCCESS) {
									// 提示成功
									popup.okPop("保存成功", function() {});
									report.pagination.loadData();
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
		 * 报到弹窗初始化
		 */
		transactInit:function(){
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
			
			var newreportStatus=reportStatus;
			delete newreportStatus.notHandled;
			//报到状态
			simpleSelect.loadEnumSelect("reportStatus",newreportStatus,{firstText:"",firstValue:newreportStatus.reported.value});
			
			report.loadPower();
			$("#academicYearSemesterSelect").prop("disabled","disabled");	
		},
		/**
		 * 撤销报到
		 */
		cancel:function(){
			var arraUserIds=[];
			var academicYearSemester=$("#academicYearSemesterSelect").val();
			var result= report.getCheck(arraUserIds,reportStatus.notHandled.value,'未办理报到的学生不能撤销报到');
			if(!result){
				return;
			}
			popup.askPop("确认撤销报到吗？", function() {
				var reqData={};
				reqData.userIds=arraUserIds;
				reqData.reportStatus="";
				reqData.remark="";
				reqData.academicYearSemester=academicYearSemester;

				ajaxData.setContentType("application/json;charset=UTF-8");	
				ajaxData.request(URL_STUDENTARCHIVES.REPORT_REVOK, JSON.stringify(reqData), function(rvData) {
					if (rvData == null)
						return false;
					if (rvData.code ==  config.RSP_SUCCESS) {
						// 提示成功
						popup.okPop("撤销成功", function() {
						});
						// 刷新列表
						report.pagination.loadData();
						//report.loadReportList();
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
		 * @param arraUserIds
		 * @param rstatus
		 * @param message
		 * @returns {Boolean}
		 */
		getCheck:function(arraUserIds,rstatus,message){
			var isCancel=true;
			$("input[name='checNormal']:checked").each(function() {
				arraUserIds.push($(this).attr("userId"));
				var status=$(this).attr("reportStatus");
				if(rstatus==''){
				if(status==null||status==''){
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

			var now=year+'-'+report.p(month)+"-"+report.p(date)+" "+report.p(h)+':'+report.p(m);
			return now;
		},
		//初始化报到学生名册
		initReportRoll: function(){
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
				report.gradeAndDepartmentChange();
			});	
			//年级联动专业
			$("#grade").on("change keyup",function(){
				report.gradeAndDepartmentChange();
			});	
			//专业联动班级
			$("#majorId").on("change keyup",function(){
				report.majorChange($(this).val());
			});	
			//报到状态
			$("#reportStatusContainer").append($("#reportStatusImpl").tmpl(utils.getEnumValues(reportStatus)));
			//默认选择"未办理"
			$(".checkbox-con input[type=checkbox][value="+reportStatus.notHandled.value+"]").click();
			
			//培养层次
			simpleSelect.loadDictionarySelect("trainingLevelCode",dataDictionary.ID_FOR_TRAINING_LEVEL, {firstText:"全部",firstValue:""});
			//初始化分页列表
			report.pagedReportRollList = new pagination(
				{ url : URL_STUDENTARCHIVES.REPORT_ROLL }, 
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
			this.loadReportRollList();
			
			//绑定查询
			$("#query").on("click", function() {
				report.loadReportRollList();
			});	
			
			//绑定导出
			$(document).on("click", "#export", function() {
				ajaxData.exportFile(URL_STUDENTARCHIVES.REPORT_EXPORT, report.pagedReportRollList.option.param);
			});
		},
		//分页加载报到学生名册列表
		loadReportRollList:function(){
			//获取查询参数
			var requestParam = utils.getQueryParamsByFormId("queryForm");
			//学年
			requestParam.academicYear = requestParam.academicYearSemesterSelect.split("_")[0];
			//学期
			requestParam.semesterCode = requestParam.academicYearSemesterSelect.split("_")[1];
			//报到状态
			var reportStatuses = [];
			$.each($("#reportStatusContainer [type=checkbox]:checked"), function(i, item){
				reportStatuses.push(item.value);
			});
			requestParam.reportStatus = reportStatuses.join(",");
			
			//设置参数&刷新列表
			report.pagedReportRollList.setParam(requestParam);
		},
		/**
		 * 年级、院系联动专业
		 * @returns {Boolean}
		 */
		gradeAndDepartmentChange:function(){
			var departmentId=$("#departmentId").val();
			var grade=$("#grade").val();
			var reqData={};
			reqData.departmentId =departmentId;
			reqData.grade= grade;
			if(grade==''&&departmentId==''){
	    	   $("#majorId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
	    	   return false;
			}
			simpleSelect.loadSelect("majorId", URL_TRAINPLAN.GRADEMAJOR_MAJORLIST,reqData,{ firstText: CONSTANT.SELECT_ALL, firstValue: "", async: false });
			report.majorChange("");
		},
		/**
		 * 专业Change触发动作
		 * @returns {Boolean}
		 */
		majorChange : function(value){
			if(!value){
		    	   $("#classId").html("<option value=''>"+CONSTANT.SELECT_ALL+"</option>");
		    	   return false;
				}
			simpleSelect.loadSelect("classId", URL_STUDENTARCHIVES.CLASS_GET_CLASSSELECTBYQUERY,{majorId:value,grade : $("#grade").val()},{ firstText: CONSTANT.SELECT_ALL, firstValue: "" });
		}
	}
	module.exports = report;
	window.report = report;
});
