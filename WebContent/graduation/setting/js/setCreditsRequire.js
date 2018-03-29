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
  
	// 变量名跟文件名称一致
	var setCreditsRequire = {
		param : {},
		CREDIT_TYPE:{},
		init : function() {
			setCreditsRequire.param.graduateYear = popup.getData("graduateYear");
			setCreditsRequire.param.departmentId = popup.getData("departmentId");
			setCreditsRequire.param.grade = popup.getData("grade");
			setCreditsRequire.param.majorId = popup.getData("majorId");
			setCreditsRequire.param.majorName = popup.getData("majorName");
			$("#grade").html(setCreditsRequire.param.grade);
			$("#majorName").html(setCreditsRequire.param.majorName);
			setCreditsRequire.CREDIT_TYPE = utils.getEnumValues(creditType);
			
			// 加载属性
        	ajaxData.request(URL_GRADUATION.GRAD_CREDITSET_GETLISTBYMAJOR, setCreditsRequire.param, function(data) {
        		if(data.code==config.RSP_SUCCESS && data.data){
        			var datas = data.data;
        			if (datas.length>0) {
	   					var dataTotal = {
	   						planCredit : 0.0,
	   						openCredit : 0.0,
	   						requireCredit : 0.0,
	   					};
						for (var i = 0; i < datas.length; i++){
							datas[i].creditTypeName = setCreditsRequire.getEnumName(datas[i].creditType,setCreditsRequire.CREDIT_TYPE);
							dataTotal.planCredit += datas[i].planCredit;
							dataTotal.openCredit += datas[i].openCredit;
							dataTotal.requireCredit += datas[i].requireCredit;
						}
						$("#tbodycontent").empty().append($("#bodyContentImpl").tmpl(datas));
						$("#tbodycontent").append($("#bodyContentImplTotal").tmpl(dataTotal));
						
						// 统计
						$(".credit-require").on("change", function() {
							var sum = 0.0;
							$(".credit-require").each(function(){
								var f = parseFloat($(this).val());
								if(!isNaN(f) && isFinite(f)){
									sum += parseFloat($(this).val());
								}
							})
							$(".credit-require-total").val(sum);
						});
					}else{
						popup.okPop("加载失败", function() { });
					}
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
	}
	
	module.exports = setCreditsRequire; // 根据文件名称一致
	window.setCreditsRequire = setCreditsRequire; // 根据文件名称一致
	
});