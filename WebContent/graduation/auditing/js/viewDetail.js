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
	var creditType = require("basePath/enumeration/graduation/CreditType");
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
	var viewDetail = {
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
			viewDetail.GRADUATE_TYPE = utils.getEnumValues(graduateTypeEnum);
			// 毕业状态
			viewDetail.GRADUATE_STATUS = utils.getEnumValues(graduateStatusEnum);
			// 审核结果
			viewDetail.AUDIT_RESULT = utils.getEnumValues(auditResultEnum);
			// 审核未通过原因
			viewDetail.AUDIT_REJECT_REASON = utils.getEnumValues(auditRejectReasonEnum);
			viewDetail.CREDIT_TYPE = utils.getEnumValues(creditType);
	      	
			viewDetail.graduateStudentId = popup.getData('graduateStudentId');
			
			viewDetail.graduateYear = popup.getData('graduateYear');
			viewDetail.grade = popup.getData('grade');
			viewDetail.majorId = popup.getData('majorId');
			viewDetail.departmentId = popup.getData('departmentId');
			$("#grade").html(viewDetail.grade);
			$("#studentName").html('['+popup.getData("studentNo")+']'+popup.getData("studentName"));
			$("#majorName").html(popup.getData("majorName"));
			//读取数据
			viewDetail.loadData();
			
	    },
	    
	    //读取数据
	    loadData:function(){
	    	ajaxData.request(URL_GRADUATION.GRAD_GRAUATEDATESET_GET, "", function(data) {
	    		//if(data.code == config.RSP_SUCCESS)
	    		{
	    			// 毕业年届
	   				$("#graduateYear").val(data.graduateYear);
	   				
	   				var param1 = {
		   				id : viewDetail.graduateStudentId,
		   				graduateYear:data.graduateYear,
	   					grade:viewDetail.grade ,
	   					majorId:viewDetail.majorId ,
	   					departmentId:viewDetail.departmentId
		   			}
	   			    ajaxData.request(URL_GRADUATION.GRAD_STUDENT_GETAUDITDETAILCREDIT, param1, function(data) {
			    		if(data.code==config.RSP_SUCCESS && data.data&& data.data.length > 0){
		        			var datas = data.data;
		        			if (datas.length>0) {
			   					var dataTotal = {
			   						gotCredit : 0.0,
			   						requireCredit : 0.0,
			   					};
								for (var i = 0; i < datas.length; i++){
									datas[i].creditTypeName = viewDetail.getEnumName(datas[i].creditType,viewDetail.CREDIT_TYPE);
									dataTotal.requireCredit += datas[i].requireCredit;
									dataTotal.gotCredit += datas[i].gotCredit;
								}
								$("#tcreditbodycontent").empty().append($("#creditBodyContentImpl").tmpl(datas));
								$("#tcreditbodycontent").append($("#creditTotalBodyContentImpl").tmpl(dataTotal));
							}else{
								popup.okPop("加载失败", function() { });
							}
		        		}
		   				
		   			},false);
		   			var param2 = {
		   				id : viewDetail.graduateStudentId
		   			}
		   			ajaxData.request(URL_GRADUATION.GRAD_STUDENT_GETAUDITDETAILCOURSE, param2, function(data) {
			    		if(data.code == config.RSP_SUCCESS && data.data && data.data.length > 0)
			    		{
			    			var datas = data.data;
			    			for (var i = 0; i < datas.length; i++){
								datas[i].creditTypeName = viewDetail.getEnumName(datas[i].creditType,viewDetail.CREDIT_TYPE);
								datas[i].finalPercentageScoreName = (datas[i].finalPercentageScore)?(parseFloat(datas[i].finalPercentageScore).toFixed(1)):null;
								datas[i].isRed = false;
								if(datas[i].scoreRequire){
									if(datas[i].finalPercentageScore){
										if(datas[i].finalPercentageScore < datas[i].scoreRequire){
											datas[i].isRed = true;
										}
									}else{
										datas[i].isRed = true;
									}
								}
								if(datas[i].isMeetTheMark != 1){
									if(datas[i].creditGot && datas[i].credit && datas[i].creditGot >= datas[i].credit){//二次判断
										;
									}else{
										datas[i].isRed = true;
									}
								}
							}
							$("#courseScoretbodycontent").empty().append($("#courseScoreBodyContentImpl").tmpl(datas));
			    		}
		   				
		   			},false);
	    		}
   				
   			},false);
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
				return r[2];
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
	module.exports = viewDetail; // 根据文件名称一致
	window.viewDetail = viewDetail; // 根据文件名称一致
});