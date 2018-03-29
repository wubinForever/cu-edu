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
	var graduationAuditList = {
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
			// 毕业类别
			graduationAuditList.GRADUATE_TYPE = utils.getEnumValues(graduateTypeEnum);
			// 毕业状态
			graduationAuditList.GRADUATE_STATUS = utils.getEnumValues(graduateStatusEnum);
			// 审核结果
			graduationAuditList.AUDIT_RESULT = utils.getEnumValues(auditResultEnum);
			// 审核未通过原因
			graduationAuditList.AUDIT_REJECT_REASON = utils.getEnumValues(auditRejectReasonEnum);
			
			//读取年届
			graduationAuditList.loadGraduateYear();
			
			// 详情
			$(document).on("click", "button[name='detail']", function() {
				graduationAuditList.detail($(this));
			});
	    },
	    
	    //读取年届
	    loadGraduateYear:function(){
	    	ajaxData.request(URL_GRADUATION.GRAD_GRAUATEDATESET_GET, "", function(data) {
	    		//if(data.code == config.RSP_SUCCESS)
	    		{
	    			// 毕业年届
	   				$("#graduateYear").val(data.graduateYear);
	   				graduationAuditList.graduateYear = data.graduateYear;
	   			    // 审核
					$(document).on("click", "button[name='audit']", function() {
						graduationAuditList.audit();
					});
					// 分页
					graduationAuditList.pagination = new pagination({
						url : URL_GRADUATION.GRAD_STUDENT_GETAUDITEDGRADUATESTUDENTPAGEDLIST
					}, function(data,total) {
						$("#notPassTotal").html("未通过毕业审核的学生："+"<span class='text-danger'>"+total+"</span>");
						if (data.length>0) {
							for (var i=0;i<data.length;i++){
								data[i].index = i+1;
								data[i].auditResultsName = graduationAuditList.getEnumName(data[i].auditResults,graduationAuditList.AUDIT_RESULT);
								data[i].rejectReasonName = graduationAuditList.getEnumName(data[i].rejectReason,graduationAuditList.AUDIT_REJECT_REASON);
							}
							$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(data)).removeClass("no-data-html");
							$("#pagination").show();
						} else {
							$("#tbodycontent").empty().append("<tr><td colspan='9'></td></tr>").addClass("no-data-html");
							$("#pagination").hide();
						}
					})
					var param=utils.getQueryParamsByFormId("queryForm");
					graduationAuditList.pagination.setParam(param);
	    		}
   				
   			},false);
	    },
	    
	    // 审核
	    audit:function(){
	    	var param=utils.getQueryParamsByFormId("queryForm");
			var rvData = null;
			// post请求提交数据
			ajaxData.contructor(false);
			ajaxData.SetRequestTimeOut(60000);//延长请求等待时间
			ajaxData.request(URL_GRADUATION.GRAD_STUDENT_AUIDT, param, function(data) {
				rvData = data;
				if (rvData == null)
					return false;
				if (rvData.code == config.RSP_SUCCESS) {
					// 提示成功
					popup.okPop("操作成功", function() { });
					graduationAuditList.pagination.setParam(param);
				} else {
					// 提示失败
					popup.errPop(rvData.msg);
				}
			},true);
			
		},
		
	    // 查看详情
	    detail:function(obj){
	    	popup.setData('graduateYear',graduationAuditList.graduateYear);
	      	popup.setData('grade',$(obj).attr("grade"));
	      	popup.setData('majorId',$(obj).attr("majorId"));
	      	popup.setData('majorName',$(obj).attr("majorName"));
	      	popup.setData('departmentId',$(obj).attr("departmentId"));
	      	popup.setData('graduateStudentId',$(obj).attr("graduateStudentId"));
	      	popup.setData('studentName',$(obj).attr("studentName"));
	      	popup.setData('studentNo',$(obj).attr("studentNo"));
	      	popup.open('./graduation/auditing/html/viewDetail.html', // 这里是页面的路径地址
				{
					id : 'viewDeatilWin',// 唯一标识
					title : '审核详情',// 这是标题
					width : 800,// 这是弹窗宽度。其实可以不写
					height : 715,// 弹窗高度
					cancelVal : '关闭',
					cancel : function() {
						// 取消逻辑
					}
			});
		},
		
	    getEnumName : function(value, arr) {
			for(var j = 0; j < arr.length; j++){
				if(arr[j].value == value){
					return arr[j].name;
				}
			}
			return '';
		}
	}
	module.exports = graduationAuditList; // 根据文件名称一致
	window.graduationAuditList = graduationAuditList; // 根据文件名称一致
});