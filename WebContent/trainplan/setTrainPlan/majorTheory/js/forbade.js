/**
 * 开放时间控制
 */
define(function(require, exports, module) {
	var utils = require("basePath/utils/utils");
	var ModuleFlag=require("basePath/enumeration/trainplan/ModuleFlag");

	var forbade = {			
		
		/** ******************* list初始化 开始 ******************* */			
		init : function() {
			// 获取url参数
			var moduleFlag = utils.getUrlParam('ModuleFlag');
			if(moduleFlag==ModuleFlag.SetTrainPlan.value){
				$("#moduleName").html("培养方案维护时间内");		
			}
			else{
				$("#moduleName").html("开课计划维护时间内");		
			}
					
		}
		/** ******************* list初始化 结束 ******************* */
	}
	module.exports = forbade;
	window.majortheory = forbade;
});
